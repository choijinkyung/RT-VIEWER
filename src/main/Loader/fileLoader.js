import patientInformation from "../patientInformation";
import dicomParser from "dicom-parser";
import Hammer from "hammerjs";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math"
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import voxelCal from "../RT_STRUCTURE/pixel2voxel";
import {reset} from "../RT_STRUCTURE/drawROI";
import {getCTimage, doseFile} from "../RT_DOSE/convertMatrix";
import {checkAndDraw} from "../RT_DOSE/drawDose";
import {getDoseValue} from "../RT_DOSE/gridScaling";
import {structFile} from "../RT_STRUCTURE/getROIList";
import {directCheckAndDraw} from "../RT_STRUCTURE/RTStructureData2JSON";

cornerstoneWadoImageLoader.external.dicomParser = dicomParser
cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.init();


let currentImageIndex = 111; //for dose z coords setting
let fileJsonArray = []; //Initialization Json Array , Only global variables are possible
/**
 * @method fileLoader
 * @param {event} e -> Event that occurs when Input tag call onChange function
 * @description
 * This function deals with
 * 1. function call for CTImage, RT DOSE, RT STRUCTURE files load
 * 2. mouseWheel event function -> update image & dose pixel data
 */
function fileLoader(e) {
    let imageId = []; //image ID list from file name list
    let temp_imageId = [];

    let files = e.target.files; // event data transfer
    let fileName = [];

    for (let i = 0; i < files.length; i++) {
        let fileJson = {};
        //파일 이름 string순이 아닌 number로 정렬해주기 위함
        //현재는 하드코딩으로 파일 이름을 임의로 불러옴
        // 파일 이름의 마지막이 정렬되어야 CT가 순서대로 load 됨.
        fileName[i] = parseFloat(files[i].webkitRelativePath.toString().split('.')[11]);
        temp_imageId[i] = cornerstoneWadoImageLoader.wadouri.fileManager.add(files[i])

        fileJson.fileName = fileName[i];
        fileJson.imageId = temp_imageId[i];

        fileJsonArray.push(fileJson);
    }

    let fileLength = files.length;
    //file name sorting
    fileJsonArray.sort(function (a, b) {
        return a.fileName - b.fileName;
    })

    //assign imageId value
    for (let i = 0; i < fileLength; i++) {
        imageId[i] = fileJsonArray[i].imageId;
    }

    //Index 112 : RT DOSE FILE
    //Index 113 : RT PLAN FILE
    //Index 114 : RT STRUCTURE FILE
    updateTheImage(imageId, currentImageIndex);
    structFile(files[114]);
    doseFile(files[112]);

    let el = document.getElementById('dicomImage');
    el.onwheel = wheelE;

    /**
     * @method wheelE
     * @param {event} e -> Event that occurs when mouse wheel
     * @return false -> Prevent page from scrolling
     * @description
     * This function deals with
     * 1. Transforming the z-coordinates of CT and DOSE use mouse Wheel
     * 2. Load them in order
     * 3. Output Image index and z coordinate
     * 4. Function call
     *     <br> 1) name : updateTheImage
     *     <br>    param : imageId, currentImageIndex ( +1 , -1, 0 )
     *     <br>   2) name : reset
     */
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
                    document.getElementById('topleft1').textContent = 'Image : ' + (currentImageIndex + 1) + '/' + (fileLength - 3);
                    reset();
                }
            } else {
                if (index === currentImageIndex) {
                    updateTheImage(imageId, currentImageIndex - 1); //update images
                    document.getElementById('topleft1').textContent = 'Image : ' + (currentImageIndex + 1) + '/' + (fileLength - 3);
                    reset();
                }
            }
        } else {
            updateTheImage(imageId, currentImageIndex); //update images
            document.getElementById('topleft1').textContent = 'Image : ' + currentImageIndex + '/' + (fileLength - 3);
            reset();
        }
        return false;
    }
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
 *     <br> 7) name : checkAndDraw
 *     <br>  param : dose_value[currentImageIndex] , checkVal_check_dose
 *
 *
 * < DICOM Tag >
 * 1) SOP Class UID : x00080016

 */
function updateTheImage(CTimageIds, imageIndex) {
    let el = document.getElementById('dicomImage');
    cornerstone.enable(el)
    currentImageIndex = imageIndex;
    cornerstone.loadImage(CTimageIds[imageIndex]).then(function (CT_image) {
        const viewport = cornerstone.getDefaultViewportForImage(el, CT_image);
        if (CT_image.data.string('x00080016') === '1.2.840.10008.5.1.4.1.1.2') {
            cornerstone.displayImage(el, CT_image, viewport);

            patientInformation(CT_image);
            voxelCal(CT_image);
            getCTimage(CT_image);
            directCheckAndDraw(CT_image);

            getCheckValue(checkVal_check_dose);
            let dose_value = getDoseValue();
            checkAndDraw(dose_value[currentImageIndex], checkVal_check_dose);

            let position = CT_image.data.string('x00200032').split('\\')[2];
            document.getElementById('topleft2').textContent = 'Position : ' + position + 'mm';

            img = CT_image;
        } else if (CT_image.data.string('x0080016') === '1.2.840.10008.5.1.4.1.1.481.2') {
            alert('dose file')
        } else {
            alert("ERROR: Confirm this image's modality : CT , MRI ... ");
        }
    });
    return img;
}



let checkVal_check_dose = [];
/**
 * @method getCheckValue
 * @param {array} checkVal_check
 * @description
 * This function deals with
 * 1. Get checkValue checked in doseCheckBox function *
 */
function getCheckValue(checkVal_check) {
    checkVal_check_dose = checkVal_check;
}

export {fileLoader, getCheckValue}


