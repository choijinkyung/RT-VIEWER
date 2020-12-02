import React from "react";

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
        }
    }
}

export default patientInformation;
