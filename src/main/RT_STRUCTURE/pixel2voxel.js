import * as cornerstone from "cornerstone-core";

let Px, Py;

//caculate voxel from pixel
function voxelCal(image) {
    let modality = image.data.string('x00080060');
    let SOP_UID = image.data.string('x00080016');
    if (modality === ('CT') || SOP_UID === '1.2.840.10008.5.1.4.1.1.481.2' || modality === 'RTDOSE') {
        let imgPos = image.data.string('x00200032');
        let imgPosArr = imgPos.split("\\");

        let Sx = (parseFloat(imgPosArr[0]) * 10) / 10;
        let Sy = (parseFloat(imgPosArr[1]) * 10) / 10;

        let imgOri = image.data.string('x00200037');
        imgOri = imgOri.toString();
        let imgOriArr = imgOri.split("\\");

        let Xx = (parseFloat(imgOriArr[0]) * 10) / 10;
        let Xy = (parseFloat(imgOriArr[1]) * 10) / 10;

        let Yx = (parseFloat(imgOriArr[3]) * 10) / 10;
        let Yy = (parseFloat(imgOriArr[4]) * 10) / 10;


        let pixelSpace = image.data.string('x00280030');
        pixelSpace = pixelSpace.toString();
        let pixelSpaceArr = pixelSpace.split("\\");

        let Di = parseFloat((pixelSpaceArr[0]) * 10) / 10;
        let Dj = parseFloat((pixelSpaceArr[1]) * 10) / 10;

        let el = document.getElementById('dicomImage');


        el.addEventListener('mousemove', function (event) {
            const pixelCoords = cornerstone.pageToPixel(el, event.pageX, event.pageY);

            document.getElementById('coords').textContent = "X: " + (Math.round(pixelCoords.x * 10) / 10) + "px  Y: " + (Math.round(pixelCoords.y * 10) / 10) + 'px';

            Px = (Xx * Di * pixelCoords.x) + (Yx * Dj * pixelCoords.y) + Sx;
            Py = (Xy * Di * pixelCoords.x) + (Yy * Dj * pixelCoords.y) + Sy;

            Px = Math.round(Px * 10) / 10;
            Py = Math.round(Py * 10) / 10;
            document.getElementById('voxelCoords').textContent = "X: " + Px + "mm   Y: " + Py + 'mm';
        });

        el.addEventListener('dblclick', function (event) {
            const pixelCoords = cornerstone.pageToPixel(el, event.pageX, event.pageY);
            document.getElementById('pixelValue').textContent = "X: " + (Math.round(pixelCoords.x * 10) / 10) + "px  Y: " + (Math.round(pixelCoords.y * 10) / 10) + 'px';

            Px = (Xx * Di * pixelCoords.x) + (Yx * Dj * pixelCoords.y) + Sx;
            Py = (Xy * Di * pixelCoords.x) + (Yy * Dj * pixelCoords.y) + Sy;

            Px = Math.round(Px * 10) / 10;
            Py = Math.round(Py * 10) / 10;

            document.getElementById('voxelValue').textContent = "X: " + Px + "mm   Y: " + Py + 'mm';
        });

        return [Sx, Sy, Di, Dj, Px, Py]
    } else {
        alert('NOT CT IMAGES')
    }
}

export default voxelCal;
