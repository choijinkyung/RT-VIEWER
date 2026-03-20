import patientInformation from "./patientInfo";
import dicomParser from "dicom-parser";
import Hammer from "hammerjs";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math"
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import voxelCal from "../../structure/pixelToVoxel";
import {reset} from "../../structure/drawROI";
import {getCTimage, doseFile} from "../../dose/convertMatrix";
import {doseCheckAndDraw} from "../../dose/drawDose";
import {getDoseValue} from "../../dose/gridScaling";
import {structFile} from "../../structure/getROIList";
import {directCheckAndDraw} from "../../structure/rtStructureData";
import ButtonEvent from "./toolManager";

cornerstoneWadoImageLoader.external.dicomParser = dicomParser
cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.init();

let currentImageIndex = 111; //for dose z coords setting
let fileJsonArray = []; //Initialization Json Array , Only global variables are possible
let sampleLoadPromise = null;
let currentImageIds = [];
const buttonEvent = new ButtonEvent();

function emitViewerEvent(name, detail = {}) {
    window.dispatchEvent(new CustomEvent(name, {detail}));
}

function syncStackState(element, imageIds, imageIndex) {
    if (!element || !imageIds || imageIds.length === 0) {
        return;
    }

    const safeIndex = Math.max(0, Math.min(imageIndex, imageIds.length - 1));
    const stackState = cornerstoneTools.getToolState(element, "stack");
    const stackData = stackState && stackState.data && stackState.data[0];

    if (!stackData) {
        cornerstoneTools.addStackStateManager(element, ["stack"]);
        cornerstoneTools.addToolState(element, "stack", {
            imageIds,
            currentImageIdIndex: safeIndex,
        });
        return;
    }

    stackData.imageIds = imageIds;
    stackData.currentImageIdIndex = safeIndex;
}

function updateImageOverlay(element, fileLength) {
    const stackState = cornerstoneTools.getToolState(element, "stack");
    const stackData = stackState && stackState.data && stackState.data[0];
    const totalImages = Math.max(fileLength || (currentImageIds.length - 3), 0);
    const currentIndex = stackData ? stackData.currentImageIdIndex : currentImageIndex;
    const viewport = cornerstone.getViewport(element);

    const topleft1 = document.getElementById("topleft1");
    const topright1 = document.getElementById("topright1");
    const topright2 = document.getElementById("topright2");

    if (topleft1) {
        topleft1.textContent = `Image : ${currentIndex + 1}/${totalImages}`;
    }

    if (viewport && topright1) {
        topright1.textContent = `WW/WC:${Math.round(viewport.voi.windowWidth)}/${Math.round(viewport.voi.windowCenter)}`;
    }

    if (viewport && topright2) {
        topright2.textContent = `Zoom:${viewport.scale.toFixed(2)}x`;
    }
}

function handleViewerImageChanged(event) {
    const element = event.currentTarget;
    const stackState = cornerstoneTools.getToolState(element, "stack");
    const stackData = stackState && stackState.data && stackState.data[0];
    const renderedImage = event.detail && event.detail.image;

    if (!renderedImage || renderedImage.data.string("x00080016") !== "1.2.840.10008.5.1.4.1.1.2") {
        return;
    }

    if (stackData) {
        currentImageIndex = stackData.currentImageIdIndex;
    }

    patientInformation(renderedImage);
    voxelCal(renderedImage);
    getCTimage(renderedImage);
    reset();
    directCheckAndDraw(renderedImage);
    getCheckValue(checkVal_check_dose);

    const doseValues = getDoseValue();
    if (doseValues && doseValues[currentImageIndex]) {
        doseCheckAndDraw(doseValues[currentImageIndex], checkVal_check_dose);
    }

    const position = renderedImage.data.string("x00200032").split("\\")[2];
    document.getElementById("topleft2").textContent = "Position : " + position + "mm";
    updateImageOverlay(element, currentImageIds.length);

    img = renderedImage;
    emitViewerEvent("rtviewer:image-ready", {
        currentImageIndex,
        totalImages: Math.max(currentImageIds.length, 0),
    });
}

function getSortableImageNumber(file) {
    const relativePath = (file.webkitRelativePath || file.name || "").toString();
    const matches = relativePath.match(/(\d+)(?=\.dcm$)/i);

    if (!matches) {
        return Number.NaN;
    }

    return parseFloat(matches[1]);
}

