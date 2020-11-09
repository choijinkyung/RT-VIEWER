import {findXY} from "./doseDataParser";

let checkVal_check_dose = [];

function getCheckValue(checkVal_check) {
    checkVal_check_dose = checkVal_check;
}

function checkAndDraw(dose_value) {
    let color = [];
    color[0] = '#00ffff';
    color[1] = '#ff00ff';
    color[2] = '#ffff00';
    color[3] = '#44ff00';
    color[4] = '#ffcc33';
    color[5] = '#2100ff';

    for (let i = 0; i < checkVal_check_dose.length; i++) {
        checkVal_check_dose[i] = parseInt(checkVal_check_dose[i]);
    }
    for (let i = 0; i < checkVal_check_dose.length; i++) {
        if (checkVal_check_dose[i] === 4677) {
            findXY(dose_value, checkVal_check_dose[i], color[0]);
        } else if (checkVal_check_dose[i] === 4000) {
            findXY(dose_value, checkVal_check_dose[i], color[1]);
        } else if (checkVal_check_dose[i] === 3200) {
            findXY(dose_value, checkVal_check_dose[i], color[2]);
        } else if (checkVal_check_dose[i] === 2400) {
            findXY(dose_value, checkVal_check_dose[i], color[3]);
        } else if (checkVal_check_dose[i] === 1600) {
            findXY(dose_value, checkVal_check_dose[i], color[4]);
        } else if (checkVal_check_dose[i] === 800) {
            findXY(dose_value, checkVal_check_dose[i], color[5]);
        }
    }

}

function drawDose(Px, Py, color) {

    let canvas = document.getElementById('doseCanvas');
    let ctx = canvas.getContext('2d');

    //draw path
    ctx.beginPath();
    for (let i = 0; i < Px.length; i++) {
        ctx.lineTo(Px[i], Py[i]);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.fill();

}

export {drawDose, checkAndDraw, getCheckValue}
