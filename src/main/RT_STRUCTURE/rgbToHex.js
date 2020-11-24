let rgbToHex = function (color) {
    let hex = Number(color).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
};

let fullColorHex = function (rgb) {
    rgb = rgb.split('\\');

    let r = rgb[0];
    let g = rgb[1];
    let b = rgb[2];

    let red = rgbToHex(r);
    let green = rgbToHex(g);
    let blue = rgbToHex(b);

    return "#" + red + green + blue;
};

export default fullColorHex
