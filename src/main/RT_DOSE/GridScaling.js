import {DoseCheckbox, doseCheckEvent} from "./DoseCheckbox";

let dose_value = [];
/**
 * @function gridScaling
 * @param {object} dose_image -> Dose image object
 * @param {object} dose_pixel_data ->  Dose pixel data
 * @param {number} Rows -> Row value of received dose ( tag : x00280010 )
 * @param {number} Columns -> Columns value of received dose ( tag : x00280011 )
 * @param {number} Number_of_Frames -> Number_of_Frames value of received dose ( tag : x00280008 )
 * @description
 * This function deals with
 * 1. Obtain dose values
 * 2. GridScaling the pixel data to obtain the dose value.
 * 3. Obtain max Dose value
 * 4. Function call
 * <br> 1) name : doseCheckbox
 * <br>    param : dosemax
 * <br> 2) name : doseCheckEvent
 *
 * < DICOM tag >
 *   <br>  1) Dose_Grid_SCaling : x3004000e
 */
//calculate Dose value
function gridScaling(dose_image, dose_pixel_data, Rows, Columns, Number_of_Frames) {
    let Dose_Grid_Scaling = parseFloat(dose_image.data.string('x3004000e'));
    let dose_value_temp = [];

    //초기화
    for (let i = 0; i < Number_of_Frames; i++) {
        dose_value_temp[i] = [];
    }

    //calculate dose value
    for (let i = 0; i < dose_pixel_data.length; i++) {
        dose_value_temp[i] = dose_pixel_data[i] * Dose_Grid_Scaling * 100;
    }

    // javascript는 이렇게 각각 다 초기화 해줘야함..
    let cnt = 0;
    for (let z = 111; z > 111 - Number_of_Frames; z--) {
        dose_value[z] = [];
    }

    for (let z = 111; z > 111 - Number_of_Frames; z--) {
        for (let y = 1; y <= Rows; y++) {
            dose_value[z][y] = [];
        }
    }
    for (let z = 111; z > 111 - Number_of_Frames; z--) {
        for (let y = 1; y <= Rows; y++) {
            for (let x = 1; x <= Columns; x++) {

                dose_value[z][y][x] = [];
            }
        }
    }

    let dose_sort = [];
    //convert array to 3 dimension
    for (let z = 111; z > 111 - Number_of_Frames; z--) {
        for (let y = 1; y <= Rows; y++) {
            for (let x = 1; x <= Columns; x++) {
                dose_value[z][y][x] = dose_value_temp[cnt];
                dose_sort.push(dose_value[z][y][x]);
                cnt++;
            }
        }
    }

    // find dose Max value
    dose_sort.sort(function (a, b) {
        return b - a;
    })

    let dosemax = dose_sort[0];

    DoseCheckbox(dosemax);
    doseCheckEvent();
}

/**
 * @function getDoseValue
 * @return dose_value
 * @description
 * This function deals with
 * 1. return dose_value
 */
function getDoseValue(){
    return dose_value;
}

export {gridScaling,getDoseValue};
