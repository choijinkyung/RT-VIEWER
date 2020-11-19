import React from "react";
import * as cornerstone from "cornerstone-core";
import {getVoxelCalValue} from "../RT_DOSE/doseDataParser";

//caculate voxel from pixel
function voxelCal(image) {
    let modality = image.data.string('x00080060');
    let SOP_UID = image.data.string('x00080016');
    if (modality === ('CT') || SOP_UID === '1.2.840.10008.5.1.4.1.1.481.2' || modality === 'RTDOSE') {
        let imgPos = image.data.string('x00200032');
        let imgPosArr = imgPos.split("\\");

        let Sx = (parseFloat(imgPosArr[0]) * 10) / 10;
        let Sy = (parseFloat(imgPosArr[1]) * 10) / 10;
        let Sz = (parseFloat(imgPosArr[2]) * 10) / 10;

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

        return [Sx, Sy, Di, Dj]
    } else {
        alert('NOT CT IMAGES')
    }
}

export default voxelCal;
