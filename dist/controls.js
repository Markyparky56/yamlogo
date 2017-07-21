var controls = 
{
    // Logo values
    centreColour: {r: 1, g: 1, b: 1, a:1},
    discRadius: 0.9,
    waveformEnabled: true,
    waveformStencil: true, // If false assume image-overlay
    waveformImageSrcs: ["./images/jesus009.png", "./images/jesus015.png", "./images/jesus0097.png", "./images/jesus0125.png"],
    waveformSelectedImage: 1, // 0-indexed

    // Control element references
    centreColourPicker: document.getElementById("centreColourPicker"),
    discRadiusSlider: document.getElementById("discRadiusSlider"),
    discRadiusValueSpan: document.getElementById("radiusValue"),
    waveformToggle: document.getElementById("waveformToggle"),
    waveformStencilToggle: document.getElementById("waveformStencilToggle"),
    waveformSelector: document.getElementById("waveformSelector")
};

$("#centreColourPicker").spectrum
({
    flat: true,
    showInput: true,
    color: "#fff",
    showAlpha:true,
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

controls.refresh = function()
{
    // Update values
    controls.discRadiusValueSpan.innerHTML = controls.discRadius;
    
    bundle.updateDisc(this.discRadius, this.centreColour)
    bundle.refresh();
}
