import dicomParse from "./dicomParse";
import dicomParser from "dicom-parser";
import Hammer from "hammerjs";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math"
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import voxelCal from "./pixel2voxel";
import readTextFile from "./openFile";
import { structFile, sendImage, reset } from "./ROI";

cornerstoneWadoImageLoader.external.cornerstone = cornerstone
cornerstoneWadoImageLoader.external.dicomParser = dicomParser
cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.init();

let currentImageIndex = 72;

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
    let cnt=0;



    for (let i = 0; i < max; i++) {
        imageId[i] = cornerstoneWadoImageLoader.wadouri.fileManager.add(e.target.files[i]) //save file name in array
        dumpFiles[i] = e.target.files[i];
        if(cnt>max){
            alert('ERROR : There are Too many files.');
        }
        cnt ++;
    }

    //Index 114 : RT STRUCTURE FILE
    //Index 72 : initial CT Image
    //dumpFile(dumpfiles[71]);
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
            index = currentImageIndex;
            updateTheImage(imageId, currentImageIndex); //update images
            reset();
        }
        // Prevent page fom scrolling
        return false;
    }
}



let img;

// show image #1 initially
function updateTheImage(imageIds, imageIndex) {
    let el = document.getElementById('dicomImage');
    cornerstone.enable(el)
    currentImageIndex = imageIndex;
    cornerstone.loadImage(imageIds[currentImageIndex]).then(function (image) {
        const viewport = cornerstone.getDefaultViewportForImage(el, image);

        if(image.data.string('x00080060')==='CT' || image.data.string('x00080060')==='ct' || image.data.string('x00080060')==='MRI'  ){
            cornerstone.displayImage(el, image, viewport);

            dicomParse(image);
            voxelCal(image);
            sendImage(image);
            img = image;
        }
        else{
            alert("ERROR: Confirm this image's modality : CT , MRI ... ");
        }

    });

    return img;
}


function handleFileChange(e) {
    e.stopPropagation();
    e.preventDefault();

    let files = e.target.files;
    // this UI is only built for a single file so just dump the first one
    structFile(files[0]);
    const imageId = cornerstoneWadoImageLoader.wadouri.fileManager.add(files[0]);
    loadData(imageId);
}

//load one CT Image from local file
function loadData(imageId) {
    let el = document.getElementById('dicomImage');
    cornerstone.enable(el)
    cornerstone.loadImage(imageId).then(function (image) {
        const viewport = cornerstone.getDefaultViewportForImage(el, image);
        if(image.data.string('x00080060')==='CT' || image.data.string('x00080060')==='ct' || image.data.string('x00080060')==='MRI'  ){
            cornerstone.displayImage(el, image, viewport);

            dicomParse(image);
            voxelCal(image);
            sendImage(image);
            img = image;
        }
        else{
            alert("ERROR: Confirm this image's modality : CT , MRI ... ");
        }
    });
    return img;
}

//open test file
function handle() {
    const imageId = 'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm';
    loadData(imageId);
}

// this function gets called once the user drops the file onto the div
function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    // Get the FileList object that contains the list of files that were dropped
    let files = evt.dataTransfer.files;

    // this UI is only built for a single file so just dump the first one
    structFile(files[0]);

    const imageId = cornerstoneWadoImageLoader.wadouri.fileManager.add(files[0]);
    loadData(imageId);
}

//this function manage drag event
function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

export { handleFileChange, handle, loadData, imageIdList, handleFileSelect, handleDragOver }
