import * as cornerstone from "cornerstone-core";
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import dicomParser from "dicom-parser";
import {dose_pixel_Data_parse} from "./importPixelData";
import {drawDose} from "./drawDose";

let dataSet;
let Rows, Columns, Number_of_Frames;
let imgOriArr = [];
let imgPosArr = [];
let pixelSpaceArr = [];

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
    doseAlign(Vi, Vj, color);
}

let Sx, Sy, Di, Dj;

function doseAlign(Vi, Vj, color) {
    ////-146.0892796\-105.3132142\-157.5
    Sx = parseFloat(imgPosArr[0]);
    Sy = parseFloat(imgPosArr[1]);

    //1\0.0\0.0\0.0\1\0.0
    let Xx = parseFloat(imgOriArr[0]);//1
    let Xy = parseFloat(imgOriArr[1]); //0.0
    let Yx = parseFloat(imgOriArr[3]);//0.0
    let Yy = parseFloat(imgOriArr[4]);//1

    //2.5\2.5
    Di = parseFloat(pixelSpaceArr[0]);
    Dj = parseFloat(pixelSpaceArr[1]);

    let Px = [];
    let Py = [];

    for (let i = 0; i < Vi.length; i++) {
        Px[i] = (Xx * Di * Vi[i]) + (Yx * Dj * Vj[i]) + Sx;
    }
    for (let i = 0; i < Vj.length; i++) {
        Py[i] =(Xy * Di * Vi[i]) + (Yy * Dj * Vj[i]) + Sy;
    }

    let output = [];
    for (let i = 0; i < Px.length; i++) {
        output.push('[' + Px[i] + ',' + Py[i] + ']');
    }
    document.getElementById('dose').innerHTML = '<ul>' + output.join(',') + '</ul>';


    let el = document.getElementById('dicomImage');
    el.addEventListener('mousemove', function (event) {
        const pixelCoords = cornerstone.pageToPixel(el, event.pageX, event.pageY);

        let Px = (Xx * Di * pixelCoords.x) + (Yx * Dj * pixelCoords.y) + Sx;
        let Py = (Xy * Di * pixelCoords.x) + (Yy * Dj * pixelCoords.y) + Sy;

        document.getElementById('doseCoords').textContent = "Px = " + Px + ", Py = " + Py ;
    });

    drawDose(Px, Py, color);
}


export {doseFile, findXY}
