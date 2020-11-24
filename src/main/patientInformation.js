import React from "react";

function patientInformation(image) {
    try {
        // print the dicom information
        document.getElementById('patientName').textContent = 'Patient Name : ' + image.data.string('x00100010');
        document.getElementById('patientID').textContent = 'Patient ID : ' + image.data.string('x00100020');
        document.getElementById('gender').textContent = 'Gender : ' + image.data.string('x00100040');

    } catch (ex) {
        alert('parsing error');
    }
}

export default patientInformation;
