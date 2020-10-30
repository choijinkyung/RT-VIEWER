import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"

//dose파일 열어서 보기 function
import {doseFile} from "../isodose";

function handleFileChange(e) {
    e.stopPropagation();
    e.preventDefault();

    let files = e.target.files;
    // this UI is only built for a single file so just dump the first one
    // structFile(files[0]);
    doseFile(files[0]);

    const imageId = cornerstoneWadoImageLoader.wadouri.fileManager.add(files[0]);

}

export default handleFileChange
