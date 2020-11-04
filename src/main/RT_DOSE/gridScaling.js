let Rows, Columns, Number_of_Frames;

function dose_pixel_Data_parse(image, dataSet) {
    let pixelDataElement = dataSet.elements.x7fe00010;
    let pixel_data = new Uint32Array(dataSet.byteArray.buffer, pixelDataElement.byteOffset, pixelDataElement.length / 4);


    Rows = parseFloat(dataSet.uint16('x00280010'));
    Columns = parseFloat(dataSet.uint16('x00280011'));
    Number_of_Frames = parseFloat(image.data.string('x00280008'));

    //초기화
    let dose_grid = [];
    for(let i=0;i<Number_of_Frames;i++){
        dose_grid[i] = [];
    }
    for(let i=0;i<Number_of_Frames;i++){
        for(let j=0;j<Columns;j++){
            dose_grid[i][j] = [];
        }
    }

    let count = 0;

    for (let z = 0; z < Number_of_Frames; z++) {
        for (let val = 0; val < Rows*Columns; val++) {
            dose_grid[z][val] = pixel_data[count];
            count++;
        }
    }

    gridScaling(image , dose_grid);
}

function gridScaling(image, dose_grid){
    let Dose_Grid_Scaling;
    Dose_Grid_Scaling = image.data.string('x3004000e');

    //초기화
    let dose_value = [];
    for(let i=0;i<Number_of_Frames;i++){
        dose_value[i] = [];
    }
    for(let i=0;i<Number_of_Frames;i++){
        for(let j=0;j<Columns*Rows;j++){
            dose_value[i][j] = [];
        }
    }

    //calculate dose value
    for (let z = 0; z < Number_of_Frames; z++) {
        for (let val = 0; val < Rows*Columns; val++) {
            dose_value[z][val] = dose_grid[z][val] * Dose_Grid_Scaling / 1000 ;
        }
    }

    drawDose(dose_value);
}

function drawDose(dose_value){
    let canvas = document.getElementById('doseCanvas');
    let  ctx = canvas.getContext('2d');


}

export { dose_pixel_Data_parse, gridScaling}
