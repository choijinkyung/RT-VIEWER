import "./MainUI.css"
import "./MainUI.js"
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstone from "cornerstone-core";
/**
 * Button Event Class
 * @class
 * @description
 * This class include Button Event Functions
 * 1) angleOn
 * 2) lengthOn
 * 3) eraserOn
 * 4) invertOn
 * 5) interpolationOn
 * 6) hflipOn
 * 7) vflipOn
 * 8) rotateOn
 * 9) drawCircle
 * 10) drawRectangle
 * @author Choi jin kyung
 */
class ButtonEvent {
    angleOn() {
        const AngleTool = cornerstoneTools.AngleTool;
        cornerstoneTools.addTool(AngleTool)
        cornerstoneTools.setToolActive('Angle', {mouseButtonMask: 1});
    }

    lengthOn() {
        const LengthTool = cornerstoneTools.LengthTool;
        cornerstoneTools.addTool(LengthTool)
        cornerstoneTools.setToolActive("Length", {mouseButtonMask: 1})
    }

    eraserOn() {
        const EraserTool = cornerstoneTools.EraserTool;
        cornerstoneTools.addTool(EraserTool);
        cornerstoneTools.setToolActive("Eraser", {mouseButtonMask: 1})
    }

    invertOn() {
        const element = document.getElementById('dicomImage')
        const viewport = cornerstone.getViewport(element);
        viewport.invert = !viewport.invert;
        cornerstone.setViewport(element, viewport);
    }

    interpolationOn() {
        const element = document.getElementById('dicomImage')
        const viewport = cornerstone.getViewport(element);
        viewport.pixelReplication = !viewport.pixelReplication;
        cornerstone.setViewport(element, viewport);
    }

    hflipOn() {
        const element = document.getElementById('dicomImage')
        const viewport = cornerstone.getViewport(element);
        viewport.hflip = !viewport.hflip;
        cornerstone.setViewport(element, viewport);
    }

    vflipOn() {
        const element = document.getElementById('dicomImage')
        const viewport = cornerstone.getViewport(element);
        viewport.vflip = !viewport.vflip;
        cornerstone.setViewport(element, viewport);
    }

    rotateOn() {
        const element = document.getElementById('dicomImage')
        const viewport = cornerstone.getViewport(element);
        viewport.rotation += 90;
        cornerstone.setViewport(element, viewport);
    }

    drawCircle() {
        const EllipticalRoiTool = cornerstoneTools.EllipticalRoiTool;
        cornerstoneTools.addTool(EllipticalRoiTool)
        cornerstoneTools.setToolActive('EllipticalRoi', {mouseButtonMask: 1})
    }

    drawRectangle() {
        const RectangleRoiTool = cornerstoneTools.RectangleRoiTool;
        cornerstoneTools.addTool(RectangleRoiTool)
        cornerstoneTools.setToolActive('RectangleRoi', {mouseButtonMask: 1})
    }
}

export default  ButtonEvent
