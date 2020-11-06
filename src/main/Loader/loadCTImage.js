import dicomParse from "../dicomParse";
import dicomParser from "dicom-parser";
import Hammer from "hammerjs";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math"
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import voxelCal from "../RT_STRUCTURE/pixel2voxel";
import {structFile, reset, getImage, sendDrawImage} from "../RT_STRUCTURE/ROI";
import {doseFile, getCheckValue} from "../RT_DOSE/isodose";
import {Dose_Checkbox, Dose_checkEvent} from "../RT_DOSE/doseCheckbox";
import {checkAndDraw} from "../RT_DOSE/isodose";

cornerstoneWadoImageLoader.external.cornerstone = cornerstone
cornerstoneWadoImageLoader.external.dicomParser = dicomParser
cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.init();

let currentImageIndex = 62;

//Import a list of file names from a selected folder
function imageIdList(e) {
    let imageId = []; //image ID list from file name list
    let dumpFiles = [];
    let max = 1000000;
    /*
      let output = document.getElementById("listing");
      let files = e.target.files;

   // show file list
     for (let i=0; i<files.length; i++) {
         let item = document.createElement("li");
         item.innerHTML = files[i].webkitRelativePath;
         output.appendChild(item);
     };
    */
    let cnt = 0;

    for (let i = 0; i < max; i++) {
        dumpFiles[i] = e.target.files[i];
        imageId[i] = cornerstoneWadoImageLoader.wadouri.fileManager.add(dumpFiles[i]) //save file name in array

        if (cnt > max) {
            alert('ERROR : There are Too many files.');
        }
        cnt++;
    }

    //Index 111 : RT DOSE FILE
    //Index 112 : RT PLAN FILE
    //Index 113 : RT STRUCTURE FILE
    doseFile(dumpFiles[111]);
    structFile(dumpFiles[113]);
    loadCTImage(imageId[currentImageIndex]);

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
                    checkAndDraw(dose_value[currentImageIndex + 1]);
                    reset();
                }
            } else {
                if (index === currentImageIndex) {
                    updateTheImage(imageId, currentImageIndex - 1); //update images
                    checkAndDraw(dose_value[currentImageIndex - 1]);
                    reset();
                }
            }
        } else {
            updateTheImage(imageId, currentImageIndex); //update images
            checkAndDraw(dose_value[currentImageIndex]);
            reset();
        }
        // Prevent page fom scrolling
        return false;
    }
}

let dose_value = [];
//calculate Dose value
function gridScaling(image, dose_grid, Rows, Columns, Number_of_Frames) {
    let Dose_Grid_Scaling;
    Dose_Grid_Scaling = image.data.string('x3004000e');
    let dosemax=0;
    //초기화
    for (let i = 0; i < Number_of_Frames; i++) {
        dose_value[i] = [];
    }
    for (let i = 0; i < Number_of_Frames; i++) {
        for (let j = 0; j < Columns; j++) {
            dose_value[i][j] = [];
        }
    }
    for (let i = 0; i < Number_of_Frames; i++) {
        for (let j = 0; j < Columns; j++) {
            for (let k = 0; k < Rows; k++) {
                dose_value[i][j][k] = [];
            }
        }
    }

    //calculate dose value
    for (let z = 0; z < Number_of_Frames; z++) {
        for (let y = 0; y < Columns; y++) {
            for (let x = 0; x < Rows; x++) {
                dose_value[z][y][x] = dose_grid[z][y][x] * Dose_Grid_Scaling / 1000 ;
                dosemax = Math.max(dose_value[z][y][x]);

            }
        }
    }

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

            dicomParse(image);
            voxelCal(image);
            getImage(image);
            sendDrawImage(image);

            img = image;
        } else {
            alert("ERROR: Confirm this image's modality : CT , MRI ... ");
        }
    });
    return img;
}


//load one CT Image from local file
function loadCTImage(imageId) {
    let el = document.getElementById('dicomImage');
    cornerstone.enable(el)
    cornerstone.loadImage(imageId).then(function (image) {
        const viewport = cornerstone.getDefaultViewportForImage(el, image);
        if (image.data.string('x00080016') === '1.2.840.10008.5.1.4.1.1.2' || image.data.string('x00080016') === '1.2.840.10008.5.1.4.1.1.481.2') {
            cornerstone.displayImage(el, image, viewport);

            dicomParse(image);
            voxelCal(image);
            getImage(image);
            sendDrawImage(image);
            checkAndDraw(dose_value[currentImageIndex]);

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

export {loadCTImage, imageIdList, gridScaling}


