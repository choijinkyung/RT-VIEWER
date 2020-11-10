import $ from "jquery";
import dicomParser from "dicom-parser";
import {ROI_addCheckbox,ROI_checkEvent} from "./ROIcheckbox";
import pixelCal from "./voxel2pixel";
import fullColorHex from "./rgbToHex.js";
import * as cornerstone from "cornerstone-core";

function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

let dataSet;

function structFile(file) {
    // clear any data currently being displayed as we parse this next file
    //document.getElementById('rtstruct').innerHTML = '';
    //document.getElementById('rtstruct3').innerHTML = '';

    $('#status').removeClass('alert-warning alert-success alert-danger').addClass('alert-info');
    $('#warnings').empty();
    //document.getElementById('statusText2').innerHTML = 'Status: Loading file, please wait..';

    let reader = new FileReader();
    reader.onload = function (file) {
        let arrayBuffer = reader.result;
        // Here we have the file data as an ArrayBuffer.  dicomParser requires as input a
        // Uint8Array so we create that here
        let byteArray = new Uint8Array(arrayBuffer);

        let kb = byteArray.length / 1024;
        let mb = kb / 1024;
        let byteStr = mb > 1 ? mb.toFixed(3) + " MB" : kb.toFixed(0) + " KB";

        //document.getElementById('statusText2').innerHTML = 'Status: Parsing ' + byteStr + ' bytes, please wait..';


        // set a short timeout to do the parse so the DOM has time to update itself with the above message
        setTimeout(function () {
            // Invoke the paresDicom function and get back a DataSet object with the contents
            try {
                let start = new Date().getTime();
                dataSet = dicomParser.parseDicom(byteArray);

                let output1 = [];
                let output3 = [];

                ROIList(dataSet);
                contour(dataSet, output1, output3);
                roiJson(roi_List);
                contourJson(contourList);

                ROI_checkEvent();

                // Combine the array of strings into one string and add it to the DOM
               // document.getElementById('rtstruct').innerHTML = '<ul>' + output1.join('') + '</ul>';
                //document.getElementById('rtstruct3').innerHTML = '<ul>' + output3.join('') + '</ul>';

                let end = new Date().getTime();
                let time = end - start;
                if (dataSet.warnings.length > 0) {
                    $('#status1').removeClass('alert-success alert-info alert-danger').addClass('alert-warning');
                   // $('#statusText2').html('Status: Warnings encountered while parsing file (file of size ' + byteStr + ' parsed in ' + time + 'ms)');

                    dataSet.warnings.forEach(function (warning) {
                        $("#warnings").append('<li>' + warning + '</li>');
                    });
                } else {
                    let pixelData = dataSet.elements.x7fe00010;
                    if (pixelData) {
                        $('#status1').removeClass('alert-warning alert-info alert-danger').addClass('alert-success');
                     //   $('#statusText2').html('Status: Ready (file of size ' + byteStr + ' parsed in ' + time + 'ms)');
                    } else {
                        $('#status1').removeClass('alert-warning alert-info alert-danger').addClass('alert-success');
                      //  $('#statusText2').html('Status: Ready - no pixel data found (file of size ' + byteStr + ' parsed in ' + time + 'ms)');
                    }
                }

            } catch (err) {
                let message = err;
                if (err.exception) {
                    message = err.exception;
                }
                $('#status').removeClass('alert-success alert-info alert-warning').addClass('alert-danger');
               // document.getElementById('statusText2').innerHTML = 'Status: Error - ' + message + ' (file of size ' + byteStr + ' )';

                if (err.output1 || err.output3) {
                  //  document.getElementById('rtstruct').innerHTML = '<ul>' + output1.join('') + '</ul>';
                  //  document.getElementById('rtstruct3').innerHTML = '<ul>' + output3.join('') + '</ul>';
                } else if (err.dataSet) {
                    var output1 = [];
                    var output3 = [];

                    ROIList(err.dataSet);
                    contour(err.dataSet, output1, output3);
                  //  document.getElementById('rtstruct').innerHTML = '<ul>' + output1.join('') + '</ul>';
                   // document.getElementById('rtstruct3').innerHTML = '<ul>' + output3.join('') + '</ul>';
                }
            }
        }, 10);
    };
    reader.readAsArrayBuffer(file);

    return dataSet;
}

let roi_List = [];

