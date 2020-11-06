import $ from "jquery";
import {drawDose} from "./isodose";

function Dose_Checkbox(dosemax) {
    let level = [];

    level[0] = parseInt(dosemax);
    level[1] = 100;
    level[2] = 90;
    level[3] = 70;
    level[4] = 50;
    level[5] = 30;

    level.forEach(function (n) {
        let ul = document.getElementById('ul2');
        let li = document.createElement('li');

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = n;
        checkbox.name = 'dose';

        li.append(checkbox);

        let text = n + '% /' + (n * 40) + 'cGy';
        li.append(document.createTextNode(text));
        ul.append(li);
    });
}

function Dose_checkEvent(){
    /*Event Listener*/
    $(document).ready(function(){
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
    let checkVal_check;

    if (evt.target.checked == true) {
        information.Dose.push(evt.target.value);
        checkVal_check = evt.target.value;

        drawDose(checkVal_check);
    }else {
        let index = information.Dose.indexOf(evt.target.value);
        if (index !== -1){
            information.Dose.splice(index, 1);
        }
        checkVal_check = evt.target.value;

    }
}
export {Dose_Checkbox,Dose_checkEvent};
