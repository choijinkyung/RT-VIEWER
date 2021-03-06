import * as cornerstone from "cornerstone-core";
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import dicomParser from "dicom-parser";
import {importPixelData} from "./ImportPixelData";
import {drawDose} from "./DrawDose";
import * as math from 'mathjs';

let dataSet = [];
let Rows = 0, Columns = 0;
let dose_imgOriArr = [];
let dose_imgPosArr = [];
let dose_pixelSpaceArr = [];

/**
 * @function doseFile
 * @param {object} file -> File transferred from fileLoaer function
 * @description
 * This function deals with
 * 1. Loading DOSE file
 * 2. DOSE Data Parsing
 * 3. Function call
 *    <br>1) name : importPixelData
 *      <br>param : dose_image, dataSet
 *
 * < DICOM Tag >
 * 1) ROWS : x00280010
 * 2) COLUMNS : x00280011
 * 3) SOP Class UID : x00080016
 * 4) Pixel Spacing : x00280030
 * 5) Image Position : x00200032
 * 6) Image Orientation : x00200037
 *
 * @example
 *  // How to parse the dicom data ?
 *
 *  // User ArrayBuffer and DicomParser
 *  let dataSet = dicomParser.parseDicom(byteArray)
 *  dataSet.uint16('x00280010')
 *
 *  // Use cornerstone Image loader
 *  dose_image.data.string('x00080016') *
 */
function doseFile(file) {
    const imageId = cornerstoneWadoImageLoader.wadouri.fileManager.add(file);

    let reader = new FileReader();
    reader.onload = function () {
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
                        let dose_pixelSpacing = dose_image.data.string('x00280030');

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
                    alert(message)
                }
            }
        }, 10);
    };
    reader.readAsArrayBuffer(file);

    return dataSet;
}

/**
 * @function findXY
 * @param {object} dose_value -> Dose value = pixelData * gridscaling
 * @param {string} checkVal_check_dose -> value that Checked Dose Level
 * @param {string} color -> dose overlay color
 * @description
 * This function deals with
 * 1. Extract x,y coordinates from an obejct containing dose values that are above the reference dose value (checkVal_check_dose).
 * 2. Function call
 *      <br>1) name : dose2patient
 *          <br> param : Vi, Vj, color
 */
