import * as cornerstone from "cornerstone-core";
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import dicomParser from "dicom-parser";
import {importPixelData} from "./importPixelData";
import {checkAndDraw, drawDose} from "./drawDose";
import * as math from 'mathjs';

let dataSet;
let Rows, Columns;
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

    try {
        for (let y = 0; y < Rows; y++) {
            for (let x = 0; x < Columns; x++) {
                if (parseInt(checkVal_check_dose) <= dose_value[y][x]) {
                    Vi[cnt] = x;
                    Vj[cnt] = y;

                    cnt++;
                }
            }
        }
        dose2patient(Vi, Vj, color);
    } catch (err) {
        alert('Can\'t find x,y ');
    }
}

let dose_draw_color = 0;

let dose_Sx,dose_Sy,dose_Sz;
let dose_Xx,dose_Xy,dose_Xz,dose_Yx,dose_Yy,dose_Yz;
let dose_Di,dose_Dj;
//Dose -> Patient
function dose2patient(Vi, Vj, color) {
    ////-146.0892796\-105.3132142\-157.5
    dose_Sx = parseFloat(dose_imgPosArr[0]);
    dose_Sy = parseFloat(dose_imgPosArr[1]);
    dose_Sz = parseFloat(dose_imgPosArr[2]);
    //1\0.0\0.0\0.0\1\0.0
    dose_Xx = parseFloat(dose_imgOriArr[0]); //1
    dose_Xy = parseFloat(dose_imgOriArr[1]); //0.0
    dose_Xz = parseFloat(dose_imgOriArr[2]); //0.0
    dose_Yx = parseFloat(dose_imgOriArr[3]); //0.0
    dose_Yy = parseFloat(dose_imgOriArr[4]); //1
    dose_Yz = parseFloat(dose_imgOriArr[5]); //0.0

    //2.5\2.5
    dose_Di = parseFloat(dose_pixelSpaceArr[0]);
    dose_Dj = parseFloat(dose_pixelSpaceArr[1]);


    let dose_vecPatHor = [dose_Xx * dose_Di, dose_Xy * dose_Di, dose_Xz * dose_Di];
    let dose_vecPatVer = [dose_Yx * dose_Dj, dose_Yy * dose_Dj, dose_Yz * dose_Dj];


    //cross product ( 외적 )
    let dose_vecPatNor = math.cross(dose_vecPatHor, dose_vecPatVer);

    let matrixDose2Patient = math.matrix([[dose_Xx * dose_Di, dose_Yx * dose_Dj, dose_vecPatNor[0], dose_Sx],
        [dose_Xy * dose_Di, dose_Yy * dose_Dj, dose_vecPatNor[1], dose_Sy],
        [dose_Xz * dose_Di, dose_Yz * dose_Dj, dose_vecPatNor[2], dose_Sz],
        [0, 0, 0, 1]]);


    /*
    let dose_vecPatHor = [dose_Xx , dose_Xy , dose_Xz ];
    let dose_vecPatVer = [dose_Yx , dose_Yy , dose_Yz ];


    //cross product ( 외적 )
    let dose_vecPatNor = math.cross(dose_vecPatHor, dose_vecPatVer);

    let matrixDose2Patient = math.matrix([[dose_Xx , dose_Yx , dose_vecPatNor[0], dose_Sx],
        [dose_Xy , dose_Yy , dose_vecPatNor[1], dose_Sy],
        [dose_Xz , dose_Yz , dose_vecPatNor[2], dose_Sz],
        [0, 0, 0, 1]]);

     */
    dose_draw_color = color;
    CT2Patient(matrixDose2Patient, Vi, Vj);
}

let img = 0;

function getCTimage2(CT_img) {
    img = CT_img;
    return img;
}

let CT_Sx = 0, CT_Sy = 0, CT_Sz = 0;
let CT_Xx = 0, CT_Xy = 0, CT_Xz = 0, CT_Yx = 0, CT_Yy = 0, CT_Yz = 0;
let CT_Di = 0, CT_Dj = 0;

