var controls = 
{
    // Logo values
    options: {
        centreColour: {r: 1, g: 1, b: 1, a:1},
        backgroundColour: {_r: 255, _g: 255, _b: 255, _a: 1},
        discRadius: 0.981,
        waveformEnabled: true,
        waveformStencil: true, // If false assume image-overlay
        waveformStencilInvert: false,
        waveformStencilAlphaThreshold: 0.181,
        waveformImageSrcs: ["images/jesus009.png", "images/jesus0097.png", "images/jesus0125.png", "images/jesus015.png"],
        waveformSelectedImage: 3, // 0-indexed  
        logoColour: {r: 0, g: 0, b: 0, a: 1},
        logoScale: 0.9,
        logoPosition: {x: 0.0, y: 0.0, z: 0.0},
        logoSelectedImage: 1,
    },

    // Control element references
    centreColourPicker: document.getElementById("centreColourPicker"),
    discRadiusValueSpan: document.getElementById("radiusValue"),
    waveformToggle: document.getElementById("waveformToggle"),
    waveformStencilToggle: document.getElementById("waveformStencilToggle"),
    waveformStencilInvertToggle: document.getElementById("waveformStencilInvertToggle"),
    waveformStencilAlphaThresholdValueSpan: document.getElementById("stencilAlphaThresholdValue"),
    canvas: document.getElementById("logoCanvas"),
    jsonTextBox: document.getElementById("jsonOptionsTextBox"),
    logoTextColourPicker: document.getElementById("logoTextColourPicker"),
    logoPosXOffsetSpan: document.getElementById("logoPosXOffset"),
    logoPosYOffsetSpan: document.getElementById("logoPosYOffset"),
    logoScaleSpan: document.getElementById("logoScaleValue"),
};

$("#centreColourPicker").spectrum
({
    flat: false,
    showInput: true,
    color: "#fff",
    showAlpha: true,
    showButtons: false,
    preferredFormat: "rgb",
    move: function(color)
    {
        controls.options.centreColour = { 
            r: (color._r/255), 
            g: (color._g/255), 
            b: (color._b/255), 
            a: color._a // Alpha does not need normalised
        };
        controls.refresh();
    },
    change: function(color)
    {
        controls.options.centreColour = { 
            r: (color._r/255), 
            g: (color._g/255), 
            b: (color._b/255), 
            a: color._a // Alpha does not need normalised
        };
        controls.refresh();
    }
});

$("#backgroundColourPicker").spectrum
({
    flat: false,
    showInput: true,
    color: "#fff",
    showAlpha: true,
    showButtons: false,
    preferredFormat: "rgb",
    move: function(color)
    {
        controls.options.backgroundColour = color;
        controls.refresh();
    },
    change: function(color)
    {
        controls.options.backgroundColour = color;
        controls.refresh();
    }
});

$("#logoTextColourPicker").spectrum
({
    flat: false,
    showInput: true,
    color: "#000",
    showAlpha: true,
    showButtons: false,
    preferredFormat: "rgb",
    move: function(color)
    {
        controls.options.logoColour = { 
            r: (color._r/255), 
            g: (color._g/255), 
            b: (color._b/255), 
            a: color._a // Alpha does not need normalised
        };
        controls.refresh();
    },
    change: function(color)
    {
        controls.options.logoColour = { 
            r: (color._r/255), 
            g: (color._g/255), 
            b: (color._b/255), 
            a: color._a // Alpha does not need normalised
        };
        controls.refresh();
    }
});

$("#radiusSlider").slider
({
    orientation: "horizontal",
    max: 1.0,
    min: 0.0,
    step: 0.001,
    value: 0.981,
    slide: function()
    {
        controls.options.discRadius = $("#radiusSlider").slider("value");
        controls.refresh()
    },
    change: function()
    {
        controls.options.discRadius = $("#radiusSlider").slider("value");
        controls.refresh()
    },
});

$("#stencilAlphaThresholdSlider").slider
({
    orientation: "horizontal",
    max: 1.0,
    min: 0.0,
    step: 0.001,
    value: 0.181,
    slide: function()
    {
        controls.options.waveformStencilAlphaThreshold = $("#stencilAlphaThresholdSlider").slider("value");
        controls.refresh();
    },
    change: function()
    {
        controls.options.waveformStencilAlphaThreshold = $("#stencilAlphaThresholdSlider").slider("value");
        controls.refresh();
    }
});

