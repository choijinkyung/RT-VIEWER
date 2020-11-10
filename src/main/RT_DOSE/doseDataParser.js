import * as cornerstone from "cornerstone-core";
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import dicomParser from "dicom-parser";
import {dose_pixel_Data_parse} from "./dosePixelDataParse";
import {drawDose} from "./drawDose";

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

function findXY(dose_value, checkVal_check, color) {
    let Vi = [], Vj = [];
    let cnt = 0;
    let output2=[];

    for (let y = 0; y < Columns; y++) {
        for (let x = 0; x < Rows; x++) {
            if (dose_value[y][x] > checkVal_check) {
                output2.push(dose_value[y][x]);
                Vi[cnt] = x;
                Vj[cnt] = y;
                cnt++;
            }
        }
    }
    document.getElementById('dose2').innerHTML='<ul>'+output2.join(',')+'</ul>';
    let output=[];
    Vi.sort(function(a,b){
        return a-b;
    });
    for(let i=0;i<Vi.length;i++){
     output.push('('+Vi[i]+','+Vj[i]+')');
    }

    document.getElementById('dose').innerHTML = '<ul>'+output.join('')+'</ul>';
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

    for (let i = 0; i < Vi.length; i++) {
        Px[i] = (Xx * Di * Vi[i]) + (Yx * Dj * Vj[i]) + Sx;
        Py[i] = (Xy * Di * Vi[i]) + (Yy * Dj * Vj[i]) + Sy;
        Pz[i] = (Xz * Di * Vi[i]) + (Yz * Dj * Vj[i]) + Sz;
    }

    drawDose(Px, Py, color);
}


export {doseFile, doseData, findXY}
