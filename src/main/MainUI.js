import React from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math"
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import Hammer from "hammerjs";
import dicomParser from "dicom-parser"
import "./MainUI.css"
import ButtonEvent from "./buttonEvent";
import {fileLoader} from './Loader/fileLoader.js'
import {handleFileSelect, handleDragOver} from "./Loader/dragAndDrop";
import Controlled from "./mouseControl";

cornerstoneWadoImageLoader.external.cornerstone = cornerstone
cornerstoneWadoImageLoader.external.dicomParser = dicomParser
cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.init();
dicomParser.toString().bold()
let buttonEvent = new ButtonEvent();
/**
 * MAIN UI class
 * @class
 */
class MainUIElements extends React.Component {
    componentDidMount() {
        // Setup dropZon  and listeners.
        let dropZone = document.getElementById('dicomImage');
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);

    const element = document.getElementById('dicomImage');
        element.addEventListener('mousedown', function (e) {
            let lastX = e.pageX;
            let lastY = e.pageY;
            const mouseButton = e.which;


            function mouseMoveHandler(e) {
                const deltaX = e.pageX - lastX;
                const deltaY = e.pageY - lastY;
                lastX = e.pageX;
                lastY = e.pageY;

                /*if (mouseButton === 1) {
                    let viewport = cornerstone.getViewport(element);
                    viewport.translation.x += (deltaX / viewport.scale);
                    viewport.translation.y += (deltaY / viewport.scale);
                    cornerstone.setViewport(element, viewport);

                } else*/
                if (mouseButton === 2) {
                    let viewport = cornerstone.getViewport(element);
                    viewport.voi.windowWidth += (deltaX / viewport.scale);
                    viewport.voi.windowCenter += (deltaY / viewport.scale);
                    cornerstone.setViewport(element, viewport);

                    document.getElementById('topright1').textContent = "WW/WC:" + Math.round(viewport.voi.windowWidth)
                        + "/" + Math.round(viewport.voi.windowCenter);
                }/* else if (mouseButton === 3) {
                    let viewport = cornerstone.getViewport(element);
                    viewport.scale += (deltaY / 100);
                    cornerstone.setViewport(element, viewport);

                    document.getElementById('topright2').textContent = "Zoom:" + viewport.scale + "x";
                }
                */
            }

            function mouseUpHandler() {
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            }

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });

    }

    //Rendering
    render() {
        return (
            <div id="outsideWrapper" className={"outsideWrapper"}>
                <div> Open patient =>
                    <input type="file" id="filepicker" name="fileList" webkitdirectory={""} directory={""} multiple
                           onChange={(e) => {
                               fileLoader(e);
                           }}/>
                </div>

                <div className={'left'}>
                    <div>
                        <button onClick={() => {
                            buttonEvent.angleOn()
                        }}>Angle
                        </button>
                        &nbsp;&nbsp;
                        <button onClick={() => {
                            buttonEvent.lengthOn()
                        }}>Length
                        </button>
                        &nbsp;&nbsp;
                        <button onClick={() => {
                            buttonEvent.drawCircle()
                        }}>Circle
                        </button>
                        &nbsp;&nbsp;
                        <button onClick={() => {
                            buttonEvent.drawRectangle()
                        }}>Rectangle
                        </button>
                        &nbsp;&nbsp;
                        <button onClick={() => {
                            buttonEvent.eraserOn()
                        }}>Erase
                        </button>
                        &nbsp;&nbsp;
                    </div>
                    <div>
                        <button onClick={() => {
                            buttonEvent.invertOn()
                        }}>Toggle Invert
                        </button>
                        &nbsp;&nbsp;
                        <button onClick={() => {
                            buttonEvent.interpolationOn()
                        }}>Toggle Interpolation
                        </button>
                        &nbsp;&nbsp;
                        <button onClick={() => {
                            buttonEvent.hflipOn()
                        }}>Horizontal Flip
                        </button>
                        &nbsp;&nbsp;
                        <button onClick={() => {
                            buttonEvent.vflipOn()
                        }}>Vertical Flip
                        </button>
                        &nbsp;&nbsp;
                        <button onClick={() => {
                            buttonEvent.rotateOn()
                        }}>Rotate 90
                        </button>
                        &nbsp;&nbsp;
                    </div>
                </div>
                <div className={'right'}>
                    <ul>
                        <li>mouse click drag - pan</li>
                        <li>Mouse wheel - scroll images / zoom in, out</li>
                        <li>Double Click - save pixel/voxel</li>
                    </ul>
                </div>
                <br></br> <br></br> <br></br>
                <div class="left">
                    <div>
                        <div>
                            <span id="patientName">Patient Name : </span>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <span id="patientID">Patient ID : </span>
                        </div>
                        <div>
                            <span id="gender">Gender : </span>
                        </div>
                    </div>
                    <div>
                        <div id="dicomImageWrapper" className="wrapper"
                             onContextMenu="return false" onWheel={(e) => {
                        }}>
                            <div>
                                <Controlled/>
                            </div>
                            <div id='topleft' className="overlay" className="topleft">
                                <div id="topleft1" >
                                    Image :
                                </div>
                                <div id="topleft2" >
                                    Position:
                                </div>
                            </div>
                            <div className="overlay" className="topright">
                                <div id="topright1" >
                                    WW/WC:
                                </div>
                                <div id="topright2">
                                    Zoom:
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div>
                            <span id="coords"></span>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <span id="voxelCoords"></span>
                        </div>
                        <div>
                            <span id="pixelValue"></span>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <span id="voxelValue"></span>
                        </div>
                        <div>
                            <span id="doseCoords"></span>

                        </div>
                    </div>
                    <br></br><br></br><br></br><br></br><br></br><br></br><br></br>
                </div>
                <div className={'right'}>
                    <div className="lefthalf">
                        <ul id="structure_checkbox_ul">Structures</ul>
                    </div>
                    <div className="righthalf">
                        <ul id="dose_checkbox_ul">Isodoses</ul>
                    </div>
                </div>
                <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br><br></br><br></br><br></br>
                {/*
                <div>
                    <div className="left">
                        <div id="status1" className="alert alert-success">
                            <div id="statusText">
                                Status: Ready (no file loaded)
                            </div>
                            <ul id="warnings">
                            </ul>
                        </div>

                        <div className="row2">
                            <div className="col-md-12">
                                <div id="rtstruct">
                                    <div className="text-center">
                                        <h3>item</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br></br><br></br>

                    <div className="right">
                        <div className="row2">
                            <div className="col-md-12">
                                <div id="rtstruct3">
                                    <div className="text-center">
                                        <h3>contour data</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="right">
                    <div className="row2">
                        <div className="col-md-12">
                            <div id="dose">
                                <div className="text-center">
                                    <h3>dose</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="left">
                    <div className="row2">
                        <div className="col-md-12">
                            <div id="dose2">
                                <div className="text-center">
                                    <h3>dose</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             */}
            </div>
        );
    }
}


export default MainUIElements