//CT->Patient
function CT2Patient(matrixDose2Patient, Vi, Vj) {
    let CT_pixelSpacing = 0;
    let CT_pixelSpaceArr = [];

    CT_pixelSpacing = img.data.string('x00280030');
    CT_pixelSpacing = CT_pixelSpacing.toString();
    CT_pixelSpaceArr = CT_pixelSpacing.split("\\");

    let CT_imgPos = img.data.string('x00200032');
    let CT_imgPosArr = CT_imgPos.split("\\");

    let CT_imgOri = img.data.string('x00200037');
    CT_imgOri = CT_imgOri.toString();
    let CT_imgOriArr = CT_imgOri.split("\\");

    //x00200032
    CT_Sx = parseFloat(CT_imgPosArr[0]);
    CT_Sy = parseFloat(CT_imgPosArr[1]);
    CT_Sz = parseFloat(CT_imgPosArr[2]);

    //x00200037
    //1\0.0\0.0\0.0\1\0.0
    CT_Xx = parseFloat(CT_imgOriArr[0]);//1
    CT_Xy = parseFloat(CT_imgOriArr[1]); //0.0
    CT_Xz = parseFloat(CT_imgOriArr[2]);
    CT_Yx = parseFloat(CT_imgOriArr[3]);//0.0
    CT_Yy = parseFloat(CT_imgOriArr[4]);//1
    CT_Yz = parseFloat(CT_imgOriArr[5]);

    //x00280030
    CT_Di = parseFloat(CT_pixelSpaceArr[0]);
    CT_Dj = parseFloat(CT_pixelSpaceArr[1]);

    let vecPatHor = [CT_Xx * CT_Di, CT_Xy * CT_Di, CT_Xz * CT_Di];
    let vecPatVer = [CT_Yx * CT_Dj, CT_Yy * CT_Dj, CT_Yz * CT_Dj];

    //cross product ( 외적 )
    let vecPatNor = math.cross((vecPatHor), (vecPatVer));

    let matrixCT2Patient = math.matrix([[CT_Xx * CT_Di, CT_Yx * CT_Dj, vecPatNor[0], CT_Sx],
        [CT_Xy * CT_Di, CT_Yy * CT_Dj, vecPatNor[1], CT_Sy],
        [CT_Xz * CT_Di, CT_Yz * CT_Dj, vecPatNor[2], CT_Sz],
        [0, 0, 0, 1]]);

    DOSE2CT(matrixDose2Patient, matrixCT2Patient, Vi, Vj);
}

function DOSE2CT(matrixDose2Patient, matrixCT2Patient, Vi, Vj) {
    let matrixPatient2CT = math.inv(matrixCT2Patient);

    let DOSE2CT = math.multiply(matrixDose2Patient, matrixPatient2CT);

    let coordsDOSE2CT = math.matrix([[], [], [], []]);
    let DOSE2CT_xy = [];
    let DOSE2CT_x = [], DOSE2CT_y = [];

    //coords DOSE2CT
    for (let i = 0; i < Vi.length; i++) {
        coordsDOSE2CT[i] = math.multiply(DOSE2CT, math.matrix([[Vi[i]], [Vj[i]], [0], [1]]));
        DOSE2CT_xy.push((coordsDOSE2CT[i]));
    }


    let output = [];
    //find DOSE2CT x value
    for (let i = 0; i < DOSE2CT_xy.length; i++) {
        DOSE2CT_x[i] = math.subset(DOSE2CT_xy[i], math.index(0, 0));
        DOSE2CT_y[i] = math.subset(DOSE2CT_xy[i], math.index(1, 0));
        //output.push('<ul>' + '[' + DOSE2CT_x[i] + ',' + DOSE2CT_y[i] + ']' + '</ul>');
    }

    let Px = [], Py = [];
    for (let i = 0; i < DOSE2CT_x.length; i++) {
        Px[i] = (CT_Xx * CT_Di * DOSE2CT_x[i]) + (CT_Yx * CT_Dj * DOSE2CT_y[i]) + CT_Sx;
        Py[i] = (CT_Xy * CT_Di * DOSE2CT_x[i]) + (CT_Yy * CT_Dj * DOSE2CT_y[i]) + CT_Sy;
        output.push('<ul>' + '[' + Px[i] + ',' + Py[i] + ']' + '</ul>');
    }

    document.getElementById('dose2').innerHTML = '<ul>' + output.join(' ') + '</ul>';

    drawDose(Px, Py, dose_draw_color);
}

export {doseFile, findXY, CT2Patient, getCTimage2}
