import { ColourRGBA } from "./interfaces"
import { DiscClass } from "./disc"
import { SquareClass } from "./square"
import { mat4, vec3 } from "gl-matrix"

let GLContext: WebGL2RenderingContext; // Global WebGL2 Context
let ExtAniso: EXT_texture_filter_anisotropic;
let horizAspect = 1024.0/1024.0;
let disc: DiscClass;
let waveformSquare: SquareClass;
let logoTextSquare: SquareClass;

let mvMatrix: mat4;
let perspectiveMatrix: mat4;
let orthoMatrix: mat4;
let logoScaleMatrix: mat4;
let logoPosition: vec3;

let circleShaderProgram: WebGLProgram;
let textureShaderProgram: WebGLProgram;
let stencilTextureShaderProgram: WebGLProgram;
let logoTextShaderProgram: WebGLProgram;

let circleVertexPositonAttribute: number;
let circleVertexColourAttribute: number;
let stencilTextureVertexPositionAttribute: number;
let stencilTextureTexCoordAttribute: number;
let textureVertexPositionAttribute: number;
let textureTexCoordAttribute: number;
let logoTextVertexPositionAttribute: number;
let logoTextTexCoordAttribute: number;

let discVertBuffer: WebGLBuffer;
let discColourBuffer: WebGLBuffer;
let waveformVertBuffer: WebGLBuffer;
let waveformTexCoordBuffer: WebGLBuffer;
let logoTextVertBuffer: WebGLBuffer;
let logoTextTexCoordBuffer: WebGLBuffer;

let waveformImgs: HTMLImageElement[];
let waveformTextures: WebGLTexture[];
let waveformTexturesLoaded: boolean[];

let logoTextImgs: HTMLImageElement[];
let logoTextTextures: WebGLTexture[];
let logoTextTexturesLoaded: boolean[];

let selectedWaveformTexture: number;
let selectedLogoTextTexture: number;
let stencilTextureInvert: number; // Can't have booleans, so treat non-zero values as true
let stencilTextureAlphaThreshold: number;
let logoTextColour: ColourRGBA;

enum waveformDisplayType
{
    Stencil,
    Image,
    Disabled
};
interface waveformControls
{
    type: string; // "stencil", "image" or "disabled"
    textureNum: number; // 0-3
    invert: boolean;
    alphaThreshold: number;
}
let waveformType: waveformDisplayType;
interface logoTextControls
{
    scale: number;
    position: {x:number, y:number, z:number};
    textColour: ColourRGBA;
    textureNum: number; // 0-3
}

// Some helper functions
function loadIdentity()
{
    mvMatrix = mat4.identity(mvMatrix);
}

function dupMat4(m: mat4): mat4
{
    let d = mat4.clone(m);
    return d;
}

function multMatrix(m: mat4)
{
    mvMatrix = mat4.mul(mvMatrix, mvMatrix, m);
}

function mvTranslate(v: vec3)
{
    mvMatrix = mat4.translate(mvMatrix, mvMatrix, v);
}

let mvMatrixStack: mat4[] = [];

function mvPushMatrix(m: mat4 = null)
{
    if(m)
    {
        mvMatrixStack.push(mat4.clone(m));
        mvMatrix = mat4.clone(m);
    }
    else
    {
        mvMatrixStack.push(mat4.clone(mvMatrix));
    }
}

function mvPopMatrix()
{
    if(!mvMatrixStack.length)
    {
        throw("Can't pop from an empty matrix stack!");
    }

    mvMatrix = mvMatrixStack.pop();
    return mvMatrix;
}

function mvRotate(angle: number, v: vec3)
{
    let inRads = angle * Math.PI / 180.0;
    let m: mat4;
    m = mat4.fromRotation(m, inRads, v);
    multMatrix(m);
}

function setMatrixUniforms(shaderProgram: WebGLProgram)
{
    let pUniform = GLContext.getUniformLocation(shaderProgram, "uPMatrix");
    //GLContext.uniformMatrix4fv(pUniform, false, perspectiveMatrix);
    GLContext.uniformMatrix4fv(pUniform, false, orthoMatrix);

    let mvUniform = GLContext.getUniformLocation(shaderProgram, "uMVMatrix");
    GLContext.uniformMatrix4fv(mvUniform, false, mvMatrix);
}

