var controls = 
{
    // Logo values
    centreColour: "FFFFFF",
    discRadius: 0.9,
    waveformEnabled: true,
    waveformStencil: true, // If false assume image-overlay
    waveformImageSrcs: ["./images/jesus009.png", "./images/jesus015.png", "./images/jesus0097.png", "./images/jesus0125.png"],
    waveformSelectedImage: 1, // 0-indexed

    // Control element references
    centreColourPicker: document.getElementById("centreColourPicker"),
    discRadiusSlider: document.getElementById("discRadiusSlider"),
    waveformToggle: document.getElementById("waveformToggle"),
    waveformStencilToggle: document.getElementById("waveformStencilToggle"),
    waveformSelector: document.getElementById("waveformSelector")
};

controls.refresh = function()
{
    // Update values
    centreColour = centreColourPicker.value;
    
    bundle.updateDisc(discRadius, {r: ,g: , b:, a:})
    bundle.refresh();
}

$("#centreColourPicker").spectrum
({
    flat: true,
    showInput: true,
    color: "#fff",
    showAlpha:true,
    preferredFormat: "hex"
});
