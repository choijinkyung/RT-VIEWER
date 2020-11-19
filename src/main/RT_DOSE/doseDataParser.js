import * as cornerstone from "cornerstone-core";
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import dicomParser from "dicom-parser";
import {dose_pixel_Data_parse} from "./dosePixelDataParse";
import {drawDose} from "./drawDose";
import voxelCal from "../RT_STRUCTURE/pixel2voxel";

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

function findXY(dose_value, checkVal_check_dose, color) {
    let Vi = [], Vj = [];
    let cnt = 0;

    let output2 = [];

    for (let y = 0; y < Columns; y++) {
        for (let x = 0; x < Rows; x++) {
            if (parseInt(checkVal_check_dose)<=dose_value[y][x]) {

                output2.push(dose_value[y][x]);

                Vi[cnt] = x ;
                Vj[cnt] = y ;
                cnt++;
            }
        }
    }
    document.getElementById('dose2').innerHTML = '<ul>' + output2.join(',') + '</ul>';


    let coords = [];
    for (let i = 0; i < cnt; i++) {
        coords[i] = [];
    }
    for (let i = 0; i < cnt; i++) {
        coords[i][0] = Vi[i];
        coords[i][1] = Vj[i];
    }

    let ch = [];
    for (let i = 0; i < ch.length; i++) {
        ch[i] = [];
    }
    ch = require('graham-scan-convex-hull')(coords);

    let ch_x = [];
    let ch_y = [];

    for (let i = 0; i < ch.length; i++) {
        ch_x[i] = [];
        ch_y[i] = [];
    }

    for (let i = 0; i < ch.length; i++) {
        ch_x[i] = ch[i][0];
        ch_y[i] = ch[i][1];
    }

    //drawDose(ch_x, ch_y, color);

    doseAlign(ch_x, ch_y, color);
}

let Sx, Sy, Di, Dj;
function doseAlign(Vi, Vj, color) {
    Sx = parseFloat(imgPosArr[0]);
    Sy = parseFloat(imgPosArr[1]);

    let Xx = parseFloat(imgOriArr[0]);
    let Xy = parseFloat(imgOriArr[1]);
    let Yx = parseFloat(imgOriArr[3]);
    let Yy = parseFloat(imgOriArr[4]);

    Di = parseFloat(pixelSpaceArr[0]);
    Dj = parseFloat(pixelSpaceArr[1]);

    let Px = [];
    let Py = [];

    for (let i = 0; i < Vi.length; i++) {
        Px[i] = Math.floor(((Xx * Di * Vi[i]) + (Yx * Dj * Vj[i]) + Sx)*100)/100;
    }
    for (let i = 0; i < Vj.length; i++) {
        Py[i] = Math.floor(((Xy * Di * Vi[i]) + (Yy * Dj * Vj[i]) + Sy)*100)/100;
    }


    let output = [];

    for (let i = 0; i < Px.length; i++) {
        output.push('[' + Px[i] + ',' + Py[i] + ']');
    }

    document.getElementById('dose').innerHTML = '<ul>' + output.join(',') + '</ul>';

    drawDose(Px, Py, color);
}


export {doseFile, doseData, findXY}
