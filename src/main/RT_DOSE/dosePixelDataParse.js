import {gridScaling} from "../Loader/loadCTImage";

let Rows, Columns, Number_of_Frames;
function dose_pixel_Data_parse(image, dataSet) {
    let pixelDataElement = dataSet.elements.x7fe00010;
    let pixel_data = new Uint16Array(dataSet.byteArray.buffer, pixelDataElement.byteOffset, pixelDataElement.length / 4);

    Rows = parseFloat(dataSet.uint16('x00280010'));
    Columns = parseFloat(dataSet.uint16('x00280011'));
    Number_of_Frames = parseFloat(image.data.string('x00280008'));

    //초기화
    let dose_grid = [];
    for (let z = 0; z < Number_of_Frames; z++) {
        dose_grid[z] = [];
    }
    for (let z = 0; z < Number_of_Frames; z++) {
        for (let y = 0; y < Columns; y++) {
            dose_grid[z][y] = [];
        }
    }

    for (let z = 0; z < Number_of_Frames; z++) {
        for (let y = 0; y < Columns; y++) {
            for (let x = 0; x < Rows; x++) {
                dose_grid[z][y][x] = [];
            }
        }
    }
    let count = 0;

    for (let z = 0; z < Number_of_Frames; z++) {
        for (let y = 0; y < Columns; y++) {
            for (let x = 0; x < Rows; x++) {
                dose_grid[z][y][x] = pixel_data[count];
                count++;

            }
        }
    }

    gridScaling(image, dose_grid, Rows, Columns, Number_of_Frames);
}



export {dose_pixel_Data_parse}
