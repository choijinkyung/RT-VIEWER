import patientInformation from "../patientInformation";
import dicomParser from "dicom-parser";
import Hammer from "hammerjs";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math"
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import voxelCal from "../RT_STRUCTURE/pixel2voxel";
import {structFile, reset, getImage, sendDrawImage} from "../RT_STRUCTURE/drawROI";
import {doseFile} from "../RT_DOSE/doseDataParser";
import {Dose_Checkbox, Dose_checkEvent} from "../RT_DOSE/doseCheckbox";
import {checkAndDraw} from "../RT_DOSE/drawDose";

cornerstoneWadoImageLoader.external.cornerstone = cornerstone
cornerstoneWadoImageLoader.external.dicomParser = dicomParser
cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.init();

let currentImageIndex = 110; //for dose z coords setting
let fileJsonArray = [];

//Import a list of file names from a selected folder
function imageIdList(e) {
    let imageId = []; //image ID list from file name list
    let temp_imageId = [];

    let files = e.target.files;
    let fileName = [];

    for (let i = 0; i < files.length; i++) {
        let fileJson = {};
        fileName[i] = parseFloat(files[i].webkitRelativePath.toString().split('.')[11]);
        temp_imageId[i] = cornerstoneWadoImageLoader.wadouri.fileManager.add(files[i])

        fileJson.fileName = fileName[i];
        fileJson.imageId = temp_imageId[i];

        fileJsonArray.push(fileJson);
    }

    //file name sorting
    fileJsonArray.sort(function (a, b) {
        return a.fileName - b.fileName;
    })

    //assign imageId value
    for (let i = 0; i < files.length; i++) {
        imageId[i] = fileJsonArray[i].imageId;
    }

    /*  // show file list
        let output = document.getElementById("listing");
        for (let i = 0; i < files.length; i++) {
            let item = document.createElement("li");
            item.innerHTML = fileName[i];
            output.appendChild(item);
        }
     */

    //Index 111 : RT DOSE FILE
    //Index 112 : RT PLAN FILE
    //Index 113 : RT STRUCTURE FILE
    firstLoader(imageId, currentImageIndex);
    structFile(files[113]);
    doseFile(files[111]);

    let el = document.getElementById('dicomImage');
    el.onwheel = wheelE;

    function wheelE(e) {
        // Firefox e.detail > 0 scroll back, < 0 scroll forward
        // chrome/safari e.wheelDelta < 0 scroll back, > 0 scroll forward
        e.stopPropagation();
        e.preventDefault();

        let index = currentImageIndex;

        if (index >= 0 || index < imageId.length) {
            if (e.deltaY < 0) {
                if (index === currentImageIndex) {
                    updateTheImage(imageId, currentImageIndex + 1); //update images
                    reset();
                }
            } else {
                if (index === currentImageIndex) {
                    updateTheImage(imageId, currentImageIndex - 1); //update images
                    reset();
                }
            }
        } else {
            updateTheImage(imageId, currentImageIndex); //update images
            reset();
        }
        // Prevent page fom scrolling
        return false;
    }
}

let checkVal_check_dose = [];

function getCheckValue(checkVal_check) {
    checkVal_check_dose = checkVal_check;
}

let dose_value = [];
//calculate Dose value
function gridScaling(image, pixel_data, Rows, Columns, Number_of_Frames) {
    let Dose_Grid_Scaling = parseFloat(image.data.string('x3004000e'));
    let dose_value_temp = [];


    //초기화
    for (let i = 0; i < Number_of_Frames; i++) {
        dose_value_temp[i] = [];
    }

    //calculate dose value
    for (let i = 0; i < pixel_data.length; i++) {
        dose_value_temp[i] = pixel_data[i] * Dose_Grid_Scaling * 100;
    }

    let cnt = 0;
    for (let z = 110; z > 110 - Number_of_Frames; z--) {
        dose_value[z] = [];
    }

    for (let z = 110; z > 110 - Number_of_Frames; z--) {
        for (let y = 0; y < Columns; y++) {
            dose_value[z][y] = [];
        }
    }
    for (let z = 110; z > 110 - Number_of_Frames; z--) {
        for (let y = 0; y < Columns; y++) {
            for (let x = 0; x < Rows; x++) {

                dose_value[z][y][x] = [];
            }
        }
    }

    let dose_sort=[];
    //convert array to 3 dimension
    for (let z = 110; z > 110 - Number_of_Frames; z--) {
        for (let y = 0; y < Columns; y++) {
            for (let x = 0; x < Rows; x++) {
                dose_value[z][y][x] = dose_value_temp[cnt];
                dose_sort.push(dose_value[z][y][x]);
                cnt++;
            }
        }
    }

    let dosemax=0;

    dose_sort.sort(function (a, b) {
        return b - a;
    })

    dosemax = dose_sort[0];

    Dose_Checkbox(dosemax);
    Dose_checkEvent();
}

let img;
// show image #1 initially
function updateTheImage(imageIds, imageIndex) {
    let el = document.getElementById('dicomImage');
    cornerstone.enable(el)
    currentImageIndex = imageIndex;
    cornerstone.loadImage(imageIds[imageIndex]).then(function (image) {
        const viewport = cornerstone.getDefaultViewportForImage(el, image);
        if (image.data.string('x00080016') === '1.2.840.10008.5.1.4.1.1.2' || image.data.string('x00080016') === '1.2.840.10008.5.1.4.1.1.481.2') {
            cornerstone.displayImage(el, image, viewport);

            patientInformation(image);
            voxelCal(image);
            getImage(image);
            sendDrawImage(image);

            checkAndDraw(dose_value[currentImageIndex], checkVal_check_dose);

            img = image;
        } else {
            alert("ERROR: Confirm this image's modality : CT , MRI ... ");
        }
    });
    return img;
}

//load one CT Image from local file
function firstLoader(imageIds, imageIndex) {
    let el = document.getElementById('dicomImage');
    cornerstone.enable(el)
    cornerstone.loadImage(imageIds[imageIndex]).then(function (image) {
        const viewport = cornerstone.getDefaultViewportForImage(el, image);
        if (image.data.string('x00080016') === '1.2.840.10008.5.1.4.1.1.2' || image.data.string('x00080016') === '1.2.840.10008.5.1.4.1.1.481.2') {
            cornerstone.displayImage(el, image, viewport);

            patientInformation(image);
            voxelCal(image);
            getImage(image);
            sendDrawImage(image);

            getCheckValue([]);
            img = image;

        } else if (image.data.string('x0080016') === '1.2.840.10008.5.1.4.1.1.481.2') {
            alert('dose file')
        } else {
            alert("ERROR: Confirm this image's modality : CT , MRI ... ");
        }
    });

    return img;
}

export {firstLoader, imageIdList, gridScaling, getCheckValue}


