import {findXY} from "./doseDataParser";

function checkAndDraw(dose_value, checkVal_check_dose) {
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

}

function drawDose(Px, Py, color) {
    let canvas = document.getElementById('doseCanvas');
    let ctx = canvas.getContext('2d');

    ctx.save();
    //draw path
    ctx.beginPath();
    ctx.moveTo(Px[0], Py[0]);
    for (let i = 1; i < Px.length; i++) {
        ctx.lineTo(Px[i], Py[i]);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.fill();
    ctx.restore();
}

export {drawDose, checkAndDraw}
