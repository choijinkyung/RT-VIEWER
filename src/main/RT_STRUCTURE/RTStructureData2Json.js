import $ from "jquery";
import {ROI_Checkbox} from "./ROIcheckbox";
import {drawROI} from "./drawROI";

function ROIData2Json(roi_List) {
    let ROI_Number = [];
    let ROI_Name = [];

    for (let i = 0; i < roi_List.length; i++) {
        if (roi_List[i] === 'x30060022') {
            ROI_Number[i] = roi_List[i + 1];
        } else if (roi_List[i] === 'x30060026') {
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
        let ROI_LIST_Array = [];

        for (let i = 0; i < ROI_Name.length; i++) {
            let ROI_object = {};
            ROI_object.x30060022 = ROI_Number[i];
            ROI_object.x30060026 = ROI_Name[i];

            ROI_LIST_Array.push(ROI_object);
        }
        ROI_Checkbox(ROI_LIST_Array);
    });

}

let contour_data_Array = [];

function contourData2Json(contourList) {
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

let img;
function getDrawImageData(CT_image) {
    let Instance_UID = CT_image.data.string('x00080018');

    for (let j = 0; j < checkVal_send.length; j++) {
        for (let i = 0; i < contour_data_Array.length; i++) {
            if (contour_data_Array[i]['x30060084'] === checkVal_send[j]) {
                if (contour_data_Array[i]['x00081155'] === Instance_UID) {
                    struct = contour_data_Array[i]['x30060050'];
                    color = contour_data_Array[i]['x3006002a'];

                    drawROI(CT_image, struct, color);
                }
            }
        }
    }
    img = CT_image;
    return img;
}

function checkAndDraw(checkVal_check) {
    let Instance_UID = img.data.string('x00080018');
    for (let i = 0; i < contour_data_Array.length; i++) {
        if (contour_data_Array[i]['x30060084'] === checkVal_check) {
            if (contour_data_Array[i]['x00081155'] === Instance_UID) {
                struct = contour_data_Array[i]['x30060050'];
                color = contour_data_Array[i]['x3006002a'];

                drawROI(img, struct, color);
            }
        }
    }
}

function checkAndReset(checkVal_check) {
    let Instance_UID = img.data.string('x00080018');
    for (let i = 0; i < contour_data_Array.length; i++) {
        if (contour_data_Array[i]['x30060084'] === checkVal_check) {
            if (contour_data_Array[i]['x00081155'] === Instance_UID) {
                struct = contour_data_Array[i]['x30060050'];
                color = contour_data_Array[i]['x3006002a'];
            }
        }
    }

}

/**
 * @function addROIset
 * @param {event} evy
 * @description
 * This function deals with
 * 1. Put the ROI check set when checking.
 * 2. Delete from ROI check set when unchecked
 * 3. Function call
 * <br> 1) name : checkAndDraw
 * <br> param : checkVal_check
 * <br> 2) name : checkAndReset
 * <br> param : checkVal_check
 */
function addROIset(evt) {
    let checkVal_check;
    if (evt.target.checked === true) { // 체크 되었을 때
        information.ROIs.push(evt.target.value);
        checkVal_check = evt.target.value;

        checkAndDraw(checkVal_check);
    } else { // 체크 해제시
        let index = information.ROIs.indexOf(evt.target.value);
        if (index !== -1) { //해당 ROI를 set에서 삭제
            information.ROIs.splice(index, 1);
        }
        checkVal_check = evt.target.value;
        checkAndReset(checkVal_check);
    }
}

export {ROIData2Json,contourData2Json,getDrawImageData,addROIset}
