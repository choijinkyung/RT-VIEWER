import {gridScaling} from "../Loader/firstLoader";

let Rows, Columns, Number_of_Frames;
function dose_pixel_Data_parse(dose_image, dataSet) {
        let pixelDataElement = dataSet.elements.x7fe00010;
        let dose_pixel_data = new Uint32Array(dataSet.byteArray.buffer.slice(pixelDataElement.dataOffset),0,pixelDataElement.length/4);

        Rows = parseFloat(dataSet.uint16('x00280010'));
        Columns = parseFloat(dataSet.uint16('x00280011'));
        Number_of_Frames = parseFloat(dose_image.data.string('x00280008'));

        gridScaling(dose_image, dose_pixel_data, Rows, Columns, Number_of_Frames);
}

export {dose_pixel_Data_parse}
