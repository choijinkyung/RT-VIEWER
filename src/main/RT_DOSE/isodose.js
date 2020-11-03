import * as cornerstone from "cornerstone-core";
import dicomParse from "../dicomParse";
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import dicomParser from "dicom-parser";
import {dose_pixel_Data_parse} from "./gridScaling";

let dataSet;

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


let dSz = 0;
function doseData(imageId, dataSet) {
    let el = document.getElementById('dicomImage');
    cornerstone.enable(el);

    let spacing = 0;
    let pixelSpacing = 0;
    let img = 0;
    let doseCalVal = 0;
    let index=0;

    cornerstone.loadImage(imageId).then(function (image) {
        const viewport = cornerstone.getDefaultViewportForImage(el, image);
        if (image.data.string('x00080016') === '1.2.840.10008.5.1.4.1.1.481.2') {
            cornerstone.displayImage(el, image, viewport);

            pixelSpacing = image.data.string('x00280030');
            pixelSpacing = pixelSpacing.split('\\');
            pixelSpacing = parseFloat(pixelSpacing[0]);

            doseCalVal = doseAlign(image,spacing);
            dSz = doseCalVal[0];
            index = dSz;
            dose_pixel_Data_parse(image,dataSet);
            dicomParse(image);

        }
        img = image;
    });

    el.onwheel = wheelE;


    function wheelE(e) {
        // Firefox e.detail > 0 scroll back, < 0 scroll forward
        // chrome/safari e.wheelDelta < 0 scroll back, > 0 scroll forward
        e.stopPropagation();
        e.preventDefault();
        if (index >= -157.5 && index <= 120 ) {
            if (e.deltaY < 0) {
                if (index === dSz) {
                    spacing = spacing + pixelSpacing;
                    doseCalVal = doseAlign(img,spacing);
                    dSz = doseCalVal[0];
                    index = dSz;
                }
            } else {
                if (index === dSz) {
                    spacing = spacing - pixelSpacing;
                    doseCalVal = doseAlign(img,spacing);
                    dSz = doseCalVal[0];
                    index = dSz;
                }
            }
        } else {
            doseCalVal = doseAlign(img,0);
            dSz = doseCalVal[0];
            index = dSz;
        }
    }
}


function doseAlign(image, spacing) {
    let modality = image.data.string('x00080060');
    let SOP_UID = image.data.string('x00080016');
    let Sx, Sy, Sz;
    if (modality === ('CT') || SOP_UID === '1.2.840.10008.5.1.4.1.1.481.2' || modality === 'RTDOSE') {
        let imgPos = image.data.string('x00200032');
        let imgPosArr = imgPos.split("\\");

        Sx = (parseFloat(imgPosArr[0]) * 10) / 10;
        Sy = (parseFloat(imgPosArr[1]) * 10) / 10;
        Sz = (parseFloat(imgPosArr[2]) * 10) / 10 + spacing;

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

            document.getElementById('voxelCoords').textContent = "Px = " + Px + ", Py = " + Py + ", Pz = " + Pz;
        });

        el.addEventListener('dblclick', function (event) {
            const pixelCoords = cornerstone.pageToPixel(el, event.pageX, event.pageY);

            let Px = (Xx * Di * pixelCoords.x) + (Yx * Dj * pixelCoords.y) + Sx;
            let Py = (Xy * Di * pixelCoords.x) + (Yy * Dj * pixelCoords.y) + Sy;
            let Pz = (Xz * Di * pixelCoords.x) + (Yz * Dj * pixelCoords.y) + Sz;

            document.getElementById('voxelValue').textContent = "Px = " + Px + ", Py = " + Py + ", Pz = " + Pz;
        });
    } else {
        alert('NOT CT IMAGES')
    }
    return [Sz];
}

export {doseFile, doseData}
