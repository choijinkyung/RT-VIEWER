import dicomParser from "dicom-parser";
import Hammer from "hammerjs";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math"
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import $ from 'jquery'

cornerstoneWadoImageLoader.external.cornerstone = cornerstone
cornerstoneWadoImageLoader.external.dicomParser = dicomParser
cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.init();

export {dumpFile} ;

function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

let dataSet;

// This function will read the file into memory and then start dumping it
function dumpFile(file) {
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

                dumpDataSet(dataSet, output);
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
                    dumpDataSet(err.dataSet, output);
                    document.getElementById('rtstruct').innerHTML = '<ul>' + output.join('') + '</ul>';
                }
            }
        }, 10);

    };
    reader.readAsArrayBuffer(file);

    return dataSet;
}


function dumpDataSet(dataSet, output) {
    try {
        for (let propertyName in dataSet.elements) {
            let element = dataSet.elements[propertyName];
            //show contour data list
            // if(element.tag==='x30060039'||element.tag==='x30060040'||element.tag==='x30060050'||element.tag==='x3006002A){
            //show ROI List


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

            // Here we check for Sequence items and iterate over them if present.
            // items will not be set in the element object for elements that don't have SQ VR type.
            //  Note that implicit little endian sequences will are currently not parsed.

            if (element.items) { //item들을 표시
                let itemNumber = 0;
                element.items.forEach(function (item) {
                    output.push('<li> Item #' + itemNumber++ + ' ' + item.tag + '</li>')
                    output.push('<ul>');

                    // each item contains its own data set so we iterate over the items and recursively call this function
                    dumpDataSet(item.dataSet, output);

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
                    if (element.length === 2) { //propertyName은
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
                            text += "<i>binary data</i>";
                        }
                    }
                    if (element.length === 0) {
                        color = '#C8C8C8';
                    }
                }
                // contour data처럼 string 길이가 긴 것은 display x
                else {
                    if (element.tag === 'x30060050') {
                        color = '#C8C8C8';

                        // Add text saying the data is too long to show...
                        text += dataSet.string(propertyName);
                    }
                }
                // finally we add the string to our output array surrounded by li elements so it shows up in the DOM as a list
                output.push('<li style="color:' + color + ';">' + text + '</li>');
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
