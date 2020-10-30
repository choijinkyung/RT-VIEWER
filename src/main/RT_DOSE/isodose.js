import $ from "jquery";
import dicomParser from "dicom-parser";
import * as cornerstone from "cornerstone-core";
import dicomParse from "../dicomParse";
import voxelCal from "../RT_STRUCTURE/pixel2voxel";
import {loadCTImage} from "../Loader/loadCTImage";
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import {reset} from "../RT_STRUCTURE/ROI";

function doseFile(file){
    const imageId = cornerstoneWadoImageLoader.wadouri.fileManager.add(file);
    doseData(imageId);
}


function doseData(imageId){
    let el = document.getElementById('dicomImage');
    cornerstone.enable(el);

    let pixelData;
    let spacing = 0;
    let pixelSpacing ;
    let img ;
    let dSz;
    let doseCalVal;
    cornerstone.loadImage(imageId).then(function (image) {
        const viewport = cornerstone.getDefaultViewportForImage(el, image);
        if (image.data.string('x00080016') === '1.2.840.10008.5.1.4.1.1.481.2') {
            cornerstone.displayImage(el, image, viewport);
            pixelData = image.data.string('x7fe00010');
            pixelSpacing = image.data.string('x00280030');
            pixelSpacing = pixelSpacing.split('\\');
            pixelSpacing = parseFloat(pixelSpacing[0]);

            doseCalVal = doseCal(image,spacing);
            dSz = doseCalVal[0];

            dicomParse(image);
        }
        img = image;
    });

    el.onwheel = wheelE;
    let index = dSz;
    function wheelE(e) {
        // Firefox e.detail > 0 scroll back, < 0 scroll forward
        // chrome/safari e.wheelDelta < 0 scroll back, > 0 scroll forward
        e.stopPropagation();
        e.preventDefault();
        if (index >= -157.5 && index <= 120 ) {
            if (e.deltaY < 0) {
                if (index === dSz) {
                    spacing = spacing + pixelSpacing;
                    doseCalVal = doseCal(img,spacing);
                    dSz = doseCalVal[0];
                    index = dSz;
                }
            } else {
                if (index === dSz) {
                    spacing = spacing - pixelSpacing;
                    doseCalVal = doseCal(img,spacing);
                    dSz = doseCalVal[0];
                    index = dSz;
                }
            }
        } else {
            doseCalVal = doseCal(img,0);
            dSz = doseCalVal[0];
            index = dSz;
        }
    }
}


function doseCal(image,spacing) {
    let modality = image.data.string('x00080060');
    let SOP_UID = image.data.string('x00080016');
    let Sx,Sy,Sz;
    if (modality === ('CT') || SOP_UID ==='1.2.840.10008.5.1.4.1.1.481.2' || modality === 'RTDOSE') {
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

        /*
        document.getElementById('Sxyz').textContent = 'Sx : ' + Sx + ', Sy : ' + Sy + ', Sz : ' + Sz;
        document.getElementById('Xxyz').textContent = 'Xx : ' + Xx + ', Xy : ' + Xy + ', Xz : ' + Xz;
        document.getElementById('Yxyz').textContent = 'Yx : ' + Yx + ', Yy : ' + Yy + ', Yz : ' + Yz;
        document.getElementById('Dij').textContent = 'Di : ' + Di + ', Dj : ' + Dj;
        */

        el.addEventListener('mousemove', function (event) {
            const pixelCoords = cornerstone.pageToPixel(el, event.pageX, event.pageY);
            //  document.getElementById('coords').textContent = "pageX=" + event.pageX + ", pageY=" + event.pageY + ", pixelX=" + pixelCoords.x + ", pixelY=" + pixelCoords.y;

            let Px = (Xx * Di * pixelCoords.x) + (Yx * Dj * pixelCoords.y) + Sx;
            let Py = (Xy * Di * pixelCoords.x) + (Yy * Dj * pixelCoords.y) + Sy;
            let Pz = (Xz * Di * pixelCoords.x) + (Yz * Dj * pixelCoords.y) + Sz;

            //Px = Math.floor(Px * 10) / 10;
            // Py = Math.floor(Py * 10) / 10;
            document.getElementById('voxelCoords').textContent = "Px = " + Px + ", Py = " + Py + ", Pz = " + Pz;
        });

        el.addEventListener('dblclick', function (event) {
            const pixelCoords = cornerstone.pageToPixel(el, event.pageX, event.pageY);
            //   document.getElementById('pixelValue').textContent = "pageX=" + event.pageX + ", pageY=" + event.pageY + ", pixelX=" + pixelCoords.x + ", pixelY=" + pixelCoords.y;

            let Px = (Xx * Di * pixelCoords.x) + (Yx * Dj * pixelCoords.y) + Sx;
            let Py = (Xy * Di * pixelCoords.x) + (Yy * Dj * pixelCoords.y) + Sy;
            let Pz = (Xz * Di * pixelCoords.x) + (Yz * Dj * pixelCoords.y) + Sz;

            // Px = Math.floor(Px * 10) / 10;
            //  Py = Math.floor(Py * 10) / 10;

            document.getElementById('voxelValue').textContent = "Px = " + Px + ", Py = " + Py + ", Pz = " + Pz;
        });
    }
    else {
        alert('NOT CT IMAGES')
    }
    return [Sz];
}

export {doseFile, doseData }
