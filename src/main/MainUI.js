import React, {Component} from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math"
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader"
import Hammer from "hammerjs";
import dicomParser from "dicom-parser"
import "./MainUI.css"
import {
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
} from "./buttonEventFunction.js"
import {handleFileChange, handle, imageIdList, handleFileSelect, handleDragOver} from './loadData.js'

cornerstoneWadoImageLoader.external.cornerstone = cornerstone
cornerstoneWadoImageLoader.external.dicomParser = dicomParser
cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.init();


class MainUIElements extends React.Component {
    componentDidMount() {
        const element = this.element;

        // Setup the dnd listeners.
        let dropZone = document.getElementById('dicomImage');
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);

        element.addEventListener('mousedown', function (e) {
            let lastX = e.pageX;
            let lastY = e.pageY;
            const mouseButton = e.which;

            function mouseMoveHandler(e) {
                const deltaX = e.pageX - lastX;
                const deltaY = e.pageY - lastY;
                lastX = e.pageX;
                lastY = e.pageY;

                if (mouseButton === 1) {
                    let viewport = cornerstone.getViewport(element);
                    viewport.voi.windowWidth += (deltaX / viewport.scale);
                    viewport.voi.windowCenter += (deltaY / viewport.scale);
                    cornerstone.setViewport(element, viewport);

                    document.getElementById('bottomleft').textContent = "WW/WC:" + Math.round(viewport.voi.windowWidth)
                        + "/" + Math.round(viewport.voi.windowCenter);

                } else if (mouseButton === 2) {
                    let viewport = cornerstone.getViewport(element);
                    viewport.translation.x += (deltaX / viewport.scale);
                    viewport.translation.y += (deltaY / viewport.scale);
                    cornerstone.setViewport(element, viewport);

                } else if (mouseButton === 3) {
                    let viewport = cornerstone.getViewport(element);
                    viewport.scale += (deltaY / 100);
                    cornerstone.setViewport(element, viewport);
                    document.getElementById('bottomright').textContent = "Zoom:" + viewport.scale + "x";
                }
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
                <div>File Select =>
                    <input type="file" onChange={(e) => {
                        handleFileChange(e)
                    }}/>&nbsp;&nbsp;
                </div>
                <div>Directory Select =>
                    <input type="file" id="filepicker" name="fileList" webkitdirectory={""} directory={""} multiple
                           onChange={(e) => {
                               imageIdList(e);
                           }}/>
                </div>
                <ul id="listing"></ul>

                <button onClick={() => {
                    handle()
                }}>TEST
                </button>
                <div>
                    <button onClick={() => {
                        angleOn()
                    }}>Angle
                    </button>
                    &nbsp;&nbsp;
                    <button onClick={() => {
                        lengthOn()
                    }}>Length
                    </button>
                    &nbsp;&nbsp;
                    <button onClick={() => {
                        drawCircle()
                    }}>Circle
                    </button>
                    &nbsp;&nbsp;
                    <button onClick={() => {
                        drawRectangle()
                    }}>Rectangle
                    </button>
                    &nbsp;&nbsp;
                    <button onClick={() => {
                        eraserOn()
                    }}>Erase
                    </button>
                    &nbsp;&nbsp;
                    <button onClick={() => {
                        reductionOn()
                    }}>256x256
                    </button>
                    &nbsp;&nbsp;
                    <button onClick={() => {
                        expansionOn()
                    }}>512x512
                    </button>
                    &nbsp;&nbsp;
                </div>
                <div>
                    <button onClick={() => {
                        invertOn()
                    }}>Toggle Invert
                    </button>
                    &nbsp;&nbsp;
                    <button onClick={() => {
                        interpolationOn()
                    }}>Toggle Interpolation
                    </button>
                    &nbsp;&nbsp;
                    <button onClick={() => {
                        hflipOn()
                    }}>Horizontal Flip
                    </button>
                    &nbsp;&nbsp;
                    <button onClick={() => {
                        vflipOn()
                    }}>Vertical Flip
                    </button>
                    &nbsp;&nbsp;
                    <button onClick={() => {
                        rotateOn()
                    }}>Rotate 90
                    </button>
                    &nbsp;&nbsp;
                </div>

                <div>
                    <ul>
                        <li>Left click drag - window/level</li>
                        <li>Middle Mouse button drag - pan</li>
                        <li>Right click drag - zoom</li>
                        <li>Mouse wheel - scroll images</li>
                        <li>Double Click - save pixel/voxel</li>
                    </ul>
                </div>


                <div>
                    <div class="left">
                        <div id="dicomImageWrapper" className="wrapper"
                             onContextMenu="return false" onWheel={(e) => {
                        }}>
                            <div id="dicomImage" className="viewportElement"
                                 ref={input => {
                                     this.element = input;
                                 }}>
                                <canvas id="myCanvas" className={"canvas"} width={512} height={512}/>
                            </div>
                            <div id="topleft" className="overlay" className="topleft">
                                Patient Name:
                                Patient Sex:
                            </div>
                            <div id="topright" className="overlay" className="topright">
                                Modality :
                            </div>
                            <div id="bottomleft" className="overlay" className="bottomleft">
                                WW/WC:
                            </div>
                            <div id="bottomright" className="overlay" className="bottomright">
                                Zoom:
                            </div>
                        </div>
                    </div>
                </div>
                <div className="right">
                    <div><span id="coords"></span></div>
                    <div><span id="voxelCoords">voxel</span></div>

                    <div><span id="pixelValue"></span></div>
                    <div><span id="voxelValue"></span></div>

                    <div><span id="patient">Patient ID : </span></div>
                    <div><span id="modality">Modality : </span></div>
                    <div><span id="instanceUID">Instance UID : </span></div>

                    <div><span id="contour">contourData : </span></div>
                    <div>
                        <ul id="ul">Structure Set ROI Sequence</ul>
                    </div>
                </div>
                <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br><br></br><br></br><br></br>

                {/*
                < div class = "patient INFO">
                    <div id="info">
                        <div><span id="studyUID">Study UID :</span></div>
                        <div><span id="seriesUID">Series UID :</span></div>
                        <div><span id="instanceUID">Instance UID : </span></div>
                        <div><span id="frameUID">Frame of Reference UID : </span></div>
                    </div>

                    <br></br>
                    <div id="voxel">
                        <div><span id="imageOrientation">Image Orientation :</span></div>
                        <div><span id="pixelSpacing">Pixel Spacing :</span></div>
                        <div><span id="imagePosition">Image Position : </span></div>
                    </div>
                    <br></br>
                    <div id="voxelCal">
                        <div><span id="Sxyz"></span></div>
                        <div><span id="Xxyz"></span></div>
                        <div><span id="Yxyz"></span></div>
                        <div><span id="Dij"></span></div>

                    </div>
                    <br></br>
                    <div id="pixelCal">
                        <div><span id="struct">Struct :</span></div>
                        <br></br>
                        <div><span id="str">str :</span></div>
                        <br></br>
                        <div><span id="vPx">vPx : </span></div>
                        <br></br>
                        <div><span id="vPy">vPy : </span></div>
                    </div>
                    <br></br>
                    <div><span id="contour">contour data :</span></div>

                    <div id="point">
                        <div id="pi">Pi :</div>
                        <br></br>
                        <div id="pj">Pj :</div>
                    </div>
                </div>
               */}

                <div>
                    <div className="left">
                        <div id="status1" className="alert alert-success">
                            <div id="statusText2">
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

            </div>
        );
    }
}

export default MainUIElements
