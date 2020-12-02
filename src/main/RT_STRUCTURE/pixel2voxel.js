import * as cornerstone from "cornerstone-core";

let Px, Py;
/**
 * @function voxelCal
 * @param {object} CT_image
 * @description
 * This function deals with
 * 1. Changed to pixels - mm mm
 * 2. Pixel -> Voxel
 * 3. Change from Canvas Coordinate to CT Coordinate
 * 4. Mousemove event occurred -> px, mm output
 * 5. Condition : Modality = CT or SOP_UID = 1.2.840.10008.5.1.4.1.1.481.2
 *
 * < DICOM Tag >
 * 1) Modality : x00080060
 * 2) SOP Class UID : x00080016
 * 3) Image Position : x00200032
 * 4) Image Orientation : x00200037
 * 5) Pixel Spacing :x00280030
 **/
function voxelCal(CT_image) {
    try{
        let modality = CT_image.data.string('x00080060');
        let SOP_UID = CT_image.data.string('x00080016');

        if (modality === ('CT') || SOP_UID === '1.2.840.10008.5.1.4.1.1.481.2') {
            let imgPos = CT_image.data.string('x00200032');
            let imgPosArr = imgPos.split("\\");

            let Sx = (parseFloat(imgPosArr[0]) * 10) / 10;
            let Sy = (parseFloat(imgPosArr[1]) * 10) / 10;

            let imgOri = CT_image.data.string('x00200037');
            imgOri = imgOri.toString();
            let imgOriArr = imgOri.split("\\");

            let Xx = (parseFloat(imgOriArr[0]) * 10) / 10;
            let Xy = (parseFloat(imgOriArr[1]) * 10) / 10;

            let Yx = (parseFloat(imgOriArr[3]) * 10) / 10;
            let Yy = (parseFloat(imgOriArr[4]) * 10) / 10;

            let pixelSpacing = CT_image.data.string('x00280030');
            pixelSpacing = pixelSpacing.toString();
            let pixelSpaceArr = pixelSpacing.split("\\");

            let Di = parseFloat((pixelSpaceArr[0]) * 10) / 10;
            let Dj = parseFloat((pixelSpaceArr[1]) * 10) / 10;


            let el = document.getElementById('dicomImage');
            //CTimage의 좌표를 mm로 반환
            el.addEventListener('mousemove', function (event) {
                const pixelCoords = cornerstone.pageToPixel(el, event.pageX, event.pageY);

                document.getElementById('coords').textContent = "X: " + (Math.round(pixelCoords.x * 10) / 10) + "px  Y: " + (Math.round(pixelCoords.y * 10) / 10) + 'px';

                Px = (Xx * Di * pixelCoords.x) + (Yx * Dj * pixelCoords.y) + Sx;
                Py = (Xy * Di * pixelCoords.x) + (Yy * Dj * pixelCoords.y) + Sy;

                Px = Math.round(Px * 10) / 10;
                Py = Math.round(Py * 10) / 10;
                document.getElementById('voxelCoords').textContent = "X: " + Px + "mm   Y: " + Py + 'mm';
            });

            //더블클릭시 해당 좌표를 저장 후 출력
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
    }catch(err){
        var message = err;
        if (err.exception) {
            message = err.exception;
            alert(message)
        }
    }
}

export default voxelCal;
