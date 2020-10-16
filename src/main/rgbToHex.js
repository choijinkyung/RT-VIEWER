var rgbToHex = function (color) {
    var hex = Number(color).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
};

var fullColorHex = function (rgb) {
    rgb = rgb.split('\\');

    let r = rgb[0];
    let g = rgb[1];
    let b = rgb[2];

    var red = rgbToHex(r);
    var green = rgbToHex(g);
    var blue = rgbToHex(b);

    return "#" + red + green + blue;
};

export default fullColorHex
