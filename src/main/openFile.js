let struct;

// open text file ( include dicom contour data )
function readTextFile(file) {
    struct = String();

    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);

    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status === 0) {
                var allText = rawFile.responseText;
                struct = allText;
            }
        }

    };
    rawFile.send(null);
    return struct
}

export default readTextFile
