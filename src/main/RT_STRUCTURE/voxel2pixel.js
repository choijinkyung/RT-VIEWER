import voxelCal from "./pixel2voxel";

function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

//Convert Parsed contour data to Array
function pixelCal(image, struct) {
    let str = struct.split("\\");
    let vPx = []; //contour Data Px (voxel point x )
    let vPy = []; //contour Data Py (voxel point y )
    let vPz = []; //contour Data Pz (voxel point z )

    for (let i = 0; i < str.length; i++) {
        if (i % 3 === 0) {
            vPx[i] = str[i];
        } else if (i % 3 === 1) {
            vPy[i] = str[i];
        }else if (i % 3 === 2) {
            vPz[i] = str[i];
        }
    }

    let voxel = voxelCal(image);
    let Sx = voxel[0];
    let Sy = voxel[1];
    let Di = voxel[2];
    let Dj = voxel[3];

    let pi = [];
    let pj = [];

    //convert voxel vPx,vPy to pixel pi,pj
    for (let i = 0; i < str.length; i++) {
        if (i % 3 === 0) {
            pi[i] = Math.floor(((vPx[i] - Sx) / (Di)) * 10) / 10;
        } else if (i % 3 === 1) {
            pj[i] = Math.floor(((vPy[i] - Sy) / (Dj)) * 10) / 10;
        }
    }

    return [pi, pj]
};
export default pixelCal