function setStencilTextureShaderUniforms()
{
    GLContext.activeTexture(GLContext.TEXTURE0);
    GLContext.bindTexture(GLContext.TEXTURE_2D, waveformTextures[selectedWaveformTexture]);
    GLContext.uniform1i(GLContext.getUniformLocation(stencilTextureShaderProgram, "tex"), 0);

    let invertLoc = GLContext.getUniformLocation(stencilTextureShaderProgram, "uInvert");
    GLContext.uniform1i(invertLoc, stencilTextureInvert);

    let alphaThresholdLoc = GLContext.getUniformLocation(stencilTextureShaderProgram, "uAlphaThreshold");
    GLContext.uniform1f(alphaThresholdLoc, stencilTextureAlphaThreshold);
}

function setLogoTextShaderUniforms()
{
    GLContext.activeTexture(GLContext.TEXTURE0); 
    GLContext.bindTexture(GLContext.TEXTURE_2D, logoTextTextures[selectedLogoTextTexture]);
    GLContext.uniform1i(GLContext.getUniformLocation(logoTextShaderProgram, "tex"), 0);
    
    let textColourLoc = GLContext.getUniformLocation(logoTextShaderProgram, "uTextColour");
    GLContext.uniform4f(textColourLoc, logoTextColour.r, logoTextColour.g, logoTextColour.b, logoTextColour.a);
}

function start()
{
    let canvas = <HTMLCanvasElement>document.getElementById("logoCanvas");

    // Init the GL Context
    GLContext = initWebGL(canvas);

    // Only continue if WebGL is available and working
    if(!GLContext)
    {
        return;
    }

    //EXT_texture_filter_anisotropic
    ExtAniso = GLContext.getExtension("EXT_texture_filter_anisotropic");

    GLContext.clearColor(0.0, 0.0, 0.0, 1.0);
    GLContext.enable(GLContext.DEPTH_TEST);
    GLContext.enable(GLContext.BLEND);
    GLContext.depthFunc(GLContext.LEQUAL);
    //GLContext.blendFunc(GLContext.SRC_ALPHA, GLContext.ONE_MINUS_SRC_ALPHA);
    GLContext.blendFunc(GLContext.ONE, GLContext.ONE_MINUS_SRC_ALPHA);
    GLContext.clear(GLContext.COLOR_BUFFER_BIT | GLContext.DEPTH_BUFFER_BIT);

    disc = new DiscClass(256, 0.9, {r:1.0, g:1.0, b:1.0, a:1.0});
    initShaders();
    initDiscBuffers(disc);

    waveformImgs = [];
    waveformTextures = [];
    waveformTexturesLoaded = [];
    logoTextImgs = [];
    logoTextTextures = [];
    logoTextTexturesLoaded = [];
    waveformSquare = new SquareClass;
    logoTextSquare = new SquareClass;
    waveformType = waveformDisplayType.Stencil;
    selectedWaveformTexture = 3;
    selectedLogoTextTexture = 1;
    stencilTextureInvert = 0.0;
    stencilTextureAlphaThreshold = 0.25;
    logoScaleMatrix = mat4.create();
    logoScaleMatrix = mat4.scale(logoScaleMatrix, logoScaleMatrix, [0.7, 0.7, 1.0]);
    logoPosition = vec3.fromValues(0.0, 0.0, 0.0);
    logoTextColour = {r:0, g:0, b:0, a:1};
    initTextures();
    initSquareBuffers(waveformSquare);
    initLogoTextBuffers(logoTextSquare);
}

export function updateDisc(radius: number, centreColour: ColourRGBA)
{
    if(radius == disc.radius) // No need to regenerate all the triangles
    {
        disc.UpdateCentreColour(centreColour);
    }
    else
    {
        disc = new DiscClass(360, radius, centreColour);
    }
    initDiscBuffers(disc);
}

// Update waveform
export function updateWaveform(controls: waveformControls)
{
    if(controls.type == "stencil")
    {
        waveformType = waveformDisplayType.Stencil;
    }
    else if(controls.type == "image")
    {
        waveformType = waveformDisplayType.Image;
    }
    else
    {
        waveformType = waveformDisplayType.Disabled;
    }
    selectedWaveformTexture = controls.textureNum;
    if(controls.invert)
    {
        stencilTextureInvert = 1.0;
    }
    else
    {
        stencilTextureInvert = 0.0;
    }
    stencilTextureAlphaThreshold = controls.alphaThreshold;    
}

// Update logo text
export function updateLogoText(controls: logoTextControls)
{
    //console.log(controls.position);
    logoScaleMatrix = mat4.scale(logoScaleMatrix, mat4.create(), [controls.scale, controls.scale, 1.0]);
    logoPosition = vec3.fromValues(controls.position.x, controls.position.y, controls.position.z);
    logoTextColour = controls.textColour;
    selectedLogoTextTexture = controls.textureNum;
}

