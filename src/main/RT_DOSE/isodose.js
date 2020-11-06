import * as cornerstone from "cornerstone-core";
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import dicomParser from "dicom-parser";
import {dose_pixel_Data_parse} from "./dosePixelDataParse";
import {Dose_checkEvent} from "./doseCheckbox";

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

function doseData(imageId, dataSet) {
    let dose_pixelSpacing = 0;
    let img = 0;

    cornerstone.loadImage(imageId).then(function (image) {
        if (image.data.string('x00080016') === '1.2.840.10008.5.1.4.1.1.481.2') {

            dose_pixelSpacing = image.data.string('x00280030');
            dose_pixelSpacing = dose_pixelSpacing.split('\\');
            dose_pixelSpacing = parseFloat(dose_pixelSpacing[0]);

            doseAlign(image);

            dose_pixel_Data_parse(image, dataSet);
        }
        img = image;
    });

}

function doseAlign(image) {
    let modality = image.data.string('x00080060');
    let SOP_UID = image.data.string('x00080016');
    let Sx, Sy, Sz;
    if (modality === ('CT') || SOP_UID === '1.2.840.10008.5.1.4.1.1.481.2' || modality === 'RTDOSE') {
        let imgPos = image.data.string('x00200032');
        let imgPosArr = imgPos.split("\\");

        Sx = (parseFloat(imgPosArr[0]) * 10) / 10;
        Sy = (parseFloat(imgPosArr[1]) * 10) / 10;
        Sz = (parseFloat(imgPosArr[2]) * 10) / 10;

        let imgOri = image.data.string('x00200037');
        imgOri = imgOri.toString();
        let imgOriArr = imgOri.split("\\");

        let Xx = (parseFloat(imgOriArr[0]) * 10) / 10;
        let Xy = (parseFloat(imgOriArr[1]) * 10) / 10;
        let Xz = (parseFloat(imgOriArr[2]) * 10) / 10;
        let Yx = (parseFloat(imgOriArr[3]) * 10) / 10;
        let Yy = (parseFloat(imgOriArr[4]) * 10) / 10;
        let Yz = (parseFloat(imgOriArr[5]) * 10) / 10;

        let pixelSpace = image.data.string('x00280030');
        pixelSpace = pixelSpace.toString();
        let pixelSpaceArr = pixelSpace.split("\\");

        let Di = parseFloat((pixelSpaceArr[0]) * 10) / 10;
        let Dj = parseFloat((pixelSpaceArr[1]) * 10) / 10;

        let el = document.getElementById('dicomImage');

        el.addEventListener('mousemove', function (event) {
            const pixelCoords = cornerstone.pageToPixel(el, event.pageX, event.pageY);

            let Px = (Xx * Di * pixelCoords.x) + (Yx * Dj * pixelCoords.y) + Sx;
            let Py = (Xy * Di * pixelCoords.x) + (Yy * Dj * pixelCoords.y) + Sy;
            let Pz = (Xz * Di * pixelCoords.x) + (Yz * Dj * pixelCoords.y) + Sz;

            //document.getElementById('voxelCoords').textContent = "Px = " + Px + ", Py = " + Py + ", Pz = " + Pz;
        });


        el.addEventListener('dblclick', function (event) {
            const pixelCoords = cornerstone.pageToPixel(el, event.pageX, event.pageY);

            let Px = (Xx * Di * pixelCoords.x) + (Yx * Dj * pixelCoords.y) + Sx;
            let Py = (Xy * Di * pixelCoords.x) + (Yy * Dj * pixelCoords.y) + Sy;
            let Pz = (Xz * Di * pixelCoords.x) + (Yz * Dj * pixelCoords.y) + Sz;

            // document.getElementById('voxelValue').textContent = "Px = " + Px + ", Py = " + Py + ", Pz = " + Pz;
        });
    } else {
        alert('NOT CT IMAGES')
    }
    return [Sz];
}

let dose_data = [];

function getDoseValue(dose_value) {
    dose_data = dose_value;
}

function drawDose(checkVal_check) {
    let canvas = document.getElementById('doseCanvas');
    let ctx = canvas.getContext('2d');

    ctx.beginPath();

    for (let y = 0; y < Columns; y++) {
        dose_data[y] = [];
    }
    for (let y = 0; y < Columns; y++) {
        for (let x = 0; x < Rows; x++) {
            dose_data[y][x] = [];
        }

    }
    for (let y = 0; y < Columns; y++) {
        for (let x = 0; x < Rows; x++) {
            if (dose_data[y][x] < checkVal_check) {
                ctx.lineTo(x, y);
            }
        }
    }
    ctx.closePath();
    ctx.fillStyle = '#00ffff';
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.fill();

}

export {doseFile, doseData, drawDose, getDoseValue}
