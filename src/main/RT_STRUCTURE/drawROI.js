import pixelCal from "./voxel2pixel";
import fullColorHex from "./rgbToHex.js";
/**
 * @function drawROI
 * @param {object} CT_image -> CT image corresponding to the current z coordinate
 * @param {string} struct -> Corresponding to current CT image, contour data of checked ROI
 * @param {string} color -> contouring color
 * @description
 * This function deals with
 * 1. Convert to CT->canvas coordinates through pixelCal function.
 * 2. Draw the corresponding ROI.
 * 3. Function call
 * <br> 1)name : pixelCal
 * <br> param : image, struct
 * <br> 2)name : fullColorHex
 * <br> param : color
 */
function drawROI(CT_image, struct, color) {
    try{
        let px = pixelCal(CT_image, struct);
        let pi = px[0];
        let pj = px[1];

        let canvas = document.getElementById("myCanvas");
        let ctx = canvas.getContext("2d");

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pi[0], pj[1]);
        for (let i = 1; i <= pi.length * 3; i++) {
            if (i % 3 === 0) {
                ctx.lineTo(pi[i], pj[i + 1]);
            }
        }
        ctx.closePath();
        ctx.fillStyle = fullColorHex(color);
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }catch(err){
        var message = err;
        if (err.exception) {
            message = err.exception;
            alert(message)
        }
    }

}

/**
 * @function reset
 * @description
 * This function deals with
 * 1. Erase the canvas.
 * 2. Control the canvas from overlapping during mouse wheel events
 */
function reset() {
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 512, 512);
}


export {drawROI, reset}
