import {gridScaling} from "../Loader/firstLoader";
import dcmjs from "dcmjs";
import dicomParser from "dicom-parser";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math"
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"

cornerstoneWadoImageLoader.external.cornerstone = cornerstone
cornerstoneWadoImageLoader.external.dicomParser = dicomParser
cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.init();
let Rows, Columns, Number_of_Frames;

function dose_pixel_Data_parse(image, dataSet) {
        let pixelDataElement = dataSet.elements.x7fe00010;
        let pixel_data = new Uint32Array(dataSet.byteArray.buffer.slice(pixelDataElement.dataOffset),0,pixelDataElement.length/4);

        Rows = parseFloat(dataSet.uint16('x00280010'));
        Columns = parseFloat(dataSet.uint16('x00280011'));
        Number_of_Frames = parseFloat(image.data.string('x00280008'));

        gridScaling(image, pixel_data, Rows, Columns, Number_of_Frames);
}

export {dose_pixel_Data_parse}
