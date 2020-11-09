import * as cornerstone from "cornerstone-core";
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import dicomParser from "dicom-parser";
import {dose_pixel_Data_parse} from "./dosePixelDataParse";

let dataSet;
let Rows, Columns, Number_of_Frames;

function doseFile(file) {
    const imageId = cornerstoneWadoImageLoader.wadouri.fileManager.add(file);

    let reader = new FileReader();
    reader.onload = function (file) {
        let arrayBuffer = reader.result;
        // Here we have the file data as an ArrayBuffer.  dicomParser requires as input a
        // Uint8Array so we create that here
        let byteArray = new Uint8Array(arrayBuffer);

        // set a short timeout to do the parse so the DOM has time to update itself with the above message
        setTimeout(function () {
            // Invoke the paresDicom function and get back a DataSet object with the contents
            try {

                dataSet = dicomParser.parseDicom(byteArray);
                Rows = parseFloat(dataSet.uint16('x00280010'));
                Columns = parseFloat(dataSet.uint16('x00280011'));
                Number_of_Frames = parseFloat(dataSet.string('x00280008'));


                doseData(imageId, dataSet);
            } catch (err) {
                var message = err;
                if (err.exception) {
                    message = err.exception;
                }
            }
        }, 10);
    };
    reader.readAsArrayBuffer(file);

    return dataSet;
}

let imgOriArr = [];
let imgPosArr = [];
let pixelSpaceArr = [];

function doseData(imageId, dataSet) {

    let img = 0;

    cornerstone.loadImage(imageId).then(function (image) {
        if (image.data.string('x00080016') === '1.2.840.10008.5.1.4.1.1.481.2') {
            let dose_pixelSpacing = 0;
            pixelSpaceArr = [];

            dose_pixelSpacing = image.data.string('x00280030');
            dose_pixelSpacing = dose_pixelSpacing.toString();
            pixelSpaceArr = dose_pixelSpacing.split("\\");

            let imgPos = image.data.string('x00200032');
            imgPosArr = imgPos.split("\\");

            let imgOri = image.data.string('x00200037');
            imgOri = imgOri.toString();
            imgOriArr = imgOri.split("\\");


            dose_pixel_Data_parse(image, dataSet);
        }
        img = image;
    });

}


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
            checkXY(dose_value, checkVal_check_dose[i], color[0]);
        } else if (checkVal_check_dose[i] === 4000) {
            checkXY(dose_value, checkVal_check_dose[i], color[1]);
        } else if (checkVal_check_dose[i] === 3200) {
            checkXY(dose_value, checkVal_check_dose[i], color[2]);
        } else if (checkVal_check_dose[i] === 2400) {
            checkXY(dose_value, checkVal_check_dose[i], color[3]);
        } else if (checkVal_check_dose[i] === 1600) {
            checkXY(dose_value, checkVal_check_dose[i], color[4]);
        } else if (checkVal_check_dose[i] === 800) {
            checkXY(dose_value, checkVal_check_dose[i], color[5]);
        }
    }

}

let canvas_obj = [];

function checkXY(dose_value, checkVal_check, color) {
    let Vi = [], Vj = [];
    let cnt = 0;

    for (let y = 0; y < Columns; y++) {
        for (let x = 0; x < Rows; x++) {
            if (dose_value[y][x] < checkVal_check) {
                Vi[cnt] = x;
                Vj[cnt] = y;
                cnt++;
            }
        }
    }
    doseAlign(Vi, Vj, color);
}

function doseAlign(Vi, Vj, color) {
    let Sx = (parseFloat(imgPosArr[0]) * 10) / 10;
    let Sy = (parseFloat(imgPosArr[1]) * 10) / 10;
    let Sz = (parseFloat(imgPosArr[2]) * 10) / 10;

    let Xx = (parseFloat(imgOriArr[0]) * 10) / 10;
    let Xy = (parseFloat(imgOriArr[1]) * 10) / 10;
    let Xz = (parseFloat(imgOriArr[2]) * 10) / 10;
    let Yx = (parseFloat(imgOriArr[3]) * 10) / 10;
    let Yy = (parseFloat(imgOriArr[4]) * 10) / 10;
    let Yz = (parseFloat(imgOriArr[5]) * 10) / 10;

    let Di = parseFloat((pixelSpaceArr[0]) * 10) / 10;
    let Dj = parseFloat((pixelSpaceArr[1]) * 10) / 10;

    let Px = [];
    let Py = [];
    let Pz = [];

    for (let v = 0; v < Vi.length; v++) {
        Px[v] = (Xx * Di * Vi[v]) + (Yx * Dj * Vj[v]) + Sx;
        Py[v] = (Xy * Di * Vi[v]) + (Yy * Dj * Vj[v]) + Sy;
        Pz[v] = (Xz * Di * Vi[v]) + (Yz * Dj * Vj[v]) + Sz;
    }

    drawDose(Px, Py, color);
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

function resetDose(dose_value, checkVal_check, color) {

    let canvas = document.getElementById('doseCanvas');
    let ctx = canvas.getContext('2d');


    //draw path
    ctx.beginPath();

    for (let y = 0; y < Columns; y++) {
        for (let x = 0; x < Rows; x++) {
            if (dose_value[y][x] < checkVal_check) {
                ctx.lineTo(x, y);
            }
        }
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.fill();
    canvas_obj[checkVal_check] = canvas;
}



export {doseFile, doseData, drawDose, getCheckValue, checkAndDraw, resetDose}