function initWebGL(canvas: HTMLCanvasElement): WebGL2RenderingContext
{
    let gl: WebGL2RenderingContext = null;
    // Try to grab the standard context
    gl = canvas.getContext("webgl2", 
                          {  antialias: true
                           , depth: true
                           , alpha: true
                           , stencil: true
                           , premultipliedAlpha: false}
                    );

    // If we don't have a GL context give up
    if(!gl)
    {
        alert("Unable to initialise WebGL, your browser may not support it. :(");
    }

    return gl;
}

function initShaders()
{
    // Shader for drawing the coloured circle/disc
    let circleFragmentShader: WebGLShader = getShader(GLContext, "circle-fs");
    let circleVertexShader: WebGLShader = getShader(GLContext, "circle-vs");

    // Create the circle shader program
    circleShaderProgram = GLContext.createProgram();
    GLContext.attachShader(circleShaderProgram, circleFragmentShader);
    GLContext.attachShader(circleShaderProgram, circleVertexShader);
    GLContext.linkProgram(circleShaderProgram);

    // If creating the shader program fails, alert
    if(!GLContext.getProgramParameter(circleShaderProgram, GLContext.LINK_STATUS))
    {   
        console.log("Unable to initialise the shader program: " + GLContext.getProgramInfoLog(circleShaderProgram));
    }

    GLContext.useProgram(circleShaderProgram);

    circleVertexPositonAttribute = GLContext.getAttribLocation(circleShaderProgram, "aVertexPosition");
    GLContext.enableVertexAttribArray(circleVertexPositonAttribute);
    circleVertexColourAttribute = GLContext.getAttribLocation(circleShaderProgram, "aVertexColour");
    GLContext.enableVertexAttribArray(circleVertexColourAttribute);

    GLContext.useProgram(null);

    // Shader for drawing a simple textured object, no lighting
    let textureFragmentShader: WebGLShader = getShader(GLContext, "texture-fs");
    let textureVertexShader: WebGLShader = getShader(GLContext, "texture-vs");

    // Create the texture shader program
    textureShaderProgram = GLContext.createProgram();
    GLContext.attachShader(textureShaderProgram, textureFragmentShader);
    GLContext.attachShader(textureShaderProgram, textureVertexShader);
    GLContext.linkProgram(textureShaderProgram);

    // If creating the shader program fails, alert
    if(!GLContext.getProgramParameter(textureShaderProgram, GLContext.LINK_STATUS))
    {
        console.log("Unable to initialise the shader program: " + GLContext.getProgramInfoLog(textureShaderProgram));
    }

    GLContext.useProgram(textureShaderProgram);

    textureVertexPositionAttribute = GLContext.getAttribLocation(textureShaderProgram, "aVertexPosition");
    GLContext.enableVertexAttribArray(textureVertexPositionAttribute);
    textureTexCoordAttribute = GLContext.getAttribLocation(textureShaderProgram, "aTexCoord");
    GLContext.enableVertexAttribArray(textureTexCoordAttribute);

    GLContext.useProgram(null);

    // Shader for drawing a texture into the stencil buffer
    let stencilTextureFragmentShader: WebGLShader = getShader(GLContext, "stenciltexture-fs");
    let stencilTextureVertexShader: WebGLShader = getShader(GLContext, "stenciltexture-vs");

    // Create the texture shader program
    stencilTextureShaderProgram = GLContext.createProgram();
    GLContext.attachShader(stencilTextureShaderProgram, stencilTextureFragmentShader);
    GLContext.attachShader(stencilTextureShaderProgram, stencilTextureVertexShader);
    GLContext.linkProgram(stencilTextureShaderProgram);

    // If creating the shader program fails, alert
    if(!GLContext.getProgramParameter(stencilTextureShaderProgram, GLContext.LINK_STATUS))
    {
        console.log("Unable to initialise the shader program: " + GLContext.getProgramInfoLog(stencilTextureShaderProgram));
    }

    GLContext.useProgram(stencilTextureShaderProgram);

    stencilTextureVertexPositionAttribute = GLContext.getAttribLocation(stencilTextureShaderProgram, "aVertexPosition");
    GLContext.enableVertexAttribArray(stencilTextureVertexPositionAttribute);
    stencilTextureTexCoordAttribute = GLContext.getAttribLocation(stencilTextureShaderProgram, "aTexCoord");
    GLContext.enableVertexAttribArray(stencilTextureTexCoordAttribute);

    GLContext.useProgram(null);

    // Shader for drawing the logo text in a specified colour, blending with alpha from the texture
    let logoTextFragmentShader: WebGLShader = getShader(GLContext, "logotext-fs");
    let logoTextVertexShader: WebGLShader = getShader(GLContext, "logotext-vs");

    // Create the logo text shader program
    logoTextShaderProgram = GLContext.createProgram();
    GLContext.attachShader(logoTextShaderProgram, logoTextFragmentShader);
    GLContext.attachShader(logoTextShaderProgram, logoTextVertexShader);
    GLContext.linkProgram(logoTextShaderProgram);

    // If creating the shader program fails, alert
    if(!GLContext.getProgramParameter(logoTextShaderProgram, GLContext.LINK_STATUS))
    {
        console.log("Unable to initialise the shader program: " + GLContext.getProgramInfoLog(logoTextShaderProgram));
    }

    GLContext.useProgram(logoTextShaderProgram);

    logoTextVertexPositionAttribute = GLContext.getAttribLocation(logoTextShaderProgram, "aVertexPosition");
    GLContext.enableVertexAttribArray(logoTextVertexPositionAttribute);
    logoTextTexCoordAttribute = GLContext.getAttribLocation(logoTextShaderProgram, "aTexCoord");
    GLContext.enableVertexAttribArray(logoTextTexCoordAttribute);

    GLContext.useProgram(null);
}

