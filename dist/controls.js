var controls = 
{
    // Logo values
    centreColour: {r: 1, g: 1, b: 1, a:1},
    backgroundColour: {_r: 0, _g: 0, _b: 0, _a: 0},
    discRadius: 0.9,
    waveformEnabled: true,
    waveformStencil: true, // If false assume image-overlay
    waveformImageSrcs: ["./images/jesus009.png", "./images/jesus0097.png", "./images/jesus0125.png", "./images/jesus015.png"],
    waveformSelectedImage: 3, // 0-indexed
    waveformStencilInvert: false,
    waveformStencilAlphaThreshold: 0.25,

    // Control element references
    centreColourPicker: document.getElementById("centreColourPicker"),
    discRadiusValueSpan: document.getElementById("radiusValue"),
    waveformToggle: document.getElementById("waveformToggle"),
    waveformStencilToggle: document.getElementById("waveformStencilToggle"),
    waveformSelector: document.getElementById("waveformSelector"),
    waveformStencilInvertToggle: document.getElementById("waveformStencilInvertToggle"),
    waveformStencilAlphaThresholdValueSpan: document.getElementById("stencilAlphaThresholdValue"),
    canvas: document.getElementById("logoCanvas"),
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
        controls.centreColour = { 
            r: color._r/255, 
            g: color._g/255, 
            b: color._b/255, 
            a: color._a // Alpha does not need normalised
        };
        controls.refresh();
    },
    change: function(color)
    {
        controls.centreColour = { 
            r: color._r/255, 
            g: color._g/255, 
            b: color._b/255, 
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
        controls.backgroundColour = color;
        controls.refresh();
    },
    change: function(color)
    {
        controls.backgroundColour = color;
        controls.refresh();
    }
});

$("#radiusSlider").slider
({
    orientation: "horizontal",
    max: 1.0,
    min: 0.0,
    step: 0.001,
    value: 0.9,
    slide: function()
    {
        controls.discRadius = $("#radiusSlider").slider("value");
        controls.refresh()
    },
    change: function()
    {
        controls.discRadius = $("#radiusSlider").slider("value");
        controls.refresh()
    },
});

$("#stencilAlphaThresholdSlider").slider
({
    orientation: "horizontal",
    max: 1.0,
    min: 0.0,
    step: 0.001,
    value: 0.25,
    slide: function()
    {
        controls.waveformStencilAlphaThreshold = $("#stencilAlphaThresholdSlider").slider("value");
        controls.refresh();
    },
    change: function()
    {
        controls.waveformStencilAlphaThreshold = $("#stencilAlphaThresholdSlider").slider("value");
        controls.refresh();
    }
});

controls.refresh = function()
{
    // Update values
    this.discRadiusValueSpan.innerHTML = controls.discRadius;
    this.waveformEnabled = waveformToggle.checked;
    this.waveformStencil = waveformStencilToggle.checked;
    this.waveformStencilInvert = waveformStencilInvertToggle.checked;
    this.waveformSelectedImage = document.querySelector("input[name='waveform']:checked").value;
    this.waveformStencilAlphaThresholdValueSpan.innerHTML = controls.waveformStencilAlphaThreshold;

    // Update the canvas background styling
    this.canvas.style.background = this.backgroundColour;
    
    bundle.updateDisc(this.discRadius, this.centreColour)
    bundle.updateWaveform({
        "type": ((this.waveformEnabled) ? ((this.waveformStencil) ? "stencil" : "image") : "disabled"),
        "textureNum": this.waveformSelectedImage,
        "invert": this.waveformStencilInvert,
        "alphaThreshold": this.waveformStencilAlphaThreshold
    });

    bundle.refresh();
}
