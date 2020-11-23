import React from "react";

function patientInformation(image) {
    try {
        // print the dicom information
        document.getElementById('patient').textContent = 'Patient ID : ' + image.data.string('x00100020');
        document.getElementById('topleft').textContent = 'Patient Name : ' + image.data.string('x00100010') + '\n' + 'Patient Sex : ' + image.data.string('x00100040');
        document.getElementById('topright').textContent = 'Modality : ' + image.data.string('x00080060');
        document.getElementById('modality').textContent = 'Modality : ' + image.data.string('x00080060');
        document.getElementById('instanceUID').textContent = 'Instance UID : ' + image.data.string('x00080018');

        /*
        document.getElementById('studyUID').textContent = 'Study UID : ' + image.data.string('x0020000d');
        document.getElementById('seriesUID').textContent = 'Series UID : ' + image.data.string('x0020000e');
        document.getElementById('instanceUID').textContent = 'Instance UID : ' + image.data.string('x00080018');
        document.getElementById('frameUID').textContent = 'Frame of Reference UID : ' + image.data.string('x00200052');
         */

    } catch (ex) {
        alert('parsing error');
    }
}

export default patientInformation;