function getShader(gl:WebGL2RenderingContext, id:string, type:number=null): WebGLShader
{
    let shaderScript: HTMLScriptElement;
    let src: string;
    let shader: WebGLShader;

    shaderScript = <HTMLScriptElement>document.getElementById(id);

    if(!shaderScript)
    {
        alert("Cannot get shader by id");
        return null;
    }

    src = shaderScript.text;

    if(!type)
    {
        if(shaderScript.type == "x-shader/x-fragment")
        {
            type = gl.FRAGMENT_SHADER;
        }
        else if(shaderScript.type == "x-shader/x-vertex")
        {
            type = gl.VERTEX_SHADER;
        }
        else
        {
            alert("Shader type not recognised");
            return null;
        }
    }

    shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    // Check it compiled successfully
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        console.log("An error occured while compiling the shader (" + id + "): " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initDiscBuffers(disc: DiscClass)
{
    if(discVertBuffer === undefined) discVertBuffer = GLContext.createBuffer();
    if(discColourBuffer === undefined) discColourBuffer = GLContext.createBuffer();

    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, discVertBuffer);
    GLContext.bufferData(GLContext.ARRAY_BUFFER, new Float32Array(disc.vertices), GLContext.STATIC_DRAW);

    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, discColourBuffer);
    GLContext.bufferData(GLContext.ARRAY_BUFFER, new Float32Array(disc.colours), GLContext.STATIC_DRAW);
}

function initSquareBuffers(square: SquareClass)
{
    if(waveformVertBuffer === undefined) waveformVertBuffer = GLContext.createBuffer();
    if(waveformTexCoordBuffer === undefined) waveformTexCoordBuffer = GLContext.createBuffer();

    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, waveformVertBuffer);
    GLContext.bufferData(GLContext.ARRAY_BUFFER, new Float32Array(square.vertices), GLContext.STATIC_DRAW);

    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, waveformTexCoordBuffer);
    GLContext.bufferData(GLContext.ARRAY_BUFFER, new Float32Array(square.texCoords), GLContext.STATIC_DRAW);
}

function initLogoTextBuffers(square: SquareClass)
{
    if(logoTextVertBuffer === undefined) logoTextVertBuffer = GLContext.createBuffer();
    if(logoTextTexCoordBuffer === undefined) logoTextTexCoordBuffer = GLContext.createBuffer();

    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, logoTextVertBuffer);
    GLContext.bufferData(GLContext.ARRAY_BUFFER, new Float32Array(square.vertices), GLContext.STATIC_DRAW);

    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, logoTextTexCoordBuffer);
    GLContext.bufferData(GLContext.ARRAY_BUFFER, new Float32Array(square.texCoords), GLContext.STATIC_DRAW);
}