function findXY(dose_value, checkVal_check_dose, color) {
    let Vi = [], Vj = [];
    let cnt = 0;

    try {
        for (let y = 1; y <= Rows; y++) {
            for (let x = 1; x <= Columns; x++) {
                if (parseInt(checkVal_check_dose) <= dose_value[y][x]) { // 기준 선량값 이상인 x,y 추출
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

/**
 * @function dose2patient
 * @param {object} Vi -> A collection of x coordinates above the reference dose value.
 * @param {object} Vj -> A collection of y coordinates above the reference dose value.
 * @param {string} color -> dose overlay color
 * @description
 * This function deals with
 * 1. Generate a matrix that converts the Dose to the patient coordinates
 * 2. Function call
 *    <br>1) name : CT2Patient
 *    <br> param : matrixDose2Patient, Vi, Vj
 */
function dose2patient(Vi, Vj, color) {
    let dose_Sx = parseFloat(dose_imgPosArr[0]);
    let dose_Sy = parseFloat(dose_imgPosArr[1]);
    let dose_Sz = parseFloat(dose_imgPosArr[2]);

    let dose_Xx = parseFloat(dose_imgOriArr[0]);
    let dose_Xy = parseFloat(dose_imgOriArr[1]);
    let dose_Xz = parseFloat(dose_imgOriArr[2]);
    let dose_Yx = parseFloat(dose_imgOriArr[3]);
    let dose_Yy = parseFloat(dose_imgOriArr[4]);
    let dose_Yz = parseFloat(dose_imgOriArr[5]);

    let dose_Di = parseFloat(dose_pixelSpaceArr[0]);
    let dose_Dj = parseFloat(dose_pixelSpaceArr[1]);

    let dose_vecPatHor = [dose_Xx * dose_Di, dose_Xy * dose_Di, dose_Xz * dose_Di];
    let dose_vecPatVer = [dose_Yx * dose_Dj, dose_Yy * dose_Dj, dose_Yz * dose_Dj];

    //cross product ( 외적 )
    let dose_vecPatNor = math.cross(dose_vecPatHor, dose_vecPatVer);

    let matrixDose2Patient = math.matrix([[dose_Xx * dose_Di, dose_Yx * dose_Dj, dose_vecPatNor[0], dose_Sx],
        [dose_Xy * dose_Di, dose_Yy * dose_Dj, dose_vecPatNor[1], dose_Sy],
        [dose_Xz * dose_Di, dose_Yz * dose_Dj, dose_vecPatNor[2], dose_Sz],
        [0, 0, 0, 1]]);

    /*
      // 1:1 matrix
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

/**
 * @function getCTimage
 * @param {object} CT_img
 * @return img
 * @description
 * This function deals with
 * 1. Return CT images loaded from firstloader
 * 2. Objective: To use CT image data within the convertMatrix file.
 */
function getCTimage(CT_img) {
    img = CT_img;
    return img;
}

let CT_Di = 0, CT_Dj = 0;
let CT_Xx, CT_Xy, CT_Xz, CT_Yx, CT_Yy, CT_Yz;
let CT_Sx, CT_Sy, CT_Sz;

/**
 * @function CT2Patient
 * @param {matrix} matrixDose2Patient -> Convert Dose to Patient coords matrix
 * @param {object} Vi -> A collection of x coordinates above the reference dose value.
 * @param {object} Vj -> A collection of y coordinates above the reference dose value.
 * @description
 * This function deals with
 * 1. Generate a matrix that converts the CT to the patient coordinates
 * 2. Function call
 *      <br>1) name : dose2CT
 *      <br> param : matrixDose2Patient, matrixCT2Patient, Vi, Vj
 *
 * < DICOM Tag >
 * 1) Pixel Spacing : x00280030
 * 2) Image Position : x00200032
 * 3) Image Orientation : x00200037
 *
 * @example
 * // How to manipulate vector ?
 *
 * let vecPatHor = [CT_Xx * CT_Di, CT_Xy * CT_Di, CT_Xz * CT_Di];
 * let vecPatVer = [CT_Yx * CT_Dj, CT_Yy * CT_Dj, CT_Yz * CT_Dj];
 *
 * //cross product ( 외적 )
 * let vecPatNor = math.cross((vecPatHor), (vecPatVer));
 *
 */
function CT2Patient(matrixDose2Patient, Vi, Vj) {
    let CT_pixelSpacing = img.data.string('x00280030');
    CT_pixelSpacing = CT_pixelSpacing.toString();

    let CT_pixelSpaceArr = CT_pixelSpacing.split("\\");

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
    CT_Xx = parseFloat(CT_imgOriArr[0]);
    CT_Xy = parseFloat(CT_imgOriArr[1]);
    CT_Xz = parseFloat(CT_imgOriArr[2]);
    CT_Yx = parseFloat(CT_imgOriArr[3]);
    CT_Yy = parseFloat(CT_imgOriArr[4]);
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
    /*
        1:1 matrix
        let vecPatHor = [CT_Xx , CT_Xy , CT_Xz ];
        let vecPatVer = [CT_Yx , CT_Yy , CT_Yz ];

        //cross product ( 외적 )
        let vecPatNor = math.cross((vecPatHor), (vecPatVer));

        let matrixCT2Patient = math.matrix([[CT_Xx , CT_Yx , vecPatNor[0], CT_Sx],
            [CT_Xy , CT_Yy , vecPatNor[1], CT_Sy],
            [CT_Xz , CT_Yz , vecPatNor[2], CT_Sz],
            [0, 0, 0, 1]]);
     */
    dose2CT(matrixDose2Patient, matrixCT2Patient, Vi, Vj);
}

/**
 * @function dose2CT
 * @param {matrix} matrixDose2Patient -> Convert Dose to Patient coords matrix
 * @param {matrix} matrixCT2Patient -> Convert CT to Patient coords matrix
 * @param {object} Vi -> A collection of x coordinates above the reference dose value.
 * @param {object} Vj -> A collection of y coordinates above the reference dose value.
 * @description
 * This function deals with
 * 1. Inverse matrix ( CT- > patient )
 * 2. Generate a matrix that converts it to DOSE - CT
 * 3. Obtain x,y after converting the dose coordinates.
 * 4. Function call
 *     <br> 1) name : drawDose
 *     <br> param :Px, Py, dose_draw_color, CT_Di, CT_Dj
 */
function dose2CT(matrixDose2Patient, matrixCT2Patient, Vi, Vj) {
    let matrixPatient2CT = math.inv(matrixCT2Patient);

    let DOSE2CT = math.multiply(matrixDose2Patient, matrixPatient2CT);

    let coordsDOSE2CT = math.matrix([[], [], [], []]);
    let DOSE2CT_xy = [];
    let DOSE2CT_x = [], DOSE2CT_y = [];

    //coords dose2CT
    for (let i = 0; i < Vi.length; i++) {
        coordsDOSE2CT[i] = math.multiply(DOSE2CT, math.matrix([[Vi[i]], [Vj[i]], [0], [1]]));
        DOSE2CT_xy.push((coordsDOSE2CT[i]));
    }
    //let output = [];
    //find dose2CT x value
    for (let i = 0; i < DOSE2CT_xy.length; i++) {
        DOSE2CT_x[i] = math.subset(DOSE2CT_xy[i], math.index(0, 0));
        DOSE2CT_y[i] = math.subset(DOSE2CT_xy[i], math.index(1, 0));
        //output.push('<ul>' + '[' + DOSE2CT_x[i] + ',' + DOSE2CT_y[i] + ']' + '</ul>');
    }


    let Px = [], Py = [];
    for (let i = 0; i < DOSE2CT_x.length; i++) {
        Px[i] = (CT_Xx * CT_Di * DOSE2CT_x[i]) + (CT_Yx * CT_Dj * DOSE2CT_y[i]) + CT_Sx;
        Py[i] = (CT_Xy * CT_Di * DOSE2CT_x[i]) + (CT_Yy * CT_Dj * DOSE2CT_y[i]) + CT_Sy;
        //output.push('<ul>' + '[' + Px[i] + ',' + Py[i] + ']' + '</ul>');
    }

    drawDose(Px, Py, dose_draw_color, CT_Di, CT_Dj);
}

export {doseFile, findXY, CT2Patient, getCTimage}
