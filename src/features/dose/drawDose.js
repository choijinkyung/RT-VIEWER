import {findXY} from "./convertMatrix";
import * as cornerstone from "cornerstone-core";
/**
 * @function doseCheckAndDraw
 * @param {object} dose_value -> Dose value = pixelData * gridscaling
 * @param {string} checkVal_check_dose -> value that Checked Dose Level
 * @description
 * This function deals with
 * 1. Method to confirm that the checked values are for each level
 * 2. Specify color to drawROI
 * 3. Function call
 * <br> 1) name : findXY
 *  <br>   param : dose_value, checkVal_check_dose, color
 */
function doseCheckAndDraw(dose_value, checkVal_check_dose, options = {}) {
    try{
        let color = [];
        color[0] = '#780000';
        color[1] = '#EE4500';
        color[2] = '#FFA500';
        color[3] = '#FFFF00';
        color[4] = '#00FF00';
        color[5] = '#008B00';
        color[6] = '#00FFFF';
        color[7] = '#0000FF';
        color[8] = '#000080';
        color[9] = '#C93F98';

        for (let i = 0; i < checkVal_check_dose.length; i++) {
            if (parseInt(checkVal_check_dose[i]) === 4185) {
                findXY(dose_value, checkVal_check_dose[i], color[0], options);
            } else if (parseInt(checkVal_check_dose[i]) === 4000) {
                findXY(dose_value, checkVal_check_dose[i], color[1], options);
            } else if (parseInt(checkVal_check_dose[i]) === 3920) {
                findXY(dose_value, checkVal_check_dose[i], color[2], options);
            } else if (parseInt(checkVal_check_dose[i]) === 3800) {
                findXY(dose_value, checkVal_check_dose[i], color[3], options);
            } else if (parseInt(checkVal_check_dose[i]) === 3600) {
                findXY(dose_value, checkVal_check_dose[i], color[4], options);
            } else if (parseInt(checkVal_check_dose[i]) === 3200) {
                findXY(dose_value, checkVal_check_dose[i], color[5], options);
            } else if (parseInt(checkVal_check_dose[i]) === 2800) {
                findXY(dose_value, checkVal_check_dose[i], color[6], options);
            } else if (parseInt(checkVal_check_dose[i]) === 2000) {
                findXY(dose_value, checkVal_check_dose[i], color[7], options);
            } else if (parseInt(checkVal_check_dose[i]) === 1200) {
                findXY(dose_value, checkVal_check_dose[i], color[8], options);
            } else if (parseInt(checkVal_check_dose[i]) === 0) {
                findXY(dose_value, checkVal_check_dose[i], color[9], options);
            }
        }
    }catch (err){
        var message = err;
        if (err.exception) {
            message = err.exception;
            alert(message)
        }
    }

}
/**
 * @function drawDose
 * @param {object} Px -> A set of coordinate values converted from x coordinates above the reference dose value to dose -> ct.
 * @param {object} Py ->  A set of coordinate values converted from y coordinates above the reference dose value to dose -> ct.
 * @param {string} color -> Colors assigned to each level
 * @param {number} CT_Di -> x-coordinate of CT pixelspacing
 * @param {number} CT_Dj -> y-coordinate of CT pixelspacing
 * @description
 * This function deals with
 * 1. Draw x,y coordinates received on canvas.
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

function drawDose(segments, color, options = {}) {
    try{
        let canvas = options.canvas || document.getElementById('myCanvas');
        let element = options.element || document.getElementById("dicomImage");
        let ctx = prepareOverlayCanvas(canvas, element);

        if (!ctx || !element) {
            return;
        }

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.25;
        ctx.globalAlpha = 0.85;

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const startPoint = cornerstone.pixelToCanvas(element, segment.start);
            const endPoint = cornerstone.pixelToCanvas(element, segment.end);
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();
        }
        ctx.restore();
    }catch (err){
        var message = err;
        if (err.exception) {
            message = err.exception;
            alert(message)
        }
    }
}

export {drawDose, doseCheckAndDraw}
