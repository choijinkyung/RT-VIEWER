import $ from "jquery";
import {getCheckValue} from "../Loader/fileLoader";
/**
 * @function DoseCheckbox
 * @param {number} dosemax -> dose Max Value
 * @description
 * This function deals with
 * 1. Generate checkboxes by dividing by do level
 */
function DoseCheckbox(dosemax) {
    let level = [];
    let pres = 40 * 100; //prescription : 4000cGy
    level[0] = parseInt(dosemax);
    level[1] = pres;
    level[2] = pres * 0.98;
    level[3] = pres * 0.95;
    level[4] = pres * 0.9;
    level[5] = pres * 0.8;
    level[6] = pres * 0.7;
    level[7] = pres * 0.5;
    level[8] = pres * 0.3;
    level[9] = 0;

    //create checkbox list
    level.forEach(function (n) {
        let ul = document.getElementById('dose_checkbox_ul');
        let li = document.createElement('li');

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = n;
        checkbox.name = 'dose';

        li.append(checkbox);

        let text = `${parseInt((n / pres) * 100)}% / ${n}cGy`;
        li.append(document.createTextNode(text));
        ul.append(li);
    });
}

/**
 * @function doseCheckEvent
 * @description
 * This function deals with
 * 1. checkbox event listener
 * 2. Pass checked values to addDoseSet function
 * 3. Function call
 *  <br>1)name : addDoseSet
 **/
function doseCheckEvent() {
    /*Event Listener*/
    $(document).ready(function () {
        let dose = document.getElementsByName("dose");
        if (dose[0].addEventListener) {
            for (let i = 0; i < dose.length; i++) {
                dose[i].addEventListener("change", addDoseSet, false);
            }
        } else if (dose[0].attachEvent) {
            for (let i = 0; i < dose.length; i++) {
                dose[i].attachEvent("onchange", addDoseSet);
            }
        }
    });
}

let information = {
    Dose: []
}
/**
 * @function addDoseSet
 * @param {event} e -> Event that occurs when Checkbox mouse click
 * @description
 * This function deals with
 * 1. Add checked values to the Dose set
 * 2. Delete unchecked values from the Dose set
 * 3. Function call
 *  <br> 1) name : getCheckValue
 *  <br> param : information.Dose
 **/
function addDoseSet(e) {
    if (e.target.checked === true) {
        information.Dose.push(e.target.value);
        getCheckValue(information.Dose);
    } else { // 체크 해제된 값을 Dose set에서 뺀다
        let index = information.Dose.indexOf(e.target.value);
        if (index !== -1) {
            information.Dose.splice(index, 1);
        }
        getCheckValue(information.Dose);
    }
}

export {DoseCheckbox, doseCheckEvent};
