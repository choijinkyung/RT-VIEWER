import React from "react";
/**
 * @function patientInformation
 * @param {object} CT_image
 * @description
 * This function deals with
 * 1. Output patient information from CT image
 * 2. If you want, add the information.
 *
 * < DICOM Tag >
 * 1) Patient Name : x00100010
 * 2) Patient ID : x00100020
 * 3) Gender : x00100040
 * */
function patientInformation(CT_image) {
    try {
        // print the dicom information
        document.getElementById('patientName').textContent = 'Patient Name : ' + CT_image.data.string('x00100010');
        document.getElementById('patientID').textContent = 'Patient ID : ' + CT_image.data.string('x00100020');
        document.getElementById('gender').textContent = 'Gender : ' + CT_image.data.string('x00100040');
    } catch (err) {
        var message = err;
        if (err.exception) {
            message = err.exception;
            alert(message)
        }
    }
}

export default patientInformation;
