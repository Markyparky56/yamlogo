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
        waveformImageSrcs: ["./images/jesus009.png", "./images/jesus0097.png", "./images/jesus0125.png", "./images/jesus015.png"],
        waveformSelectedImage: 3, // 0-indexed    
    },

    // Control element references
    centreColourPicker: document.getElementById("centreColourPicker"),
    discRadiusValueSpan: document.getElementById("radiusValue"),
    waveformToggle: document.getElementById("waveformToggle"),
    waveformStencilToggle: document.getElementById("waveformStencilToggle"),
    waveformSelector: document.getElementById("waveformSelector"),
    waveformStencilInvertToggle: document.getElementById("waveformStencilInvertToggle"),
    waveformStencilAlphaThresholdValueSpan: document.getElementById("stencilAlphaThresholdValue"),
    canvas: document.getElementById("logoCanvas"),
    jsonTextBox: document.getElementById("jsonOptionsTextBox"),
};

$("#centreColourPicker").spectrum
({
    flat: true,
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
    flat: true,
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

controls.radioChange = function()
{
    this.options.waveformSelectedImage = document.querySelector("input[name='waveform']:checked").value;
    controls.refresh();
}

controls.refresh = function()
{
    // Update readouts
    this.discRadiusValueSpan.innerHTML = controls.options.discRadius;
    this.waveformStencilAlphaThresholdValueSpan.innerHTML = controls.options.waveformStencilAlphaThreshold;
    
    // Update options
    this.options.waveformEnabled = waveformToggle.checked;
    this.options.waveformStencil = waveformStencilToggle.checked;
    this.options.waveformStencilInvert = waveformStencilInvertToggle.checked;
    //this.options.waveformSelectedImage = document.querySelector("input[name='waveform']:checked").value;

    // Update the canvas background styling
    this.canvas.style.background = this.options.backgroundColour;
   
    bundle.updateDisc(this.options.discRadius, this.options.centreColour)
    bundle.updateWaveform({
        "type": ((this.options.waveformEnabled) ? ((this.options.waveformStencil) ? "stencil" : "image") : "disabled"),
        "textureNum": this.options.waveformSelectedImage,
        "invert": this.options.waveformStencilInvert,
        "alphaThreshold": this.options.waveformStencilAlphaThreshold
    });

    bundle.refresh();
    updateJsonOptions();
}

function updateJsonOptions()
{
    let jsonString = JSON.stringify({
        "centreColour": controls.options.centreColour,
        "backgroundColour": {_r:controls.options.backgroundColour._r, 
                             _g:controls.options.backgroundColour._g, 
                             _b:controls.options.backgroundColour._b, 
                             _a:controls.options.backgroundColour._a},
        "discRadius": controls.options.discRadius,
        "waveformEnabled": controls.options.waveformEnabled,
        "waveformStencil": controls.options.waveformStencil,
        "waveformStencilInvert": controls.options.waveformStencilInvert,
        "waveformStencilAlphaThreshold": controls.options.waveformStencilAlphaThreshold,
        "waveformSelectedImage": controls.options.waveformSelectedImage
    }, function(key, val) 
    {
        // If it's a number, truncate it so that it's not excessively long
        return val.toFixed ? Number(val.toPrecision(3)) : val;
    });
    controls.jsonTextBox.value = jsonString;
}

function loadJsonOptions()
{
    let jsonString = controls.jsonTextBox.value;
    let options = JSON.parse(jsonString);

    controls.options = options;
    
    // Update html elements with respect to loaded options
    controls.waveformToggle = controls.options.waveformEnabled;
    controls.waveformStencilToggle = controls.options.waveformStencil;
    controls.waveformStencilInvertToggle = controls.options.waveformStencilInvert;

    switch(controls.options.waveformSelectedImage)
    {
        case 0: case '0': $("#jesus009").prop("checked", true); break;
        case 1: case '1': $("#jesus0097").prop("checked", true); break;
        case 2: case '2': $("#jesus0125").prop("checked", true); break;
        case 3: case '3': $("#jesus015").prop("checked", true); break;
        default: console.log("Unrecognised case"); break;
    } 

    controls.discRadiusValueSpan.value = controls.options.discRadius;
    $("#radiusSlider").slider({value: controls.options.discRadius});

    controls.waveformStencilAlphaThresholdValueSpan.innerText = controls.options.waveformStencilAlphaThreshold;
    $("#stencilAlphaThresholdSlider").slider({value: controls.options.waveformStencilAlphaThreshold});

    // Convert the colours back into something spectrum understands
    let centreColour = "rgba(" + controls.options.centreColour.r*255 
                        + "," + controls.options.centreColour.g*255 
                        + "," + controls.options.centreColour.b*255 
                        + "," + controls.options.centreColour.a + ")";
    let backgroundColour = "rgba(" + controls.options.backgroundColour._r
                            + "," + controls.options.backgroundColour._g
                            + "," + controls.options.backgroundColour._b
                            + "," + controls.options.backgroundColour._a + ")";
    $("#centreColourPicker").spectrum("set", centreColour);
    $("#backgroundColourPicker").spectrum("set", backgroundColour);

    controls.refresh();
}

window.onload = function(){
    updateJsonOptions();
    controls.refresh();
};