$("#logoScaleSlider").slider
({
    orientation: "horizontal",
    max: 1.5,
    min: 0.0,
    step: 0.001,
    value: 0.9,
    slide: function()
    {
        controls.options.logoScale = $("#logoScaleSlider").slider("value");
        controls.refresh();
    },
    change: function()
    {
        controls.options.logoScale = $("#logoScaleSlider").slider("value");
        controls.refresh();
    }
});

$("#logoPosXOffsetSlider").slider
({
    orientation: "horizontal",
    max: 1.0,
    min: -1.0,
    step: 0.001,
    value: 0.0,
    slide: function()
    {
        controls.options.logoPosition.x = $("#logoPosXOffsetSlider").slider("value");
        controls.refresh();
    },
    change: function()
    {
        controls.options.logoPosition.x = $("#logoPosXOffsetSlider").slider("value");
        controls.refresh();
    }
});

$("#logoPosYOffsetSlider").slider
({
    orientation: "horizontal",
    max: 1.0,
    min: -1.0,
    step: 0.001,
    value: 0.0,
    slide: function()
    {
        controls.options.logoPosition.y = $("#logoPosYOffsetSlider").slider("value");
        controls.refresh();
    },
    change: function()
    {
        controls.options.logoPosition.y = $("#logoPosYOffsetSlider").slider("value");
        controls.refresh();
    }
});

controls.waveChange = function()
{
    this.options.waveformSelectedImage = document.querySelector("input[name='waveform']:checked").value;
    controls.refresh();
}

controls.logoChange = function()
{
    this.options.logoSelectedImage = document.querySelector("input[name='logo']:checked").value;
    controls.refresh();
}

controls.refresh = function()
{
    // Update readouts
    this.discRadiusValueSpan.innerText = controls.options.discRadius;
    this.waveformStencilAlphaThresholdValueSpan.innerText = controls.options.waveformStencilAlphaThreshold;
    this.logoPosXOffsetSpan.innerText = controls.options.logoPosition.x;
    this.logoPosYOffsetSpan.innerText = controls.options.logoPosition.y;
    this.logoScaleSpan.innerText = controls.options.logoScale;
    
    // Update options
    this.options.waveformEnabled = waveformToggle.checked;
    this.options.waveformStencil = waveformStencilToggle.checked;
    this.options.waveformStencilInvert = waveformStencilInvertToggle.checked;

    // Update the canvas background styling
    this.canvas.style.background = this.options.backgroundColour;
   
    bundle.updateDisc(this.options.discRadius, this.options.centreColour)
    bundle.updateWaveform({
        "type": ((this.options.waveformEnabled) ? ((this.options.waveformStencil) ? "stencil" : "image") : "disabled"),
        "textureNum": this.options.waveformSelectedImage,
        "invert": this.options.waveformStencilInvert,
        "alphaThreshold": this.options.waveformStencilAlphaThreshold
    });
    bundle.updateLogoText({
        "scale": this.options.logoScale,
        "position": this.options.logoPosition,
        "textColour": this.options.logoColour,
        "textureNum": this.options.logoSelectedImage
    });
    bundle.updateBackgroundColour({
        r: this.options.backgroundColour._r/255,
        g: this.options.backgroundColour._g/255,
        b: this.options.backgroundColour._b/255,
        a: this.options.backgroundColour._a,
    })

    bundle.refresh();
    updateJsonOptions();
}