function initTextures()
{
    let waveformImageSrcs = ["./images/jesus009.png", "./images/jesus0097.png", "./images/jesus0125.png", "./images/jesus015.png"];
    for(let i = 0; i < waveformImageSrcs.length; i++)
    {
        waveformImgs.push(new Image());
        waveformTextures.push(GLContext.createTexture());
        waveformImgs[i].onload = function() { handleTextureLoad(waveformImgs[i], waveformTextures[i], waveformTexturesLoaded, i); }
        waveformImgs[i].src = waveformImageSrcs[i];
        waveformTexturesLoaded.push(false);
    }
    let logoTextImageSrcs = ["./images/logomaintext-full.png", "./images/logomaintext-full-blurred.png", "./images/logomaintext-ya.png", "./images/logomaintext-ya-blurred.png"];
    for(let i = 0; i < logoTextImageSrcs.length; i++)
    {
        logoTextImgs.push(new Image());
        logoTextTextures.push(GLContext.createTexture());
        logoTextImgs[i].onload = function() { handleTextureLoad(logoTextImgs[i], logoTextTextures[i], logoTextTexturesLoaded, i); }
        logoTextImgs[i].src = logoTextImageSrcs[i];
        logoTextTexturesLoaded.push(false);
    }
}

function handleTextureLoad(image: HTMLImageElement, texture: WebGLTexture, loadedArray: boolean[], num: number)
{
    GLContext.bindTexture(GLContext.TEXTURE_2D, texture);
    GLContext.pixelStorei(GLContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    GLContext.texImage2D(GLContext.TEXTURE_2D, 0, GLContext.RGBA, image.width, image.height, 0, GLContext.RGBA, GLContext.UNSIGNED_BYTE, image);
    GLContext.texParameterf(GLContext.TEXTURE_2D, ExtAniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);
    GLContext.texParameteri(GLContext.TEXTURE_2D, GLContext.TEXTURE_MAG_FILTER, GLContext.LINEAR);
    GLContext.texParameteri(GLContext.TEXTURE_2D, GLContext.TEXTURE_MIN_FILTER, GLContext.LINEAR_MIPMAP_NEAREST);
    GLContext.texParameteri(GLContext.TEXTURE_2D, GLContext.TEXTURE_WRAP_S, GLContext.CLAMP_TO_EDGE);
    GLContext.texParameteri(GLContext.TEXTURE_2D, GLContext.TEXTURE_WRAP_T, GLContext.CLAMP_TO_EDGE);
    GLContext.generateMipmap(GLContext.TEXTURE_2D);
    GLContext.bindTexture(GLContext.TEXTURE_2D, null);
    loadedArray[num] = true;
    console.log("Texture " + image.src.split('/').pop() + " loaded");
}

function drawRainbowDisc()
{
    if(waveformType == waveformDisplayType.Stencil)
    {
        GLContext.stencilMask(0xFF);
        GLContext.stencilFunc(GLContext.EQUAL, 1, 0xFF);
    }

    GLContext.useProgram(circleShaderProgram);
    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, discVertBuffer);
    GLContext.vertexAttribPointer(circleVertexPositonAttribute, 3, GLContext.FLOAT, false, 0, 0);
    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, discColourBuffer);
    GLContext.vertexAttribPointer(circleVertexColourAttribute, 4, GLContext.FLOAT, false, 0, 0);
    setMatrixUniforms(circleShaderProgram);
    GLContext.drawArrays(GLContext.TRIANGLE_FAN, 0, disc.vertices.length/3);
    GLContext.useProgram(null);

    if(waveformType == waveformDisplayType.Stencil)
    {
        GLContext.stencilMask(0x00);
    }
}

function drawStencilWaveform()
{
    // Only write to the stencil buffer, not the colour or depth buffer
    GLContext.enable(GLContext.STENCIL_TEST);
    GLContext.colorMask(false, false, false, false);
    GLContext.depthMask(false);
    GLContext.stencilFunc(GLContext.ALWAYS, 1, 0xFF);
    GLContext.stencilOp(GLContext.REPLACE, GLContext.REPLACE, GLContext.REPLACE);
    GLContext.stencilMask(0xFF);

    GLContext.useProgram(stencilTextureShaderProgram);
    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, waveformVertBuffer);
    GLContext.vertexAttribPointer(stencilTextureVertexPositionAttribute, 3, GLContext.FLOAT, false, 0, 0);
    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, waveformTexCoordBuffer);
    GLContext.vertexAttribPointer(stencilTextureTexCoordAttribute, 2, GLContext.FLOAT, false, 0, 0);
    
    setMatrixUniforms(stencilTextureShaderProgram);
    setStencilTextureShaderUniforms();

    GLContext.drawArrays(GLContext.TRIANGLE_STRIP, 0, waveformSquare.vertices.length/3);
    GLContext.useProgram(null);

    GLContext.colorMask(true, true, true, true);
    GLContext.depthMask(true);
    GLContext.stencilMask(0x00);
    GLContext.stencilFunc(GLContext.EQUAL, 0, 0xFF);
    GLContext.stencilOp(GLContext.KEEP, GLContext.KEEP, GLContext.KEEP);
}

