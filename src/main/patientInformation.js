import React from "react";

function patientInformation(image) {
    try {
        // print the dicom information
        document.getElementById('patientName').textContent = 'Patient Name : ' + image.data.string('x00100010');
        document.getElementById('patientID').textContent = 'Patient ID : ' + image.data.string('x00100020');
        document.getElementById('gender').textContent = 'Gender : ' + image.data.string('x00100040');

    } catch (err) {
        var message = err;
        if (err.exception) {
            message = err.exception;
        }
    }
}

export default patientInformation;