function updateJsonOptions()
{
    let jsonString = JSON.stringify({
        "centreColour": controls.options.centreColour,
        "backgroundColour": {r:controls.options.backgroundColour._r, 
                             g:controls.options.backgroundColour._g, 
                             b:controls.options.backgroundColour._b, 
                             a:controls.options.backgroundColour._a},
        "discRadius": controls.options.discRadius,
        "waveformEnabled": controls.options.waveformEnabled,
        "waveformStencil": controls.options.waveformStencil,
        "waveformStencilInvert": controls.options.waveformStencilInvert,
        "waveformStencilAlphaThreshold": controls.options.waveformStencilAlphaThreshold,
        "waveformSelectedImage": controls.options.waveformSelectedImage,
        "logoColour": controls.options.logoColour,
        "logoScale": controls.options.logoScale,
        "logoPosition": controls.options.logoPosition,
        "logoSelectedImage": controls.options.logoSelectedImage,
    }, function(key, val) 
    {
        // If it's a number, truncate it so that it's not excessively long
        return val.toFixed ? Number(val.toFixed(3)) : val;
    });
    controls.jsonTextBox.value = jsonString;
}

function loadJsonOptions()
{
    let jsonString = controls.jsonTextBox.value;
    let options = JSON.parse(jsonString);

    controls.options = options;
    controls.options.backgroundColour = tinycolor(controls.options.backgroundColour);

    // Update html elements with respect to loaded options
    controls.waveformToggle.checked = controls.options.waveformEnabled;
    controls.waveformStencilToggle.checked = controls.options.waveformStencil;
    controls.waveformStencilInvertToggle.checked = controls.options.waveformStencilInvert;
    
    switch(controls.options.waveformSelectedImage)
    {
        case 0: case '0': $("#jesus009").prop("checked", true); break;
        case 1: case '1': $("#jesus0097").prop("checked", true); break;
        case 2: case '2': $("#jesus0125").prop("checked", true); break;
        case 3: case '3': $("#jesus015").prop("checked", true); break;
        default: console.log("Unrecognised case"); break;
    } 

    switch(controls.options.logoSelectedImage)
    {
        case 0: case '0': $("#logoFull").prop("checked", true); break;
        case 1: case '1': $("#logoFullBlur").prop("checked", true); break;
        case 2: case '2': $("#logoYA").prop("checked", true); break;
        case 3: case '3': $("#logoYABlur").prop("checked", true); break;
    }

    controls.discRadiusValueSpan.innerText = controls.options.discRadius;
    $("#radiusSlider").slider({value: controls.options.discRadius});

    controls.waveformStencilAlphaThresholdValueSpan.innerText = controls.options.waveformStencilAlphaThreshold;
    $("#stencilAlphaThresholdSlider").slider({value: controls.options.waveformStencilAlphaThreshold});

    controls.logoPosXOffsetSpan.innerText = controls.options.logoPosition.x;
    $("#logoPosXOffsetSlider").slider({value: controls.options.logoPosition.x});

    controls.logoPosYOffsetSpan.innerText = controls.options.logoPosition.y;
    $("#logoPosYOffsetSlider").slider({value: controls.options.logoPosition.y});

    controls.logoScaleSpan.innerText = controls.options.logoScale;
    $("#logoScaleSlider").slider({value: controls.options.logoScale});

    // Convert the colours back into something spectrum understands
    let centreColour = "rgba(" + controls.options.centreColour.r*255 
                        + "," + controls.options.centreColour.g*255 
                        + "," + controls.options.centreColour.b*255 
                        + "," + controls.options.centreColour.a + ")";
    let backgroundColour = "rgba(" + controls.options.backgroundColour._r
                            + "," + controls.options.backgroundColour._g
                            + "," + controls.options.backgroundColour._b
                            + "," + controls.options.backgroundColour._a + ")";
    let logoColour = "rgba(" + controls.options.logoColour.r*255
                        + "," + controls.options.logoColour.g*255
                        + "," + controls.options.logoColour.b*255
                        + "," + controls.options.logoColour.a*255 + ")";
    $("#centreColourPicker").spectrum("set", centreColour);
    $("#backgroundColourPicker").spectrum("set", backgroundColour);
    $("#logoTextColourPicker").spectrum("set", logoColour);

    controls.refresh();
}

window.onload = function(){
    updateJsonOptions();
    controls.refresh();
};

function downloadCanvas(link, canvasId, filename)
{
    link.href = document.getElementById(canvasId).toDataURL();
    link.download = filename;
}

document.getElementById("downloadButton").addEventListener("click", function(){
    downloadCanvas(this, "logoCanvas", "yamlogo.png");
}, false);
