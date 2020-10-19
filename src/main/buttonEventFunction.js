import "./MainUI.css"
import "./MainUI.js"
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstone from "cornerstone-core";

export {
    angleOn,
    lengthOn,
    eraserOn,
    drawCircle,
    drawRectangle,
    reductionOn,
    expansionOn,
    invertOn,
    interpolationOn,
    hflipOn,
    vflipOn,
    rotateOn
}

function angleOn() {
    const AngleTool = cornerstoneTools.AngleTool;
    cornerstoneTools.addTool(AngleTool)
    cornerstoneTools.setToolActive('Angle', {mouseButtonMask: 1})


}

function lengthOn() {
    const LengthTool = cornerstoneTools.LengthTool;
    cornerstoneTools.addTool(LengthTool)
    cornerstoneTools.setToolActive("Length", {mouseButtonMask: 1})
}

function eraserOn() {
    const EraserTool = cornerstoneTools.EraserTool;
    cornerstoneTools.addTool(EraserTool);
    cornerstoneTools.setToolActive("Eraser", {mouseButtonMask: 1})
}

function reductionOn() {
    const element = document.getElementById('dicomImage')
    element.style.width = '256px';
    element.style.height = '256px';
    cornerstone.resize(element);
}

function expansionOn() {
    const element = document.getElementById('dicomImage')
    element.style.width = '512px';
    element.style.height = '512px';
    cornerstone.resize(element);

}

function invertOn() {
    const element = document.getElementById('dicomImage')
    const viewport = cornerstone.getViewport(element);
    viewport.invert = !viewport.invert;
    cornerstone.setViewport(element, viewport);
}

function interpolationOn() {
    const element = document.getElementById('dicomImage')
    const viewport = cornerstone.getViewport(element);
    viewport.pixelReplication = !viewport.pixelReplication;
    cornerstone.setViewport(element, viewport);
}

function hflipOn() {
    const element = document.getElementById('dicomImage')
    const viewport = cornerstone.getViewport(element);
    viewport.hflip = !viewport.hflip;
    cornerstone.setViewport(element, viewport);
}

function vflipOn() {
    const element = document.getElementById('dicomImage')
    const viewport = cornerstone.getViewport(element);
    viewport.vflip = !viewport.vflip;
    cornerstone.setViewport(element, viewport);
}

function rotateOn() {
    const element = document.getElementById('dicomImage')
    const viewport = cornerstone.getViewport(element);
    viewport.rotation += 90;
    cornerstone.setViewport(element, viewport);
}

function drawCircle() {
    const EllipticalRoiTool = cornerstoneTools.EllipticalRoiTool;
    cornerstoneTools.addTool(EllipticalRoiTool)
    cornerstoneTools.setToolActive('EllipticalRoi', {mouseButtonMask: 1})
}

function drawRectangle() {
    const RectangleRoiTool = cornerstoneTools.RectangleRoiTool;
    cornerstoneTools.addTool(RectangleRoiTool)
    cornerstoneTools.setToolActive('RectangleRoi', {mouseButtonMask: 1})
}

