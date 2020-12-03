import $ from "jquery";
import {roiCheckEvent} from "./roiCheckbox";
import dicomParser from "dicom-parser";
import {contourData2JSON,roiData2JSON} from "./RTStructureData2JSON";

/*
* 데이터를 계층구조로 확인하려면?
* 1. main.js 에서 rtstruct와 rtstruct3라는 ID 를 가진 div를 생성
* 2. main.js에 status를 확인하기 위해 ( 에러를 체크 ) statusText2라는 div를 생성
* 3. 계층구조는 output1, 그 안의 데이터는 output3에 저장 후 출력
* */

/**
 * @function isASCII
 * @param {string} str -> A string to distinguish between isASCII or not
 * @return /^[\x00-\x7F]*$/.test(str);
 * @description
 * This function deals with
 * 1. Distinguish whether the string is an isASCII or not.
 */
function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

let dataSet;
/**
 * @function structFile
 * @param {object} file -> File transferred from fileLoader function : RT structure file
 * @description
 * This function deals with
 * 1. Loading RT structure file
 * 2. RT structure Data Parsing
 * 3. Function call
 *    <br>1) name : roiListHierarchy
 *      <br>param : dataSet
 *    <br>2) name : getContourData
 *      <br>param : dataSet, output1, output3
 *    <br>3) name : roiData2JSON
 *      <br>param : roiList
 *   <br>4) name : contourData2JSON
 *      <br>param : contourList
 *   <br>5) name : roiCheckEvent
 *
 * @example
 *  // How to parse the dicom data ?
 *
 *  // User ArrayBuffer and DicomParser
 *  let dataSet = dicomParser.parseDicom(byteArray)
 *  dataSet.uint16('x00280010')
 *
 *  // Use cornerstone Image loader
 *  dose_image.data.string('x00080016')
 */
function structFile(file) {
    // clear any data currently being displayed as we parse this next file
    //document.getElementById('rtstruct').innerHTML = '';
    //document.getElementById('rtstruct3').innerHTML = '';

    $('#status').removeClass('alert-warning alert-success alert-danger').addClass('alert-info');
    $('#warnings').empty();
    //document.getElementById('statusText2').innerHTML = 'Status: Loading file, please wait..';

    let reader = new FileReader();
    reader.onload = function () {
        let arrayBuffer = reader.result;
        // Here we have the file data as an ArrayBuffer.  dicomParser requires as input a
        // Uint8Array so we create that here
        let byteArray = new Uint8Array(arrayBuffer);

        // set a short timeout to do the parse so the DOM has time to update itself with the above message
        setTimeout(function () {
            // Invoke the paresDicom function and get back a DataSet object with the contents
            try {
                dataSet = dicomParser.parseDicom(byteArray);

                let output1 = [];
                let output3 = [];

                roiListHierarchy(dataSet);
                getContourData(dataSet, output1, output3);
                roiData2JSON(roiList);
                contourData2JSON(contourList);

                roiCheckEvent();
            } catch (err) {
                if (err.output1 || err.output3) {

                } else if (err.dataSet) {
                    var output1 = [];
                    var output3 = [];

                    roiListHierarchy(err.dataSet);
                    getContourData(err.dataSet, output1, output3);
                }
            }
        }, 10);
    };
    reader.readAsArrayBuffer(file);

    return dataSet;
}

let roiList = [];
/**
 * @function roiListHierarchy
 * @param {object} dataSet -> Data parsed by RT Structure
 * @description
 * (Only when needed)
 * <br>This function deals with
 * 1. Method for displaying data in a hierarchy
 * 2. Output in hierarchy for output of ROI List
 *
 * < DICOM Tag >
 * 1) Structure Set ROI Sequence : x30060020
 * 2) ROI Number : x30060022
 * 3) ROI Name : x30060026
 **/
function roiListHierarchy(dataSet) {
    try {
        for (let propertyName in dataSet.elements) {
            let element = dataSet.elements[propertyName];

            //Show ROI list with the tag I want.
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
                        roiListHierarchy(item.dataSet);
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
                        text += " (" + dataSet.uint8(propertyName) + ")";
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
                    roiList.push(element.tag, dataSet.string(propertyName));
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

/**
 * @function getContourData
 * @param {object} dataSet -> Data parsed by RT Structure
 * @param {object} output1
 * @param {object} output2
 * @description
 * (Only when needed)
 * <br>This function deals with
 * 1. Method for displaying data in a hierarchy
 * 2. Output in hierarchy for output of contour data
 *
 * < DICOM Tag >
 * 1) ROI Contour Sequence : x30060039
 * 2) ROI Display Color : x3006002a
 * 3) Contour Sequence : x30060040
 * 4) Contour Data : x30060050
 * 5) Contour Image Sequence : x30060016
 * 6) Referenced SOP Instance UID : x00081155
 * 7) Referenced ROI Number : x30060084
 * */
let contourList = [];
function getContourData(dataSet, output1, output3) {
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
                    // itemNumber = 0;
                    element.items.forEach(function (item) {
                        // each item contains its own data set so we iterate over the items and recursively call this function
                        //   output1.push('<li class = "item">Item #' + itemNumber++ + ' ' + item.tag + '</li>')
                        //   output1.push('<ul class = "data">');
                        getContourData(item.dataSet, output1, output3);

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

export {structFile,getContourData}
