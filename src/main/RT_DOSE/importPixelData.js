import {gridScaling} from "./gridScaling";

let Rows, Columns, Number_of_Frames;
/**
 * @function importPixelData
 * @param {object} dose_image ->Dose Image
 * @param {object} dataSet ->  Dose dataset
 * @description
 * This function deals with
 * 1. Import Dose Pixel Data
 * 2. Parse the Pixel Data
 * 4. Function call
 * <br> 1) name : gridScaling
 * <br>    param :dose_image, dose_pixel_data, Rows, Columns, Number_of_Frames
 *
 * < DICOM tag >
 *     1) Pixel Data : x7fe00010
 *     2) Bits Allocated : x00280100
 */
function importPixelData(dose_image, dataSet) {
        try{
                let pixelDataElement = dataSet.elements.x7fe00010;
                let Bits_Allocated = dose_image.data.uint16('x00280100');

                let dose_pixel_data =[];

                if(Bits_Allocated === 32 || Bits_Allocated ==='32' ){
                        dose_pixel_data = new Uint32Array(dataSet.byteArray.buffer.slice(pixelDataElement.dataOffset),0,pixelDataElement.length/4);
                }else if (Bits_Allocated === 16 || Bits_Allocated ==='16'){
                        dose_pixel_data = new Uint16Array(dataSet.byteArray.buffer.slice(pixelDataElement.dataOffset),0,pixelDataElement.length/4);
                }

                Rows = parseFloat(dataSet.uint16('x00280010'));
                Columns = parseFloat(dataSet.uint16('x00280011'));
                Number_of_Frames = parseFloat(dose_image.data.string('x00280008'));

                gridScaling(dose_image, dose_pixel_data, Rows, Columns, Number_of_Frames);
        }catch (err){
                var message = err;
                if (err.exception) {
                        message = err.exception;
                        alert(message)
                }
        }

}

export {importPixelData}
