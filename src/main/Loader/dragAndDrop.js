import {doseFile} from "../RT_DOSE/convertMatrix";
/**
 * @function handleFileSelect
 * @param {event} e -> Events that occur when a file is selected
 * @description
 * This function deals with
 * 1. This function gets called once the user drops the file onto the div for drag and drop import doseFile
 * 2. drop event
 * 3. Function call
 *      <br>1) name : doseFile
 *        <br> param : files[0]
 */
function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    // Get the FileList object that contains the list of files that were dropped
    let files = e.dataTransfer.files;

    try{
        doseFile(files[0]);
    }catch (err){
        var message = err;
        if (err.exception) {
            message = err.exception;
            alert(message)
        }
    }

}

/**
 * @function handleDragOver
 * @param {event} e -> Events that occur handle Drag over
 * @description
 * This function deals with
 * 1. This function gets called once the user drops the file onto the div for drag and drop import doseFile
 * 2. dragOver event
 */
function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

export {handleFileSelect, handleDragOver}
