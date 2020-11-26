import * as cornerstone from "cornerstone-core";
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import dicomParser from "dicom-parser";
import {importPixelData} from "./importPixelData";
import {checkAndDraw, drawDose} from "./drawDose";
import voxelCal from "../RT_STRUCTURE/pixel2voxel";
import * as math from 'mathjs';

let dataSet;
let Rows, Columns, Number_of_Frames;
let dose_imgOriArr = [];
let dose_imgPosArr = [];
let dose_pixelSpaceArr = [];

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

                cornerstone.loadImage(imageId).then(function (dose_image) {
                    if (dose_image.data.string('x00080016') === '1.2.840.10008.5.1.4.1.1.481.2') {
                        let dose_pixelSpacing = 0;
                        dose_pixelSpaceArr = [];

                        dose_pixelSpacing = dose_image.data.string('x00280030');
                        dose_pixelSpacing = dose_pixelSpacing.toString();
                        dose_pixelSpaceArr = dose_pixelSpacing.split("\\");

                        let imgPos = dose_image.data.string('x00200032');
                        dose_imgPosArr = imgPos.split("\\");

                        let imgOri = dose_image.data.string('x00200037');
                        imgOri = imgOri.toString();
                        dose_imgOriArr = imgOri.split("\\");


                        importPixelData(dose_image, dataSet);
                    }
                });
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

function findXY(dose_value, checkVal_check_dose, color) {
    let Vi = [], Vj = [];
    let cnt = 0;

    for (let y = 0; y < Columns; y++) {
        for (let x = 0; x < Rows; x++) {
            if (parseInt(checkVal_check_dose) <= dose_value[y][x]) {
                Vi[cnt] = x;
                Vj[cnt] = y;

                cnt++;
            }
        }
    }

    dose2patient(Vi, Vj,color);
}

let dose_Sx, dose_Sy, dose_Sz, dose_Di, dose_Dj;
let doselut_x=[],doselut_y=[];

let dose_draw_color=0;
function dose2patient(Vi, Vj,color) {
    ////-146.0892796\-105.3132142\-157.5
    dose_Sx = parseFloat(dose_imgPosArr[0]);
    dose_Sy = parseFloat(dose_imgPosArr[1]);
    dose_Sz = parseFloat(dose_imgPosArr[2]);
    //1\0.0\0.0\0.0\1\0.0
    let dose_Xx = parseFloat(dose_imgOriArr[0]);//1
    let dose_Xy = parseFloat(dose_imgOriArr[1]); //0.0
    let dose_Xz = parseFloat(dose_imgOriArr[2]);
    let dose_Yx = parseFloat(dose_imgOriArr[3]);//0.0
    let dose_Yy = parseFloat(dose_imgOriArr[4]);//1
    let dose_Yz = parseFloat(dose_imgOriArr[5]);

    //2.5\2.5
    dose_Di = parseFloat(dose_pixelSpaceArr[0]);
    dose_Dj = parseFloat(dose_pixelSpaceArr[1]);

    let matrixDose2Patient = math.matrix([[dose_Xx * dose_Di, dose_Yx * dose_Dj, 0, dose_Sx], [dose_Xy * dose_Di, dose_Yy * dose_Dj, 0, dose_Sy], [dose_Xz * dose_Di, dose_Yz * dose_Dj, 0, dose_Sz], [0, 0, 0, 1]]);

    let dose2patient_x = [], dose2patient_y = [];
    let dose2patient_imat = math.matrix([[], [], [], []]), dose2patient_jmat = math.matrix([[], [], [], []]);


    //dose2Patient_imat
    for (let i = 0; i < Vi.length; i++) {
        dose2patient_imat[i] = math.multiply(matrixDose2Patient, math.matrix([[Vi[i]], [0], [0], [1]]));
        dose2patient_x.push((dose2patient_imat[i]));
    }
    //find dose2patient x value
    for (let i = 0; i < dose2patient_x.length; i++) {
        dose2patient_x[i] = math.subset(dose2patient_x[i], math.index(0, 0));
        doselut_x[i] = dose2patient_x[i];
    }
    //dose2Patient_jmat
    for (let j = 0; j < Vj.length; j++) {
        dose2patient_jmat[j] = math.multiply(matrixDose2Patient, math.matrix([[0], [Vj[j]], [0], [1]]));
        dose2patient_y.push((dose2patient_jmat[j]))
    }
    //find dose2patient y value
    for (let j = 0; j < dose2patient_y.length; j++) {
        dose2patient_y[j] = math.subset(dose2patient_y[j], math.index(1, 0));
        doselut_y[j] = dose2patient_y[j];
    }
    dose_draw_color = color;
    GetDoseGridPixelData(CT_patient_position,CT_pixelSpaceArr);

}
let CT_patient_position=0;
let CT_pixelSpacing = 0, CT_pixelSpaceArr = [];
let pixlut_x=[],pixlut_y=[];

