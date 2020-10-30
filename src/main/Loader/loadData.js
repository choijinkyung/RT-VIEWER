import dicomParse from "../dicomParse";
import dicomParser from "dicom-parser";
import Hammer from "hammerjs";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math"
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import voxelCal from "../pixel2voxel";
import readTextFile from "../openFile";
import {structFile, reset, getImage, sendDrawImage} from "../ROI";
import {dumpFile} from '../dumpFile'

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
    let filename = [];
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

    //doseFile(dumpFiles[111]);
    structFile(dumpFiles[113]);
    updateTheImage(imageId, currentImageIndex);

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
                    // dumpFile(dumpfiles[currentImageIndex ]); // update dump
                }
            } else {
                if (index === currentImageIndex) {
                    updateTheImage(imageId, currentImageIndex - 1); //update images
                    reset();
                    //  dumpFile(dumpfiles[currentImageIndex]); // update dump

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


let img;

// show image #1 initially
function updateTheImage(imageIds ,imageIndex) {
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
function loadData(imageId) {
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

            img = image;

        } else if (image.data.string('x0080016') === '1.2.840.10008.5.1.4.1.1.481.2') {
            alert('dose file')
        } else {
            alert("ERROR: Confirm this image's modality : CT , MRI ... ");
        }
    });
    return img;
}

export {loadData, imageIdList}
