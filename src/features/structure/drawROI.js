import pixelCal from "./voxelToPixel";
import fullColorHex from "./rgbToHex.js";
import * as cornerstone from "cornerstone-core";

function parseRgbColor(color) {
    const [r = "0", g = "0", b = "0"] = color.split("\\");
    return {
        r: Number(r),
        g: Number(g),
        b: Number(b),
    };
}
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
function prepareOverlayCanvas(canvas, element) {
    if (!canvas || !element) {
        return null;
    }

    const rect = element.getBoundingClientRect();
    const width = Math.max(Math.round(rect.width), 1);
    const height = Math.max(Math.round(rect.height), 1);
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
    }

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;

    return ctx;
}

function buildContourPoints(pi, pj) {
    const points = [];
    const maxLength = Math.max(pi?.length || 0, pj?.length || 0);

    for (let index = 0; index < maxLength; index += 3) {
        const x = Number(pi[index]);
        const y = Number(pj[index + 1]);

        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            continue;
        }

        points.push({x, y});
    }

    return points;
}

function drawROI(CT_image, struct, color, options = {}) {
    try{
        let px = pixelCal(CT_image, struct);
        let pi = px[0];
        let pj = px[1];
        const points = buildContourPoints(pi, pj);

        let canvas = options.canvas || document.getElementById("myCanvas");
        let element = options.element || document.getElementById("dicomImage");
        let ctx = prepareOverlayCanvas(canvas, element);
        const rgb = parseRgbColor(color);

        if (!ctx || !element || points.length < 2) {
            return;
        }

        ctx.save();
        ctx.beginPath();
        const startPoint = cornerstone.pixelToCanvas(element, points[0]);
        ctx.moveTo(startPoint.x, startPoint.y);

        for (let i = 1; i < points.length; i++) {
            const canvasPoint = cornerstone.pixelToCanvas(element, points[i]);
            ctx.lineTo(canvasPoint.x, canvasPoint.y);
        }

        ctx.closePath();
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.16)`;
        ctx.strokeStyle = fullColorHex(color);
        ctx.lineWidth = 1.5;
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
function reset(options = {}) {
    let canvas = options.canvas || document.getElementById("myCanvas");
    let element = options.element || document.getElementById("dicomImage");
    let ctx = prepareOverlayCanvas(canvas, element);

    if (!ctx || !canvas) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
}


export {drawROI, reset}
