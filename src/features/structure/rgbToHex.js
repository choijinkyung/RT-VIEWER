/**
 * @function RGB2Hex
 * @param {string} color -> RGB color
 * @description
 * 1. Convert RGB to HEX
 **/

let RGB2Hex = function (color) {
    let hex = Number(color).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
};
/**
 * @function fullColorHex
 * @param {string} rgb -> RGB color
 * @return "#" + red + green + blue
 * @description
 * 1. Convert RGB to HEX
 *
 * @example
 * //#RrGgBb
 * //#000000
 * //#00ff00
 **/
let fullColorHex = function (rgb) {
    rgb = rgb.split('\\');

    let r = rgb[0];
    let g = rgb[1];
    let b = rgb[2];

    let red = RGB2Hex(r);
    let green = RGB2Hex(g);
    let blue = RGB2Hex(b);

    return "#" + red + green + blue;
};

export default fullColorHex