function drawImageWaveform()
{
    GLContext.useProgram(textureShaderProgram);
    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, waveformVertBuffer);
    GLContext.vertexAttribPointer(textureVertexPositionAttribute, 3, GLContext.FLOAT, false, 0, 0);
    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, waveformTexCoordBuffer);
    GLContext.vertexAttribPointer(textureTexCoordAttribute, 2, GLContext.FLOAT, false, 0, 0);
    GLContext.activeTexture(GLContext.TEXTURE0);
    GLContext.bindTexture(GLContext.TEXTURE_2D, waveformTextures[selectedWaveformTexture]);
    GLContext.uniform1i(GLContext.getUniformLocation(textureShaderProgram, "tex"), 0);
    
    setMatrixUniforms(textureShaderProgram);
    GLContext.drawArrays(GLContext.TRIANGLE_STRIP, 0, waveformSquare.vertices.length/3);
    GLContext.useProgram(null);
}

function drawLogoText()
{
    GLContext.useProgram(logoTextShaderProgram);
    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, logoTextVertBuffer);
    GLContext.vertexAttribPointer(logoTextVertexPositionAttribute, 3, GLContext.FLOAT, false, 0, 0);
    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, logoTextTexCoordBuffer);
    GLContext.vertexAttribPointer(logoTextTexCoordAttribute, 2, GLContext.FLOAT, false, 0, 0);
    
    setLogoTextShaderUniforms();

    // Scale the logo as-per settings
    mvPushMatrix();
    loadIdentity();
    let trans: vec3 = vec3.create();
    mvTranslate(vec3.set(trans, 0.0, 0.0, -3.0));      
    mvTranslate(logoPosition);
    console.log(mvMatrix);
    multMatrix(logoScaleMatrix);
    console.log(mvMatrix);
    setMatrixUniforms(logoTextShaderProgram);

    GLContext.drawArrays(GLContext.TRIANGLE_STRIP, 0, logoTextSquare.vertices.length/3);
    GLContext.useProgram(null);

    mvPopMatrix();
}

export function refresh()
{
    if(!rendererReady) return;

    GLContext.clearColor(1,1,1,0);
    GLContext.clear(GLContext.COLOR_BUFFER_BIT | GLContext.DEPTH_BUFFER_BIT | GLContext.STENCIL_BUFFER_BIT);

    perspectiveMatrix = mat4.create();
    perspectiveMatrix = mat4.perspective(perspectiveMatrix, 0.698132, horizAspect, 0.1, 100.0);

    orthoMatrix = mat4.create();
    orthoMatrix = mat4.ortho(orthoMatrix, -1.0, 1.0, -1.0, 1.0, 0.1, 100.0);

    mvMatrix = mat4.create();
    loadIdentity();
    let trans: vec3 = vec3.create();
    mvTranslate(vec3.set(trans, 0.0, 0.0, -3.0));    

    // If the waveform is in stencil mode draw it into the stencil buffer now
    if(waveformType == waveformDisplayType.Stencil)
    {
        drawStencilWaveform();
    }

    // Draw the Rainbow Disc
    drawRainbowDisc();

    // If the waveform is in stencil mode, clear the stencil buffer now
    if(waveformType == waveformDisplayType.Stencil)
    {
        GLContext.clear(GLContext.STENCIL_BUFFER_BIT);
        GLContext.disable(GLContext.STENCIL_TEST);
    }

    // Else, draw the waveform as an image over the disc
    if(waveformType == waveformDisplayType.Image)
    { 
        drawImageWaveform();
    }

    // Draw the logo text over the top
    drawLogoText();

}

start();

let rendererReady = false;
function imagesReadyCheck()
{
    waveformTexturesLoaded.forEach(function(item){rendererReady = item;})
    logoTextTexturesLoaded.forEach(function(item){rendererReady = item;})
    if(rendererReady)
    {
        console.log("All textures loaded!");
        clearInterval(readyCheck);
        refresh();
    }
}
let readyCheck = setInterval(function(){imagesReadyCheck()}, 1000/60);