function ROIList(dataSet) {
    try {
        for (let propertyName in dataSet.elements) {

            let element = dataSet.elements[propertyName];

            //show ROI List
            if (element.tag === 'x30060020' || (element.tag === 'x30060022') || element.tag === 'x30060026') {
                let text = element.tag;
                if (element.hadUndefinedLength) {
                    text += " <strong>(-1)</strong>";
                }
                text += "; ";
                if (element.vr) {
                    text += " VR=" + element.vr + "; ";
                }
                let color = 'black';

                if (element.items) { //item들을 표시
                    element.items.forEach(function (item) {
                        // each item contains its own data set so we iterate over the items and recursively call this function
                        ROIList(item.dataSet);
                    });
                } else if (element.fragments) {
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
                    });
                } else {
                    if (element.length === 2) {
                        text += " (" + dataSet.uint16(propertyName) + ")";

                    } else if (element.length === 4) {
                        text += " (" + dataSet.uint32(propertyName) + ")";
                    }
                    //대부분은 문자열이지만 그렇지 않은 것들을 확인해서 표시하는 것을 위함
                    let str = dataSet.string(propertyName);
                    let stringIsAscii = isASCII(str);

                    if (stringIsAscii) {
                        // 정의되지 않은 경우 아무것도 넣지 않음
                        if (str !== undefined) {
                            text += '"' + str + '"';
                        }
                    } else {
                        if (element.length !== 2 && element.length !== 4) {
                            color = '#C8C8C8';
                            // If it is some other length and we have no string
                            text += "<i>binary data</i>";
                        }
                    }
                    if (element.length === 0) {
                        color = '#C8C8C8';
                    }
                    roi_List.push(element.tag, dataSet.string(propertyName));
                }
            }
        }
    } catch (err) {
        let ex = {
            exception: err
        }
        throw ex;
    }
}

let contourList = [];

function contour(dataSet, output1, output3) {
    try {
        for (let propertyName in dataSet.elements) {
            let element = dataSet.elements[propertyName];
            //show contour data list

            if (element.tag === 'x30060039' || element.tag === 'x3006002a' || element.tag === 'x30060040' || element.tag === 'x30060050' || element.tag === 'x30060016' || element.tag === 'x00081155' || element.tag === 'x30060084') {
                let text = element.tag;

                if (element.hadUndefinedLength) {
                    text += " <strong>(-1)</strong>";
                }
                text += "; ";
                if (element.vr) {
                    text += " VR=" + element.vr + "; ";
                }
                let color = 'black';

                // Here we check for Sequence items and iterate over them if present.
                // items will not be set in the element object for elements that don't have SQ VR type.
                //  Note that implicit little endian sequences will are currently not parsed.
                if (element.items) { //item들을 표시
                    let itemNumber = 0;
                    element.items.forEach(function (item) {
                        // each item contains its own data set so we iterate over the items and recursively call this function
                        //   output1.push('<li class = "item">Item #' + itemNumber++ + ' ' + item.tag + '</li>')
                        //   output1.push('<ul class = "data">');
                        contour(item.dataSet, output1, output3);

                        // output1.push('</ul>');
                    });
                } else if (element.fragments) {
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
                    });
                } else {
                    if (element.length === 2) {
                        text += " (" + dataSet.uint16(propertyName) + ")";

                    } else if (element.length === 4) {
                        text += " (" + dataSet.uint32(propertyName) + ")";
                    }
                    //대부분은 문자열이지만 그렇지 않은 것들을 확인해서 표시하는 것을 위함
                    let str = dataSet.string(propertyName);
                    let stringIsAscii = isASCII(str);

                    if (stringIsAscii) {
                        // 정의되지 않은 경우 아무것도 넣지 않음
                        if (str !== undefined) {
                            text += '"' + str + '"';
                        }
                    } else {
                        if (element.length !== 2 && element.length !== 4) {
                            color = '#C8C8C8';
                            // If it is some other length and we have no string
                            text += "<i>binary data</i>";
                        }
                    }
                    if (element.length === 0) {
                        color = '#C8C8C8';
                    }
                    //   output3.push('<li style="color:' + color + ';">' + text + '</li>');
                    // output1.push('<li style="color:' + color + ';">' + text + '</li>');
                    // finally we add the string to our  array
                    contourList.push(element.tag, dataSet.string(propertyName));
                }
            }
        }
    } catch (err) {
        let ex = {
            exception: err,
            output3: output3
        }
        throw ex;
    }
    return contourList;
}

function roiJson(roi_List) {
    let ROI_Number = [];
    let ROI_Name = [];

    for (let i = 0; i < roi_List.length; i++) {
        if (roi_List[i] == 'x30060022') {
            ROI_Number[i] = roi_List[i + 1];
        } else if (roi_List[i] == 'x30060026') {
            ROI_Name[i] = roi_List[i + 1];
        }
    }

    //remove undefined in array
    ROI_Number = ROI_Number.filter(function (item) {
        return item !== null && item !== undefined && item !== "";
    })
    ROI_Name = ROI_Name.filter(function (item) {
        return item !== null && item !== undefined && item !== "";
    })

    //parsing to JSON
    $(function () {
        var ROI_LIST_Array = new Array();

        for (let i = 0; i < ROI_Name.length; i++) {
            let ROI_object = new Object();
            ROI_object.x30060022 = ROI_Number[i];
            ROI_object.x30060026 = ROI_Name[i];

            ROI_LIST_Array.push(ROI_object);
        }
        ROI_addCheckbox(ROI_LIST_Array);
    });

}

let contour_data_Array = new Array();