function findFileByKeywords(files, keywords) {
    return Array.from(files).find((file) => {
        const target = `${file.name} ${file.webkitRelativePath || ""}`.toLowerCase();
        return keywords.some((keyword) => target.includes(keyword));
    });
}
/**
 * @method fileLoader
 * @param {event} e -> Event that occurs when Input tag call onChange function
 * @description
 * This function deals with
 * 1. function call for CTImage, RT DOSE, RT STRUCTURE files load
 * 2. mouseWheel event function -> update image & dose pixel data
 */
function loadFiles(files) {
    emitViewerEvent("rtviewer:load-start");

    let imageId = []; //image ID list from file name list
    let temp_imageId = [];
    let fileName = [];
    fileJsonArray = [];

    for (let i = 0; i < files.length; i++) {
        let fileJson = {};
        //파일 이름 string순이 아닌 number로 정렬해주기 위함
        //현재는 하드코딩으로 파일 이름을 임의로 불러옴
        // 파일 이름의 마지막이 정렬되어야 CT가 순서대로 load 됨.
        fileName[i] = getSortableImageNumber(files[i]);
        temp_imageId[i] = cornerstoneWadoImageLoader.wadouri.fileManager.add(files[i])

        fileJson.fileName = fileName[i];
        fileJson.imageId = temp_imageId[i];

        fileJsonArray.push(fileJson);
    }

    const sortableFiles = fileJsonArray.filter((file) => !Number.isNaN(file.fileName));
    let fileLength = sortableFiles.length;
    //file name sorting
    sortableFiles.sort(function (a, b) {
        return a.fileName - b.fileName;
    })

    //assign imageId value
    for (let i = 0; i < fileLength; i++) {
        imageId[i] = sortableFiles[i].imageId;
    }

    currentImageIds = imageId;

    if (imageId.length === 0) {
        emitViewerEvent("rtviewer:load-error");
        alert("No CT image files were found in the selected folder.");
        return;
    }

    //이 프로젝트에 포함된 TEST849 폴더에서만 가능 (하드코딩)
    // RT Dose, RT Plan, RT Structure로 파일 이름 변경한 후의 순서
    //Index 112 : RT DOSE FILE
    //Index 113 : RT PLAN FILE
    //Index 114 : RT STRUCTURE FILE
    const doseTargetFile = findFileByKeywords(files, ["rtdose", "rtdose"]) || files[112];
    const structTargetFile = findFileByKeywords(files, ["rtstructure", "rtstruct", "rtst"]) || files[114];
    currentImageIndex = Math.min(currentImageIndex, imageId.length - 1);

    updateTheImage(imageId, currentImageIndex, fileLength);

    if (structTargetFile) {
        structFile(structTargetFile);
    }

    if (doseTargetFile) {
        doseFile(doseTargetFile);
    }

    const el = document.getElementById("dicomImage");
    el.removeEventListener("cornerstonenewimage", handleViewerImageChanged);
    el.addEventListener("cornerstonenewimage", handleViewerImageChanged);
    syncStackState(el, imageId, currentImageIndex);
    updateImageOverlay(el, fileLength);
}

function fileLoader(e) {
    return loadFiles(e.target.files);
}

function goToSlice(targetIndex) {
    if (!currentImageIds || currentImageIds.length === 0) {
        return false;
    }

    const safeIndex = Math.max(0, Math.min(targetIndex, currentImageIds.length - 1));
    updateTheImage(currentImageIds, safeIndex, currentImageIds.length);
    return true;
}

function stepSlice(step) {
    if (!currentImageIds || currentImageIds.length === 0) {
        return false;
    }

    return goToSlice(currentImageIndex + step);
}

function getCurrentSliceIndex() {
    return currentImageIndex;
}

function getTotalSliceCount() {
    return currentImageIds.length;
}

