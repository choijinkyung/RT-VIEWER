import {doseFile} from "../RT_DOSE/doseDataParser";

function handleFileChange(e) {
    e.stopPropagation();
    e.preventDefault();

    let files = e.target.files;
    // this UI is only built for a single file so just dump the first one
    doseFile(files[0]);
}

export default handleFileChange