function contourJson(contourList) {
    let Referenced_Instance_UID = [];
    let contour_data = [];
    let Referenced_ROI_Number = [];
    let ROI_display_color = [];

    for (let i = 0; i < contourList.length; i++) {
        let j = 0;
        if (contourList[i + 2] === 'x00081155') {
            Referenced_Instance_UID[i] = contourList[i + 3];
            contour_data[i] = contourList[i + 5];
            if (contourList[i + 6] === 'x30060084') {
                Referenced_ROI_Number[i] = contourList[i + 7];
            } else if (contourList[i + 6] === 'x00081155') {
                for (j = i + 6; j < contourList.length; j++) {
                    if (contourList[j + 2] === 'x30060084') {
                        Referenced_ROI_Number[i] = contourList[j + 3];
                        break;
                    }
                }
            }
            if (contourList[i] === 'x3006002a') {
                ROI_display_color[i] = contourList[i + 1];
            } else if (contourList[i] === 'x30060050') {
                for (j = i; j > 0; j--) {
                    if (contourList[j] === 'x3006002a') {
                        ROI_display_color[i] = contourList[j + 1];
                        break;
                    }
                }
            }
        }
    }

    ROI_display_color = ROI_display_color.filter(function (item) {
        return item !== null && item !== undefined && item !== "";
    });
    Referenced_Instance_UID = Referenced_Instance_UID.filter(function (item) {
        return item !== null && item !== undefined && item !== "";
    });
    contour_data = contour_data.filter(function (item) {
        return item !== null && item !== undefined && item !== "";
    });
    Referenced_ROI_Number = Referenced_ROI_Number.filter(function (item) {
        return item !== null && item !== undefined && item !== "";
    });

    //parsing to JSON
    $(function () {
        for (let i = 0; i < contourList.length; i++) {
            let contour_object = {};
            contour_object.x30060084 = Referenced_ROI_Number[i];
            contour_object.x00081155 = Referenced_Instance_UID[i];
            contour_object.x30060050 = contour_data[i];
            contour_object.x3006002a = ROI_display_color[i];

            contour_data_Array.push(contour_object);
        }
    });
}

let information = {
    ROIs: []
}
let struct, color;

let checkVal_send = information.ROIs;

function sendDrawImage(image) {
    let Instance_UID = 0;
    Instance_UID = image.data.string('x00080018');

    for(let j=0;j<checkVal_send.length;j++){
        for (let i = 0; i < contour_data_Array.length; i++) {
            if (contour_data_Array[i]['x30060084'] === checkVal_send[j]) {
                if (contour_data_Array[i]['x00081155'] === Instance_UID) {
                    struct = contour_data_Array[i]['x30060050'];
                    color = contour_data_Array[i]['x3006002a'];

                    draw(image, struct, color);
                }
            }
        }
    }
}

let img;
function getImage(image){
    img = image;
    return img;
}

function checkDrawImage(checkVal_check) {
    let Instance_UID = 0;
    Instance_UID = img.data.string('x00080018');

    for (let i = 0; i < contour_data_Array.length; i++) {
        if (contour_data_Array[i]['x30060084'] === checkVal_check) {
            if (contour_data_Array[i]['x00081155'] === Instance_UID) {
                struct = contour_data_Array[i]['x30060050'];
                color = contour_data_Array[i]['x3006002a'];

                draw(img, struct, color, checkVal_check);
            }
        }
    }
}

function checkResetImage(checkVal_check) {
    let Instance_UID = 0;
    Instance_UID = img.data.string('x00080018');

    for (let i = 0; i < contour_data_Array.length; i++) {
        if (contour_data_Array[i]['x30060084'] === checkVal_check) {
            if (contour_data_Array[i]['x00081155'] === Instance_UID) {
                struct = contour_data_Array[i]['x30060050'];
                color = contour_data_Array[i]['x3006002a'];

                resetCanvas(checkVal_check);
            }
        }
    }

}
/*Function*/
function addROIset(evt) {
    let checkVal_check;
    if (evt.target.checked == true) {
        information.ROIs.push(evt.target.value);
        checkVal_check = evt.target.value;

        checkDrawImage(checkVal_check);
    }else {
        let index = information.ROIs.indexOf(evt.target.value);
        if (index !== -1){
            information.ROIs.splice(index, 1);
        }
        checkVal_check = evt.target.value;
        checkResetImage(checkVal_check);
    }
}

let canvas_obj = [];
function draw(image,struct,color,checkVal_check) {
    let px = pixelCal(image, struct);
    let pi = px[0];
    let pj = px[1];

    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pi[0], pj[1]);
    for (let i = 1; i <= pi.length * 3; i++) {
        if (i % 3 === 0) {
            ctx.lineTo(pi[i], pj[i + 1]);

        }
    }
    ctx.closePath();
    ctx.fillStyle = fullColorHex(color);
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.fill();
    ctx.restore();
    canvas_obj[checkVal_check] = canvas;
}

function reset() {
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");

    let canvas2 = document.getElementById('doseCanvas');
    let ctx2 = canvas2.getContext("2d");
    ctx.clearRect(0,0,512,512);
    ctx2.clearRect(0,0,512,512);
}

function resetCanvas(checkVal_check) {
    canvas_obj[checkVal_check].style.fillStyle='#ffffff';
    canvas_obj[checkVal_check].style.globalAlpha=0;
}

export {structFile, draw, reset , sendDrawImage, getImage , addROIset}
