import {gridScaling} from "../Loader/firstLoader";

let Rows, Columns, Number_of_Frames;
function dose_pixel_Data_parse(image, dataSet) {
    let pixelDataElement = dataSet.elements.x7fe00010;
    let pixel_data = new Uint16Array(dataSet.byteArray.buffer, pixelDataElement.byteOffset, pixelDataElement.length / 4);

    Rows = parseFloat(dataSet.uint16('x00280010'));
    Columns = parseFloat(dataSet.uint16('x00280011'));
    Number_of_Frames = parseFloat(image.data.string('x00280008'));

    gridScaling(image, pixel_data, Rows, Columns, Number_of_Frames);
}


export {dose_pixel_Data_parse}