function CT2Patient(CT_img) {
    CT_pixelSpacing = 0;
    CT_pixelSpaceArr = [];

    CT_pixelSpacing = CT_img.data.string('x00280030');
    CT_pixelSpacing = CT_pixelSpacing.toString();
    CT_pixelSpaceArr = CT_pixelSpacing.split("\\");

    let CT_imgPos = CT_img.data.string('x00200032');
    let CT_imgPosArr = CT_imgPos.split("\\");

    let CT_imgOri = CT_img.data.string('x00200037');
    CT_imgOri = CT_imgOri.toString();
    let CT_imgOriArr = CT_imgOri.split("\\");

    let CT_Sx = parseFloat(CT_imgPosArr[0]);
    let CT_Sy = parseFloat(CT_imgPosArr[1]);
    let CT_Sz = parseFloat(CT_imgPosArr[2]);

    //1\0.0\0.0\0.0\1\0.0
    let CT_Xx = parseFloat(CT_imgOriArr[0]);//1
    let CT_Xy = parseFloat(CT_imgOriArr[1]); //0.0
    let CT_Xz = parseFloat(CT_imgOriArr[2]);
    let CT_Yx = parseFloat(CT_imgOriArr[3]);//0.0
    let CT_Yy = parseFloat(CT_imgOriArr[4]);//1
    let CT_Yz = parseFloat(CT_imgOriArr[5]);

    let CT_Di = parseFloat(CT_pixelSpaceArr[0]);
    let CT_Dj = parseFloat(CT_pixelSpaceArr[1]);

    let CT_Rows = CT_img.data.string('x00200010');
    let CT_Columns = CT_img.data.string('x00200011');
    let matrixCT2Patient = math.matrix([[CT_Xx * CT_Di, CT_Yx * CT_Dj, 0, CT_Sx], [CT_Xy * CT_Di, CT_Yy * CT_Dj, 0, CT_Sy], [CT_Xz * CT_Di, CT_Yz * CT_Dj, 0, CT_Sz], [0, 0, 0, 1]]);

    let CT2patient_imat = math.matrix([[], [], [], []]), CT2patient_jmat = math.matrix([[], [], [], []]);
    //CT2patient_imat
    let CT2patient_x = [], CT2patient_y = [];
    for (let i = 0; i < CT_Rows; i++) {
        CT2patient_imat[i] = math.multiply(matrixCT2Patient, math.matrix([[i], [0], [0], [1]]));
        CT2patient_x.push((CT2patient_imat[i]))
    }

    //find CT2patient x value
    for (let i = 0; i < CT2patient_x.length; i++) {
        CT2patient_x[i] = math.subset(CT2patient_x[i], math.index(0, 0));
        pixlut_x[i]=CT2patient_x[i];
    }
    //CT2patient_jmat
    for (let j = 0; j < CT_Columns; j++) {
        CT2patient_jmat[j] = math.multiply(matrixCT2Patient, math.matrix([[0], [j], [0], [1]]));
        CT2patient_y.push((CT2patient_jmat[j]))
    }

    //find CT2patient y value
    for (let j = 0; j < CT2patient_y.length; j++) {
        CT2patient_y[j] = math.subset(CT2patient_y[j], math.index(1, 0));
        pixlut_y[j]=CT2patient_y[j];
    }
   CT_patient_position = CT_img.data.string('x00185100');


}

function GetDoseGridPixelData(CT_patient_position,CT_pixelSpaceArr) {
    let prone = -1;
    let supine = 1;
    let feetfirst = -1;
    let headfirst = 1;

    let lut_x = [], lut_y = [];
    let output=[];

    for(let i=0;i<doselut_x.length;i++){
        if (CT_patient_position === 'HFS' || CT_patient_position === 'hfs') {
            lut_x[i] = ((doselut_x[i] - pixlut_x[0]) * supine * headfirst / CT_pixelSpaceArr[0]);
            lut_y[i] = ((doselut_y[i] - pixlut_y[0]) * supine / CT_pixelSpaceArr[1]);
        } else if (CT_patient_position === 'FFS' || CT_patient_position === 'ffs') {
            lut_x[i] = ((doselut_x[i]- pixlut_x[0]) * supine * feetfirst / CT_pixelSpaceArr[0]);
            lut_y[i] = ((doselut_y[i] - pixlut_y[0]) * supine / CT_pixelSpaceArr[1]);
        } else if (CT_patient_position === 'HFP' || CT_patient_position === 'hfp') {
            lut_x[i] = ((doselut_x[i] - pixlut_x[0]) * prone * headfirst / CT_pixelSpaceArr[0]);
            lut_y[i] = ((doselut_y[i] - pixlut_y[0]) * prone / CT_pixelSpaceArr[1]);
        } else if (CT_patient_position === 'FFP' || CT_patient_position === 'ffp') {
            lut_x[i] = ((doselut_x[i] - pixlut_x[0]) * prone * feetfirst / CT_pixelSpaceArr[0]);
            lut_y[i] = ((doselut_y[i] - pixlut_y[0]) * prone / CT_pixelSpaceArr[1]);
        }
    }

    for(let i=0;i<lut_x.length;i++){
        lut_x[i]=(lut_x[i]);
        lut_y[i]=(lut_y[i]);
        output.push('['+lut_x[i]+','+lut_y[i]+']')
    }

    document.getElementById('dose2').innerHTML='<ul>'+output.join(',')+'</ul>'


    drawDose(lut_x,lut_y,dose_draw_color);

}


export {doseFile, findXY, CT2Patient, GetDoseGridPixelData}
