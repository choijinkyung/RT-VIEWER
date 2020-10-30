import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import {doseFile} from "../RT_DOSE/isodose";

// this function gets called once the user drops the file onto the div
//for drag and drop import doseFile
function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    // Get the FileList object that contains the list of files that were dropped
    let files = evt.dataTransfer.files;

    doseFile(files[0]);
    const imageId = cornerstoneWadoImageLoader.wadouri.fileManager.add(files[0]);
}

//this function manage drag event
function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

export {handleFileSelect,handleDragOver}
