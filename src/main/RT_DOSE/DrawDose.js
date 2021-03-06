import {findXY} from "./ConvertMatrix";
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
function doseCheckAndDraw(dose_value, checkVal_check_dose) {
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
                findXY(dose_value, checkVal_check_dose[i], color[0]);
            } else if (parseInt(checkVal_check_dose[i]) === 4000) {
                findXY(dose_value, checkVal_check_dose[i], color[1]);
            } else if (parseInt(checkVal_check_dose[i]) === 3920) {
                findXY(dose_value, checkVal_check_dose[i], color[2]);
            } else if (parseInt(checkVal_check_dose[i]) === 3800) {
                findXY(dose_value, checkVal_check_dose[i], color[3]);
            } else if (parseInt(checkVal_check_dose[i]) === 3600) {
                findXY(dose_value, checkVal_check_dose[i], color[4]);
            } else if (parseInt(checkVal_check_dose[i]) === 3200) {
                findXY(dose_value, checkVal_check_dose[i], color[5]);
            } else if (parseInt(checkVal_check_dose[i]) === 2800) {
                findXY(dose_value, checkVal_check_dose[i], color[6]);
            } else if (parseInt(checkVal_check_dose[i]) === 2000) {
                findXY(dose_value, checkVal_check_dose[i], color[7]);
            } else if (parseInt(checkVal_check_dose[i]) === 1200) {
                findXY(dose_value, checkVal_check_dose[i], color[8]);
            } else if (parseInt(checkVal_check_dose[i]) === 0) {
                findXY(dose_value, checkVal_check_dose[i], color[9]);
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
function drawDose(Px, Py, color,CT_Di,CT_Dj) {
    try{
        let canvas = document.getElementById('myCanvas');
        let ctx = canvas.getContext('2d');

        ctx.save();
        ctx.scale(1.2+CT_Di,1.2+CT_Dj);
        ctx.translate(-146,-125);

        ctx.beginPath();
        ctx.moveTo(Px[0], Py[0]);
        for (let i = 1; i < Px.length; i++) {
            ctx.lineTo(Px[i], Py[i]);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.fill();
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
