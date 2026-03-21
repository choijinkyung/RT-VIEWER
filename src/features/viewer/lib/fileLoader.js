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
let sampleLoadPromise = null;
let currentImageIds = [];
let currentSeriesIndex = 0;
let currentSeriesGroups = [];
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

    const imagePosition = renderedImage.data.string("x00200032");
    const topleft2 = document.getElementById("topleft2");

    if (imagePosition && topleft2) {
        const position = imagePosition.split("\\")[2];
        topleft2.textContent = "Position : " + position + "mm";
    }

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

function extractNumericValue(value, fallback = Number.NaN) {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? fallback : parsed;
}

async function readDicomMetadata(file, imageId) {
    try {
        const buffer = await file.arrayBuffer();
        const byteArray = new Uint8Array(buffer);
        const dataSet = dicomParser.parseDicom(byteArray);
        const sopClassUid = dataSet.string("x00080016") || "";

        return {
            file,
            imageId,
            fileName: getSortableImageNumber(file),
            instanceNumber: extractNumericValue(dataSet.string("x00200013"), getSortableImageNumber(file)),
            seriesInstanceUID: dataSet.string("x0020000e") || "unknown-series",
            studyInstanceUID: dataSet.string("x0020000d") || "unknown-study",
            seriesNumber: extractNumericValue(dataSet.string("x00200011"), 0),
            seriesDescription: dataSet.string("x0008103e") || "Unnamed Series",
            modality: dataSet.string("x00080060") || "",
            sopClassUid,
        };
    } catch (error) {
        return {
            file,
            imageId,
            fileName: getSortableImageNumber(file),
            instanceNumber: getSortableImageNumber(file),
            seriesInstanceUID: "unknown-series",
            studyInstanceUID: "unknown-study",
            seriesNumber: 0,
            seriesDescription: "Unnamed Series",
            modality: "",
            sopClassUid: "",
        };
    }
}

function isDiagnosticImage(metadata) {
    const diagnosticSopClasses = new Set([
        "1.2.840.10008.5.1.4.1.1.2",
        "1.2.840.10008.5.1.4.1.1.4",
    ]);

    return diagnosticSopClasses.has(metadata.sopClassUid);
}

function buildSeriesGroups(metadataList) {
    const groups = new Map();

    metadataList
        .filter((metadata) => isDiagnosticImage(metadata))
        .forEach((metadata) => {
            const groupKey = `${metadata.studyInstanceUID}::${metadata.seriesInstanceUID}`;

            if (!groups.has(groupKey)) {
                groups.set(groupKey, {
                    studyInstanceUID: metadata.studyInstanceUID,
                    seriesInstanceUID: metadata.seriesInstanceUID,
                    seriesNumber: metadata.seriesNumber,
                    seriesDescription: metadata.seriesDescription,
                    modality: metadata.modality,
                    imageIds: [],
                    items: [],
                });
            }

            const group = groups.get(groupKey);
            group.items.push(metadata);
        });

    return Array.from(groups.values())
        .map((group) => {
            group.items.sort((left, right) => left.instanceNumber - right.instanceNumber);
            group.imageIds = group.items.map((item) => item.imageId);
            return group;
        })
        .sort((left, right) => {
            if (left.studyInstanceUID !== right.studyInstanceUID) {
                return left.studyInstanceUID.localeCompare(right.studyInstanceUID);
            }

            if (left.seriesNumber !== right.seriesNumber) {
                return left.seriesNumber - right.seriesNumber;
            }

            return left.seriesDescription.localeCompare(right.seriesDescription);
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
async function loadFiles(files) {
    emitViewerEvent("rtviewer:load-start");

    const fileEntries = Array.from(files).map((file) => ({
        file,
        imageId: cornerstoneWadoImageLoader.wadouri.fileManager.add(file),
    }));
    const metadataList = await Promise.all(
        fileEntries.map(({file, imageId}) => readDicomMetadata(file, imageId))
    );

    currentSeriesGroups = buildSeriesGroups(metadataList);
    currentSeriesIndex = 0;
    currentImageIds = currentSeriesGroups[0] ? currentSeriesGroups[0].imageIds : [];

    if (currentImageIds.length === 0) {
        emitViewerEvent("rtviewer:load-error");
        alert("No CT image files were found in the selected folder.");
        return;
    }

    const fileLength = currentImageIds.length;

    //이 프로젝트에 포함된 TEST849 폴더에서만 가능 (하드코딩)
    // RT Dose, RT Plan, RT Structure로 파일 이름 변경한 후의 순서
    //Index 112 : RT DOSE FILE
    //Index 113 : RT PLAN FILE
    //Index 114 : RT STRUCTURE FILE
    const doseTargetFile = findFileByKeywords(files, ["rtdose", "rtdose"]) || files[112];
    const structTargetFile = findFileByKeywords(files, ["rtstructure", "rtstruct", "rtst"]) || files[114];
    currentImageIndex = Math.min(currentImageIndex, currentImageIds.length - 1);

    updateTheImage(currentImageIds, currentImageIndex, fileLength);

    if (structTargetFile) {
        structFile(structTargetFile);
    }

    if (doseTargetFile) {
        doseFile(doseTargetFile);
    }

    const el = document.getElementById("dicomImage");

    if (el) {
        el.removeEventListener("cornerstonenewimage", handleViewerImageChanged);
        el.addEventListener("cornerstonenewimage", handleViewerImageChanged);
        syncStackState(el, currentImageIds, currentImageIndex);
        updateImageOverlay(el, fileLength);
    }

    emitViewerEvent("rtviewer:dataset-ready", {
        seriesCount: currentSeriesGroups.length,
        totalImages: currentImageIds.length,
    });
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

function getSeriesGroups() {
    return currentSeriesGroups.map((group) => ({
        studyInstanceUID: group.studyInstanceUID,
        seriesInstanceUID: group.seriesInstanceUID,
        seriesNumber: group.seriesNumber,
        seriesDescription: group.seriesDescription,
        modality: group.modality,
        imageCount: group.imageIds.length,
        imageIds: [...group.imageIds],
    }));
}

function getCurrentSeriesIndex() {
    return currentSeriesIndex;
}

function setCurrentSeriesIndex(seriesIndex) {
    if (!currentSeriesGroups.length) {
        return false;
    }

    const safeSeriesIndex = Math.max(0, Math.min(seriesIndex, currentSeriesGroups.length - 1));
    currentSeriesIndex = safeSeriesIndex;
    currentImageIds = currentSeriesGroups[safeSeriesIndex].imageIds;
    currentImageIndex = Math.max(0, Math.min(currentImageIndex, currentImageIds.length - 1));
    updateTheImage(currentImageIds, currentImageIndex, currentImageIds.length);
    return true;
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

        await loadFiles(files);
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

    if (!el) {
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
    getCurrentSeriesIndex,
    getSeriesGroups,
    getTotalSliceCount,
    goToSlice,
    loadBundledSample,
    redrawCurrentImageOverlays,
    setCurrentSeriesIndex,
    stepSlice,
}
