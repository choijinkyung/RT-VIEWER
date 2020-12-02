import $ from "jquery";
import {addROIset} from "./RTStructureData2JSON";
/**
 * @function ROI_Checkbox
 * @param {object} ROI_LIST_Array -> Object with ROI list
 * @description
 * This function deals with
 * 1. Generate a check box referring to the ROI Number and Name in the ROI list
 */
function ROI_Checkbox(ROI_LIST_Array) {
    ROI_LIST_Array.forEach(function (n) {
        let ul = document.getElementById('structure_checkbox_ul');
        let li = document.createElement('li');

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = n.x30060022;
        checkbox.name = 'roi';

        li.append(checkbox);

        let text = n.x30060026;
        li.append(document.createTextNode(text));
        ul.append(li);
    });

}
/**
 * @function ROI_checkEvent
 * @description
 * This function deals with
 * 1. Event listener on ROI check
 * 2. Function call
 * <br> 1) name : addROIset
 */
function ROI_checkEvent(){
    /*Event Listener*/
    $(document).ready(function(){
        let roi = document.getElementsByName("roi");
        if (roi[0].addEventListener) {
            for (let i = 0; i < roi.length; i++) {
                roi[i].addEventListener("change", addROIset, false);
            }
        } else if (roi[0].attachEvent) {
            for (let i = 0; i < roi.length; i++) {
                roi[i].attachEvent("onchange", addROIset);
            }
        }
    });
}
export {ROI_Checkbox,ROI_checkEvent};
