import $ from "jquery";
import dicomParser from "dicom-parser";

function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

let dataSet;
/**
 * @function doseDataDump
 * @param {obejct} file -> transmitted deose file
 * @description
 * (Only when needed)
 * This function deals with
 * 1. total data dump of dose
 *
 **/
// This function will read the file into memory and then start dumping it
function doseDataDump(file) {
    // clear any data currently being displayed as we parse this next file
    document.getElementById('rtstruct').innerHTML = '';

    $('#status').removeClass('alert-warning alert-success alert-danger').addClass('alert-info');
    $('#warnings').empty();
    document.getElementById('statusText').innerHTML = 'Status: Loading file, please wait..';

    let reader = new FileReader();
    reader.onload = function (file) {
        let arrayBuffer = reader.result;
        // Here we have the file data as an ArrayBuffer.  dicomParser requires as input a
        // Uint8Array so we create that here
        let byteArray = new Uint8Array(arrayBuffer);
        let kb = byteArray.length / 1024;
        let mb = kb / 1024;
        let byteStr = mb > 1 ? mb.toFixed(3) + " MB" : kb.toFixed(0) + " KB";

        document.getElementById('statusText').innerHTML = 'Status: Parsing ' + byteStr + ' bytes, please wait..';

        // set a short timeout to do the parse so the DOM has time to update itself with the above message
        setTimeout(function () {

            // Invoke the paresDicom function and get back a DataSet object with the contents
            try {
                let start = new Date().getTime();
                dataSet = dicomParser.parseDicom(byteArray);
                // Here we call dumpDataSet to recursively iterate through the DataSet and create an array
                // of strings of the contents.

                let output = [];

                doseDump(dataSet, output);
                doseJson(dataSet, doseData);
                // Combine the array of strings into one string and add it to the DOM
                document.getElementById('rtstruct').innerHTML = '<ul>' + output.join('') + '</ul>';

                let end = new Date().getTime();
                let time = end - start;
                if (dataSet.warnings.length > 0) {
                    $('#status').removeClass('alert-success alert-info alert-danger').addClass('alert-warning');
                    $('#statusText').html('Status: Warnings encountered while parsing file (file of size ' + byteStr + ' parsed in ' + time + 'ms)');

                    dataSet.warnings.forEach(function (warning) {
                        $("#warnings").append('<li>' + warning + '</li>');
                    });
                } else {
                    let pixelData = dataSet.elements.x7fe00010;
                    if (pixelData) {
                        $('#status').removeClass('alert-warning alert-info alert-danger').addClass('alert-success');
                        $('#statusText').html('Status: Ready (file of size ' + byteStr + ' parsed in ' + time + 'ms)');
                    } else {
                        $('#status').removeClass('alert-warning alert-info alert-danger').addClass('alert-success');
                        $('#statusText').html('Status: Ready - no pixel data found (file of size ' + byteStr + ' parsed in ' + time + 'ms)');
                    }
                }

            } catch (err) {
                var message = err;
                if (err.exception) {
                    message = err.exception;
                }
                $('#status').removeClass('alert-success alert-info alert-warning').addClass('alert-danger');
                document.getElementById('statusText').innerHTML = 'Status: Error - ' + message + ' (file of size ' + byteStr + ' )';

                if (err.output) {
                    document.getElementById('rtstruct').innerHTML = '<ul>' + output.join('') + '</ul>';
                } else if (err.dataSet) {
                    var output = [];
                    doseDump(err.dataSet, output);
                    document.getElementById('rtstruct').innerHTML = '<ul>' + output.join('') + '</ul>';
                }
            }
        }, 10);

    };
    reader.readAsArrayBuffer(file);

    return dataSet;
}

let doseData = [];
/**
 * @function doseDump
 * @param {object} dataSet -> Data parsed by Dose
 * @param {object} output -> To show in hierarchy form.
 * @description
 * (Only when needed)
 * This function deals with
 * 1. Method for displaying data in a hierarchy
 *
 **/
