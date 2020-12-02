import $ from "jquery";
import {ROI_Checkbox} from "./ROIcheckbox";
import {drawROI} from "./drawROI";
/**
 * @function ROIData2JSON
 * @param {object} roi_List
 * @description
 * This function deals with
 * 1. Convert ROI data to JSON for parsing
 * 2. Add ROI number and name to JSON obejct.
 * 3. If you want to read object
 *  -> JSON.stringfy(object)
 * 4. Function call
 * <br> 1) name : ROI_checkbox
 *  <br> param : ROI_LIST_Array
 *
 * < DICOM Tag >
 * 1) ROI Number : x30060022
 * 2) Patient ID : x30060026
 * */
function ROIData2JSON(roi_List) {
    let ROI_Number = [];
    let ROI_Name = [];

    //ROI number와 name을 할당
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
    //array에 각 json object를 넣음
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
/**
 * @function contourData2JSON
 * @param {object} contourList
 * @description
 * This function deals with
 * 1. Convert Contour data to JSON for parsing
 * 2. Add Referenced Instance UID, Referenced ROI number and name to JSON obejct.
 * 3. Add ROI Display Color to JSON object
 * 3. If you want to read object
 *  -> JSON.stringfy(object)
 *
 * < DICOM Tag >
 * 1) ROI Display Color : x3006002a
 * 2) Contour Data : x30060050
 * 3) Referenced SOP Instance UID : x00081155
 * 4) Referenced ROI Number : x30060084
 * */
function contourData2JSON(contourList) {
    let Referenced_Instance_UID = [];
    let contour_data = [];
    let Referenced_ROI_Number = [];
    let ROI_display_color = [];

    //getContourData 함수에 output1,3를 출력해보면 계층구조로 나옴
    //tag와 value당 하나씩 i라고 할당했을 때
    //0:tag 1:value
    //2:tag 3:value
    //4:tag 5:value
    //이런식으로 i가 증가함.
    //이건 출력해봐야 의미를 알 수 있음.
    //이렇게 한 이유는 계층구조로 된 아이템들의 데이터에 접근하기 힘들어서 값을 직접 출력해서 가져옴
    for (let i = 0; i < contourList.length; i++) {
        let j = 0;
        //각 인덱스에 + 값이 어디에 해당하는지 꼭 확인
        if (contourList[i + 2] === 'x00081155') {
            Referenced_Instance_UID[i] = contourList[i + 3];
            contour_data[i] = contourList[i + 5];
            if (contourList[i + 6] === 'x30060084') { // 만약 Referenced ROI number의 태그와 contourList의 태그와 같다면
                Referenced_ROI_Number[i] = contourList[i + 7]; // 해당 태그 다음 값을 넣어줌. 값은 tag +1 임
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

//check 된 ROI 값을 넣어줌
let information = {
    ROIs: []
}
let struct, color;
let checkVal_send = information.ROIs;
let img;

/**
 * @function directCheckAndDraw
 * @param {object} CT_image
 * @description
 * This function deals with
 * 1. To draw directly when you click the mouse.
 * 2. Without this function, the CT image must be updated before it is drawn.
 * 3. If the checked value and the current CT slice, the corresponding contour data and color are saved and drawn.
 * 4. Function call
 * <br> 1) name: drawROI
 * <br> param : CT_image, struct, color
 *
 * < DICOM Tag >
 * 1) ROI Display Color : x3006002a
 * 2) Contour Data : x30060050
 * 3) Referenced SOP Instance UID : x00081155
 * 4) Referenced ROI Number : x30060084
 * */
function directCheckAndDraw(CT_image) {
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

/**
 * @function checkAndDraw
 * @param {string} checkVal_check
 * @description
 * This function deals with
 * 1. If the checked value and the current CT slice, the corresponding contour data and color are saved and drawn.
 * 2. Function call
 * <br> 1) name: drawROI
 * <br> param : CT_image, struct, color
 *
 * < DICOM Tag >
 * 1) ROI Display Color : x3006002a
 * 2) Contour Data : x30060050
 * 3) Referenced SOP Instance UID : x00081155
 * 4) Referenced ROI Number : x30060084
 * */
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

/**
 * @function addROIset
 * @param {event} evt
 * @description
 * This function deals with
 * 1. Put the ROI check set when checking.
 * 2. Delete from ROI check set when unchecked
 * 3. Function call
 * <br> 1) name : checkAndDraw
 * <br> param : checkVal_check
 * <br> 2) name : checkAndReset //will make function
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
        //checkVal_check = evt.target.value;
    }
}

export {ROIData2JSON,contourData2JSON,directCheckAndDraw,addROIset}
