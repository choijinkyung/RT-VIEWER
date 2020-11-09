import $ from "jquery";
import {getCheckValue} from "./isodose";

function Dose_Checkbox(dosemax) {
    let level = [];
    let pres = 40 * 100; //cGy
    level[0] = parseInt(dosemax);
    level[1] = pres;
    level[2] = pres * 0.8;
    level[3] = pres * 0.6;
    level[4] = pres * 0.4;
    level[5] = pres * 0.2;

    level.forEach(function (n) {
        let ul = document.getElementById('ul2');
        let li = document.createElement('li');

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = n;
        checkbox.name = 'dose';

        li.append(checkbox);

        let text = parseInt(n / pres * 100) + '% / ' + n + 'cGy';
        li.append(document.createTextNode(text));
        ul.append(li);
    });
}

function Dose_checkEvent() {
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
    })

}

let information = {
    Dose: []
}

function addDoseSet(evt) {
    let checkVal_check = [];

    if (evt.target.checked === true) {
        information.Dose.push(evt.target.value);
        getCheckValue(information.Dose);
    } else {
        let index = information.Dose.indexOf(evt.target.value);
        if (index !== -1) {
            information.Dose.splice(index, 1);
        }
        checkVal_check = evt.target.value;
        //getCheckValue(checkVal_check);
    }
}

export {Dose_Checkbox, Dose_checkEvent};
