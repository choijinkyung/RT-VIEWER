import * as cornerstone from "cornerstone-core";

let Px;
let Py;
let cachedVoxelContext = null;

function setTextContent(id, value) {
    const target = document.getElementById(id);

    if (target) {
        target.textContent = value;
    }
}

function hasEnabledCornerstoneElement(element) {
    if (!element) {
        return false;
    }

    try {
        cornerstone.getEnabledElement(element);
        return true;
    } catch (error) {
        return false;
    }
}

function updateVoxelReadout(event, shouldPersistValue = false) {
    const element = document.getElementById("dicomImage");

    if (!element || !cachedVoxelContext || !hasEnabledCornerstoneElement(element)) {
        return;
    }

    let pixelCoords;

    try {
        pixelCoords = cornerstone.pageToPixel(element, event.pageX, event.pageY);
    } catch (error) {
        return;
    }

    const {Di, Dj, Sx, Sy, Xx, Xy, Yx, Yy} = cachedVoxelContext;

    setTextContent(
        shouldPersistValue ? "pixelValue" : "coords",
        "X: " + (Math.round(pixelCoords.x * 10) / 10) + "px  Y: " + (Math.round(pixelCoords.y * 10) / 10) + "px"
    );

    Px = (Xx * Di * pixelCoords.x) + (Yx * Dj * pixelCoords.y) + Sx;
    Py = (Xy * Di * pixelCoords.x) + (Yy * Dj * pixelCoords.y) + Sy;

    Px = Math.round(Px * 10) / 10;
    Py = Math.round(Py * 10) / 10;

    setTextContent(
        shouldPersistValue ? "voxelValue" : "voxelCoords",
        "X: " + Px + "mm   Y: " + Py + "mm"
    );
}

function handleMouseMove(event) {
    updateVoxelReadout(event, false);
}

function handleDoubleClick(event) {
    updateVoxelReadout(event, true);
}

function ensureInteractionListeners(element) {
    if (!element || element.dataset.rtviewerVoxelBound === "true") {
        return;
    }

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("dblclick", handleDoubleClick);
    element.dataset.rtviewerVoxelBound = "true";
}

/**
 * @function voxelCal
 * @param {object} CT_image
 * @description
 * This function deals with
 * 1. Changed to pixels -> mm
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
    try {
        const modality = CT_image.data.string("x00080060");
        const sopUid = CT_image.data.string("x00080016");

        if (modality !== "CT" && sopUid !== "1.2.840.10008.5.1.4.1.1.481.2") {
            return null;
        }

        const imgPos = CT_image.data.string("x00200032");
        const imgOri = CT_image.data.string("x00200037");
        const pixelSpacing = CT_image.data.string("x00280030");
        const element = document.getElementById("dicomImage");

        if (!imgPos || !imgOri || !pixelSpacing || !element) {
            return null;
        }

        const imgPosArr = imgPos.split("\\");
        const imgOriArr = imgOri.toString().split("\\");
        const pixelSpaceArr = pixelSpacing.toString().split("\\");

        cachedVoxelContext = {
            Sx: (parseFloat(imgPosArr[0]) * 10) / 10,
            Sy: (parseFloat(imgPosArr[1]) * 10) / 10,
            Xx: (parseFloat(imgOriArr[0]) * 10) / 10,
            Xy: (parseFloat(imgOriArr[1]) * 10) / 10,
            Yx: (parseFloat(imgOriArr[3]) * 10) / 10,
            Yy: (parseFloat(imgOriArr[4]) * 10) / 10,
            Di: parseFloat(pixelSpaceArr[0] * 10) / 10,
            Dj: parseFloat(pixelSpaceArr[1] * 10) / 10,
        };

        ensureInteractionListeners(element);

        return [
            cachedVoxelContext.Sx,
            cachedVoxelContext.Sy,
            cachedVoxelContext.Di,
            cachedVoxelContext.Dj,
            Px,
            Py,
        ];
    } catch (err) {
        let message = err;

        if (err.exception) {
            message = err.exception;
        }

        alert(message);
        return null;
    }
}

export default voxelCal;