async function loadBundledSample() {
    if (sampleLoadPromise) {
        return sampleLoadPromise;
    }

    sampleLoadPromise = (async () => {
        const manifestUrl = `${process.env.PUBLIC_URL}/sample-data/manifest.json`;
        const manifestResponse = await fetch(manifestUrl);

        if (!manifestResponse.ok) {
            throw new Error("Unable to load the bundled sample manifest.");
        }

        const manifest = await manifestResponse.json();
        const files = await Promise.all(
            manifest.files.map(async (fileName) => {
                const fileUrl = `${process.env.PUBLIC_URL}/${manifest.basePath}/${fileName}`;
                const response = await fetch(fileUrl);

                if (!response.ok) {
                    throw new Error(`Unable to fetch bundled sample file: ${fileName}`);
                }

                const blob = await response.blob();
                const file = new File([blob], fileName, {
                    type: "application/dicom",
                    lastModified: Date.now(),
                });

                Object.defineProperty(file, "webkitRelativePath", {
                    value: `TEST849/${fileName}`,
                    configurable: true,
                });

                return file;
            })
        );

        loadFiles(files);
        return files;
    })();

    return sampleLoadPromise;
}


let img;
/**
 * @method updateTheImage
 * @param {object} CTimageIds
 * @param {number} imageIndex
 * @return img
 * @description
 * This function deals with
 * 1. Only CTImage load using cornerstone ImageLoader
 * 2. Load the image corresponding to the current index.
 * 3. Condition: Loading images only in CT
 * 4. function call
 *     <br>1) name : patientInformation
 *     <br>   param : CT_image
 *     <br> 2) name : voxelCal
 *     <br>    param : CT_image
 *     <br> 3) name : getCTImage
 *     <br>    param : CT_image
 *     <br> 4) name : getCTimage
 *     <br>    param : CT_image
 *     <br> 5) name : sendDrawImage
 *     <br>    param : CT_image
 *     <br> 6) name : getCheckValue
 *     <br>   param : checkVal_check_dose
 *     <br> 7) name : doseCheckAndDraw
 *     <br>  param : dose_value[currentImageIndex] , checkVal_check_dose
 *
 *
 * < DICOM Tag >
 * 1) SOP Class UID : x00080016

 */
function updateTheImage(CTimageIds, imageIndex, fileLength = CTimageIds.length) {
    let el = document.getElementById('dicomImage');
    if (!CTimageIds || CTimageIds.length === 0) {
        return img;
    }

    const safeImageIndex = Math.max(0, Math.min(imageIndex, CTimageIds.length - 1));
    try {
        cornerstone.getEnabledElement(el);
    } catch (error) {
        cornerstone.enable(el);
    }

    buttonEvent.ensureToolsRegisteredForElement(el);
    currentImageIndex = safeImageIndex;
    syncStackState(el, CTimageIds, safeImageIndex);
    cornerstone.loadImage(CTimageIds[safeImageIndex]).then(function (CT_image) {
        const viewport = cornerstone.getDefaultViewportForImage(el, CT_image);
        if (CT_image.data.string('x00080016') === '1.2.840.10008.5.1.4.1.1.2') {
            cornerstone.displayImage(el, CT_image, viewport);
            buttonEvent.enableDefaultWheelStackScroll();
            updateImageOverlay(el, fileLength);
        } else if (CT_image.data.string('x0080016') === '1.2.840.10008.5.1.4.1.1.481.2') {
            emitViewerEvent("rtviewer:load-error");
            alert('dose file')
        } else {
            emitViewerEvent("rtviewer:load-error");
            alert("ERROR: Confirm this image's modality : CT , MRI ... ");
        }
    }).catch(() => {
        emitViewerEvent("rtviewer:load-error");
    });
    return img;
}



let checkVal_check_dose = [];
/**
 * @method getCheckValue
 * @param {object} checkVal_check
 * @description
 * This function deals with
 * 1. Get checkValue checked in doseCheckBox function
 */
function getCheckValue(checkVal_check) {
    checkVal_check_dose = checkVal_check;
}

function redrawCurrentImageOverlays() {
    if (!img) {
        return;
    }

    reset();
    directCheckAndDraw(img);

    const doseValues = getDoseValue();
    if (doseValues && doseValues[currentImageIndex]) {
        doseCheckAndDraw(doseValues[currentImageIndex], checkVal_check_dose);
    }
}

export {
    fileLoader,
    getCheckValue,
    getCurrentSliceIndex,
    getTotalSliceCount,
    goToSlice,
    loadBundledSample,
    redrawCurrentImageOverlays,
    stepSlice,
}
