import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstone from "cornerstone-core";

const GENTLE_ZOOM_DIVISOR = 240;

function gentleZoomStrategy(evt, configuration) {
    const {element, viewport, deltaPoints} = evt.detail;
    const deltaY = deltaPoints && deltaPoints.page ? deltaPoints.page.y : 0;

    if (!deltaY) {
        return;
    }

    const invert = configuration && configuration.invert;
    const minScale = configuration && configuration.minScale ? configuration.minScale : 0.25;
    const maxScale = configuration && configuration.maxScale ? configuration.maxScale : 20;
    const ticks = invert ? -deltaY / GENTLE_ZOOM_DIVISOR : deltaY / GENTLE_ZOOM_DIVISOR;
    const nextScale = viewport.scale * Math.pow(1.7, ticks);

    viewport.scale = Math.min(maxScale, Math.max(minScale, nextScale));
    cornerstone.setViewport(element, viewport);
}

const TOOL_DEFINITIONS = [
    {name: "Wwwc", ToolClass: cornerstoneTools.WwwcTool},
    {name: "WwwcRegion", ToolClass: cornerstoneTools.WwwcRegionTool},
    {
        name: "Zoom",
        ToolClass: cornerstoneTools.ZoomTool,
        props: {
            strategies: {
                default: gentleZoomStrategy,
            },
            defaultStrategy: "default",
            configuration: {
                invert: false,
                minScale: 0.25,
                maxScale: 20,
            },
        },
    },
    {name: "Pan", ToolClass: cornerstoneTools.PanTool},
    {name: "Rotate", ToolClass: cornerstoneTools.RotateTool},
    {name: "Magnify", ToolClass: cornerstoneTools.MagnifyTool},
    {name: "StackScroll", ToolClass: cornerstoneTools.StackScrollTool},
    {
        name: "StackScrollMouseWheel",
        ToolClass: cornerstoneTools.StackScrollMouseWheelTool,
        props: {
            configuration: {
                loop: false,
                allowSkipping: false,
                invert: false,
            },
        },
    },
    {name: "Probe", ToolClass: cornerstoneTools.ProbeTool},
    {name: "DragProbe", ToolClass: cornerstoneTools.DragProbeTool},
    {name: "Length", ToolClass: cornerstoneTools.LengthTool},
    {name: "Angle", ToolClass: cornerstoneTools.AngleTool},
    {name: "CobbAngle", ToolClass: cornerstoneTools.CobbAngleTool},
    {name: "Bidirectional", ToolClass: cornerstoneTools.BidirectionalTool},
    {name: "ArrowAnnotate", ToolClass: cornerstoneTools.ArrowAnnotateTool},
    {name: "FreehandRoi", ToolClass: cornerstoneTools.FreehandRoiTool},
    {name: "EllipticalRoi", ToolClass: cornerstoneTools.EllipticalRoiTool},
    {name: "RectangleRoi", ToolClass: cornerstoneTools.RectangleRoiTool},
    {name: "Eraser", ToolClass: cornerstoneTools.EraserTool},
];

const REGISTERED_TOOL_NAMES = new Set();
const PERSISTENT_TOOL_NAMES = new Set(["StackScrollMouseWheel"]);
const ELEMENT_TOOL_FLAG = "rtviewerToolsReady";

function getElement() {
    return document.getElementById("dicomImage");
}

function withViewport(updateViewport) {
    const element = getElement();

    if (!element) {
        return false;
    }

    const viewport = cornerstone.getViewport(element);

    if (!viewport) {
        return false;
    }

    updateViewport(viewport, element);
    cornerstone.setViewport(element, viewport);

    return true;
}

class ButtonEvent {
    ensureToolsRegistered() {
        TOOL_DEFINITIONS.forEach(({name, ToolClass, props}) => {
            if (!ToolClass || REGISTERED_TOOL_NAMES.has(name)) {
                return;
            }

            cornerstoneTools.addTool(ToolClass, props);
            REGISTERED_TOOL_NAMES.add(name);
        });
    }

    ensureToolsRegisteredForElement(element = getElement()) {
        if (!element) {
            return false;
        }

        this.ensureToolsRegistered();

        if (element.dataset[ELEMENT_TOOL_FLAG] === "true") {
            return true;
        }

        TOOL_DEFINITIONS.forEach(({ToolClass, props}) => {
            if (!ToolClass) {
                return;
            }

            try {
                cornerstoneTools.addToolForElement(element, ToolClass, props);
            } catch (error) {
                // Tool may already be attached to the element.
            }
        });

        element.dataset[ELEMENT_TOOL_FLAG] = "true";
        return true;
    }

    activateTool(toolName) {
        const element = getElement();

        if (!element) {
            return false;
        }

        this.ensureToolsRegisteredForElement(element);
        this.deactivateAllTools();
        cornerstoneTools.setToolActiveForElement(element, toolName, {mouseButtonMask: 1});
        this.enableDefaultWheelStackScroll();

        return true;
    }

    deactivateAllTools() {
        const element = getElement();

        if (!element) {
            return false;
        }

        this.ensureToolsRegisteredForElement(element);
        TOOL_DEFINITIONS.forEach(({name}) => {
            if (PERSISTENT_TOOL_NAMES.has(name)) {
                return;
            }

            try {
                cornerstoneTools.setToolPassiveForElement(element, name);
            } catch (error) {
                // Some tools may not be active yet; passive fallback is safe to ignore.
            }
        });

        this.enableDefaultWheelStackScroll();
        return true;
    }

    enableDefaultWheelStackScroll() {
        const element = getElement();

        if (!element) {
            return false;
        }

        this.ensureToolsRegisteredForElement(element);

        try {
            cornerstoneTools.setToolActiveForElement(element, "StackScrollMouseWheel", {});
            return true;
        } catch (error) {
            return false;
        }
    }

    invertOn() {
        return withViewport((viewport) => {
            viewport.invert = !viewport.invert;
        });
    }

    interpolationOn() {
        return withViewport((viewport) => {
            viewport.pixelReplication = !viewport.pixelReplication;
        });
    }

    hflipOn() {
        return withViewport((viewport) => {
            viewport.hflip = !viewport.hflip;
        });
    }

    vflipOn() {
        return withViewport((viewport) => {
            viewport.vflip = !viewport.vflip;
        });
    }

    rotate90() {
        return withViewport((viewport) => {
            viewport.rotation += 90;
        });
    }

    resetViewport() {
        const element = getElement();

        if (!element) {
            return false;
        }

        cornerstone.reset(element);
        return true;
    }

    fitToWindow() {
        const element = getElement();

        if (!element) {
            return false;
        }

        cornerstone.fitToWindow(element);
        cornerstone.updateImage(element);

        return true;
    }
}

export {TOOL_DEFINITIONS};
export default ButtonEvent;
