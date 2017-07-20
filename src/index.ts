import { DiscClass, ColourRGBA } from "./disc"
import {mat4, vec3} from "gl-matrix"

let GLContext: WebGL2RenderingContext; // Global WebGL2 Context
let horizAspect = 1024.0/1024.0;
let disc: DiscClass;
let discVertBuffer: WebGLBuffer;
let discColourBuffer: WebGLBuffer;
let mvMatrix: mat4;
let perspectiveMatrix: mat4;
let orthoMatrix: mat4;
let circleShaderProgram: WebGLProgram;
let vertexPositonAttribute: number;
let vertexColourAttribute: number;

// Some helper functions
function loadIdentity()
{
    mvMatrix = mat4.identity(mvMatrix);
}

function multMatrix(m: mat4)
{
    mvMatrix = mat4.mul(mvMatrix, mvMatrix, m);
}

function mvTranslate(v: vec3)
{
    mvMatrix = mat4.translate(mvMatrix, mvMatrix, v);
}

function setMatrixUniforms(shaderProgram: WebGLProgram)
{
    let pUniform = GLContext.getUniformLocation(shaderProgram, "uPMatrix");
    //GLContext.uniformMatrix4fv(pUniform, false, perspectiveMatrix);
    GLContext.uniformMatrix4fv(pUniform, false, orthoMatrix);

    let mvUniform = GLContext.getUniformLocation(shaderProgram, "uMVMatrix");
    GLContext.uniformMatrix4fv(mvUniform, false, mvMatrix);
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

    GLContext.clearColor(0.0, 0.0, 0.0, 1.0);
    GLContext.enable(GLContext.DEPTH_TEST);
    GLContext.enable(GLContext.BLEND);
    GLContext.depthFunc(GLContext.LEQUAL);
    GLContext.blendFunc(GLContext.SRC_ALPHA, GLContext.ONE);
    GLContext.clear(GLContext.COLOR_BUFFER_BIT | GLContext.DEPTH_BUFFER_BIT);

    disc = new DiscClass(256, 0.9, {r:1.0, g:1.0, b:1.0, a:1.0});

    initShaders();
    initDiscBuffers(disc);
}

export function updateDisc(radius: number, centreColour: ColourRGBA)
{
    disc = new DiscClass(256, radius, centreColour);
}

// Update waveform

// Update logo text

function initWebGL(canvas: HTMLCanvasElement): WebGL2RenderingContext
{
    let gl: WebGL2RenderingContext = null;
    // Try to grab the standard context
    gl = canvas.getContext("webgl2")

    // If we don't have a GL context give up
    if(!gl)
    {
        alert("Unable to initialise WebGL, your browser may not support it. :(");
    }

    return gl;
}

function initShaders()
{
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

    vertexPositonAttribute = GLContext.getAttribLocation(circleShaderProgram, "aVertexPosition");
    GLContext.enableVertexAttribArray(vertexPositonAttribute);
    vertexColourAttribute = GLContext.getAttribLocation(circleShaderProgram, "aVertexColour");
    GLContext.enableVertexAttribArray(vertexColourAttribute);
}

function getShader(gl:WebGL2RenderingContext, id:string, type:number=null): WebGLShader
{
    let shaderScript: HTMLScriptElement;
    let src: string;
    let shader: WebGLShader;

    shaderScript = <HTMLScriptElement>document.getElementById(id);

    if(!shaderScript)
    {
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
            return null;
        }
    }

    shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    // Check it compiled successfully
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        console.log("An error occured while compiling the shader: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initDiscBuffers(disc: DiscClass)
{
    discVertBuffer = GLContext.createBuffer();
    discColourBuffer = GLContext.createBuffer();

    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, discVertBuffer);
    GLContext.bufferData(GLContext.ARRAY_BUFFER, new Float32Array(disc.vertices), GLContext.STATIC_DRAW);

    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, discColourBuffer);
    GLContext.bufferData(GLContext.ARRAY_BUFFER, new Float32Array(disc.colours), GLContext.STATIC_DRAW);
}

export function refresh()
{
    GLContext.clear(GLContext.COLOR_BUFFER_BIT | GLContext.DEPTH_BUFFER_BIT);

    perspectiveMatrix = mat4.create();
    perspectiveMatrix = mat4.perspective(perspectiveMatrix, 0.698132, horizAspect, 0.1, 100.0);

    orthoMatrix = mat4.create();
    orthoMatrix = mat4.ortho(orthoMatrix, -1.0, 1.0, -1.0, 1.0, 0.1, 100.0);

    mvMatrix = mat4.create();
    loadIdentity();
    let trans: vec3 = vec3.create();
    mvTranslate(vec3.set(trans, 0.0, 0.0, -3.0));

    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, discVertBuffer);
    GLContext.vertexAttribPointer(vertexPositonAttribute, 3, GLContext.FLOAT, false, 0, 0);
    GLContext.bindBuffer(GLContext.ARRAY_BUFFER, discColourBuffer);
    GLContext.vertexAttribPointer(vertexColourAttribute, 4, GLContext.FLOAT, false, 0, 0);
    setMatrixUniforms(circleShaderProgram);
    GLContext.drawArrays(GLContext.TRIANGLE_FAN, 0, disc.vertices.length/3);
}

start();
refresh();
