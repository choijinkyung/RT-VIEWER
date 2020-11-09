import $ from "jquery";
import {addROIset} from "./drawROI";

function ROI_addCheckbox(ROI_LIST_Array) {
    ROI_LIST_Array.forEach(function (n) {
        let ul = document.getElementById('ul');
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
    })

}
export {ROI_addCheckbox,ROI_checkEvent};
