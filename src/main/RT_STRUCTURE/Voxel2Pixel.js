import voxelCal from "./Pixel2Voxel";

/**
 * @function pixelCal
 * @param {object} CT_image
 * @param {string} struct -> Corresponding to current CT image, contour data of checked ROI
 * @description
 * This function deals with
 * 1. Changed to mm -> pixel
 * 2. Voxel -> Pixel
 * 3. Change from CT Coordinate to Canvas Coordinate
 * 4. Function call
 * <br> 1) name : voxelCAl
 * <br> param : CT_image
 **/
function pixelCal(CT_image, struct) {
    try{
       if(struct != null){
           let str = struct.split("\\");
           let vPx = []; //contour Data Px (voxel point x )
           let vPy = []; //contour Data Py (voxel point y )

           for (let i = 0; i < str.length; i++) {
               if (i % 3 === 0) {
                   vPx[i] = str[i];
               } else if (i % 3 === 1) {
                   vPy[i] = str[i];
               }
           }

           //get CT Image's image Position, Pixel spacing
           let voxel = voxelCal(CT_image);
           let Sx = voxel[0];
           let Sy = voxel[1];
           let Di = voxel[2];
           let Dj = voxel[3];

           let pi = [];
           let pj = [];

           //convert voxel vPx,vPy to pixel pi,pj
           for (let i = 0; i < str.length; i++) {
               if (i % 3 === 0) {
                   pi[i] = Math.round(((vPx[i] - Sx) / (Di)) * 10) / 10;
               } else if (i % 3 === 1) {
                   pj[i] = Math.round(((vPy[i] - Sy) / (Dj)) * 10) / 10;
               }
           }

           return [pi, pj]
       }
    }catch(err){
        var message = err;
        if (err.exception) {
            message = err.exception;
            alert(message)
        }
    }
}

export default pixelCal