function doseDump(dataSet, output) {
    try {
        for (let propertyName in dataSet.elements) {
            let element = dataSet.elements[propertyName];
            //00280008 - Number of frames /00200032 - Image Position / 00200037 - Image Orientation /
            // 3004000e - Dose grid scaling / 30040002 - Dose Units (Gy)
            //x7fe00010 - pixel data
            if (element.tag === 'x00280010' || element.tag === 'x00280011' || element.tag === 'x00280008' || element.tag === 'x30040002' || element.tag === 'x3004000e' || element.tag === 'x00200032' || element.tag === 'x00200037' || element.tag === 'x7fe00010') {

                let text = element.tag;
                text += " length=" + element.length;

                if (element.hadUndefinedLength) {
                    text += " <strong>(-1)</strong>";
                }
                text += "; ";

                if (element.vr) {
                    text += " VR=" + element.vr + "; ";
                }

                let color = 'black';


                if (element.items) { //item들을 표시
                    output.push('<li>' + text + '</li>');
                    output.push('<ul>');
                    let itemNumber = 0;
                    element.items.forEach(function (item) {
                        output.push('<li> Item #' + itemNumber++ + ' ' + item.tag + '</li>')
                        output.push('<ul>');

                        // each item contains its own data set so we iterate over the items and recursively call this function
                        doseDump(item.dataSet, output);

                        output.push('</ul>');
                    });

                    output.push('</ul>');
                } else if (element.fragments) {
                    output.push('<li>' + text + '</li>');
                    output.push('<ul>');

                    // each item contains its own data set so we iterate over the items and recursively call this function
                    let itemNumber = 0;
                    element.fragments.forEach(function (fragment) {
                        let basicOffset;
                        if (element.basicOffsetTable) {
                            basicOffset = element.basicOffsetTable[itemNumber];
                        }

                        let str = '<li>Fragment #' + itemNumber++ + ' offset = ' + fragment.offset;
                        str += '(' + basicOffset + ')';
                        str += '; length = ' + fragment.length + '</li>';
                        output.push(str);
                    });
                    output.push('</ul>');
                } else {
                    //문자열 길이가 128이하, 이상으로 나눠서 보여줌
                    // 사용하기 어렵게 만드는 문자열 표시를 피하기 위해 사용
                    if (element.length < 128) { //텍스트 = 태그 + 길이 + 내용
                        //어떤 data type인지 확인하기 위함
                        if (element.length === 2) {
                            text += " (" + dataSet.uint16(propertyName) + ")";
                        } else if (element.length === 4) {
                            text += " (" + dataSet.uint32(propertyName) + ")";
                        }

                        //대부분은 문자열이지만 그렇지 않은 것들을 확인해서 표시하는 것을 위함
                        let str = dataSet.string(propertyName);
                        let stringIsAscii = isASCII(str);

                        if (stringIsAscii) {
                            //element는 있지만 data가 없는 경우 문자열은 정의되지 않음
                            // 정의되지 않은 경우 아무것도 넣지 않음
                            if (str !== undefined) {
                                text += '"' + str + '"';
                            }
                        } else {
                            if (element.length !== 2 && element.length !== 4) {
                                color = '#C8C8C8';

                                // If it is some other length and we have no string
                                text += dataSet.string(propertyName);
                            } else {

                                text += dataSet.string(propertyName);
                            }
                        }
                        if (element.length === 0) {

                            color = '#C8C8C8';
                        }
                    } else {
                        color = '#C8C8C8';
                        // Add text saying the data is too long to show...
                        text += dataSet.string(propertyName);

                    }

                    // finally we add the string to our output array surrounded by li elements so it shows up in the DOM as a list
                    output.push('<li style="color:' + color + ';">' + text + '</li>');

                    doseData.push(element.tag, dataSet.string(propertyName));
                }
            }
        }

    } catch (err) {
        let ex = {
            exception: err,
            output: output
        }
        throw ex;
    }
}

let dose_object = {};

// function : Parse dose data to Json
function doseJson(dataSet, doseData) {
    let Number_of_Frames = 0;
    let Image_Position = 0;
    let Image_Orientation = 0;
    let Dose_Grid_Scaling = 0;
    let Dose_Units = 0;

    // x00280008 - Number of frames / x00200032 - Image Position / x00200037 - Image Orientation
    // x3004000e - Dose grid scaling / x30040002 - Dose Units (Gy)
    for (let i = 0; i < doseData.length; i++) {
        if (doseData[i] === 'x00280008') {
            Number_of_Frames = doseData[i + 1];
        } else if (doseData[i] === 'x00200032') {
            Image_Position = doseData[i + 1];
        } else if (doseData[i] === 'x00200037') {
            Image_Orientation = doseData[i + 1];
        } else if (doseData[i] === 'x3004000e') {
            Dose_Grid_Scaling = doseData[i + 1];
        } else if (doseData[i] === 'x30040002') {
            Dose_Units = doseData[i + 1];
        }
    }

    dose_object.x00280008 = Number_of_Frames;
    dose_object.x00200032 = Image_Position;
    dose_object.x00200037 = Image_Orientation;
    dose_object.x3004000e = Dose_Grid_Scaling;
    dose_object.x30040002 = Dose_Units;
}

export {doseDataDump}
