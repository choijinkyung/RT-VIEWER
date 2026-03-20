import React from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader";
import {
  alpha,
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  CssBaseline,
  Divider,
  Paper,
  Stack,
  ThemeProvider,
  Tooltip,
  Toolbar,
  Typography,
  createTheme,
} from "@mui/material";
import BiotechRoundedIcon from "@mui/icons-material/BiotechRounded";
import BorderColorRoundedIcon from "@mui/icons-material/BorderColorRounded";
import ChangeHistoryRoundedIcon from "@mui/icons-material/ChangeHistoryRounded";
import CloseFullscreenRoundedIcon from "@mui/icons-material/CloseFullscreenRounded";
import FilterCenterFocusRoundedIcon from "@mui/icons-material/FilterCenterFocusRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import GestureRoundedIcon from "@mui/icons-material/GestureRounded";
import HeightRoundedIcon from "@mui/icons-material/HeightRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardDoubleArrowDownRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowDownRounded";
import KeyboardDoubleArrowUpRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowUpRounded";
import LinearScaleRoundedIcon from "@mui/icons-material/LinearScaleRounded";
import OpenWithRoundedIcon from "@mui/icons-material/OpenWithRounded";
import PanToolRoundedIcon from "@mui/icons-material/PanToolRounded";
import PhotoSizeSelectSmallRoundedIcon from "@mui/icons-material/PhotoSizeSelectSmallRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import RotateRightRoundedIcon from "@mui/icons-material/RotateRightRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import StraightenRoundedIcon from "@mui/icons-material/StraightenRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import VerticalAlignCenterRoundedIcon from "@mui/icons-material/VerticalAlignCenterRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import Hammer from "hammerjs";
import dicomParser from "dicom-parser";
import "../styles/viewer.css";
import ButtonEvent, { TOOL_DEFINITIONS } from "../lib/toolManager";
import {
  fileLoader,
  getCurrentSliceIndex,
  getTotalSliceCount,
  loadBundledSample,
  stepSlice,
} from "../lib/fileLoader";
import { handleFileSelect, handleDragOver } from "../lib/dragAndDrop";
import Controlled from "./Viewport";

cornerstoneWadoImageLoader.external.cornerstone = cornerstone;
cornerstoneWadoImageLoader.external.dicomParser = dicomParser;
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.init();
dicomParser.toString().bold();

const buttonEvent = new ButtonEvent();

const viewerTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#58c4dc",
    },
    secondary: {
      main: "#7ee0a1",
    },
    background: {
      default: "#07111f",
      paper: "#0d1828",
    },
    success: {
      main: "#4fd1a5",
    },
    warning: {
      main: "#f6c177",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
    h6: {
      fontWeight: 700,
      letterSpacing: "0.02em",
    },
    subtitle2: {
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontSize: "0.72rem",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${alpha("#9cc8d8", 0.1)}`,
          boxShadow: "0 22px 60px rgba(3, 10, 22, 0.34)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

const interactiveTools = [
  { label: "WW/WC", toolName: "Wwwc", icon: TuneRoundedIcon, shortcut: "W" },
  {
    label: "WW/WC Region",
    toolName: "WwwcRegion",
    icon: PhotoSizeSelectSmallRoundedIcon,
    shortcut: "Shift+W",
  },
  { label: "Zoom", toolName: "Zoom", icon: SearchRoundedIcon, shortcut: "Z" },
  { label: "Pan", toolName: "Pan", icon: OpenWithRoundedIcon, shortcut: "P" },
  {
    label: "Rotate",
    toolName: "Rotate",
    icon: RotateRightRoundedIcon,
    shortcut: "O",
  },
  {
    label: "Magnify",
    toolName: "Magnify",
    icon: VisibilityRoundedIcon,
    shortcut: "M",
  },
  {
    label: "Stack Scroll",
    toolName: "StackScroll",
    icon: HeightRoundedIcon,
    shortcut: "S",
  },
];

const annotationTools = [
  { label: "Probe", toolName: "Probe", icon: InfoOutlinedIcon, shortcut: "I" },
  {
    label: "Drag Probe",
    toolName: "DragProbe",
    icon: PanToolRoundedIcon,
    shortcut: "D",
  },
  {
    label: "Length",
    toolName: "Length",
    icon: StraightenRoundedIcon,
    shortcut: "L",
  },
  {
    label: "Angle",
    toolName: "Angle",
    icon: ChangeHistoryRoundedIcon,
    shortcut: "A",
  },
  {
    label: "Cobb Angle",
    toolName: "CobbAngle",
    icon: LinearScaleRoundedIcon,
    shortcut: "C",
  },
  {
    label: "Bi-Directional",
    toolName: "Bidirectional",
    icon: VerticalAlignCenterRoundedIcon,
    shortcut: "B",
  },
  {
    label: "Arrow",
    toolName: "ArrowAnnotate",
    icon: UndoRoundedIcon,
    shortcut: "N",
  },
  {
    label: "Freehand ROI",
    toolName: "FreehandRoi",
    icon: GestureRoundedIcon,
    shortcut: "F",
  },
  {
    label: "Ellipse ROI",
    toolName: "EllipticalRoi",
    icon: FilterCenterFocusRoundedIcon,
    shortcut: "E",
  },
  {
    label: "Rectangle ROI",
    toolName: "RectangleRoi",
    icon: BorderColorRoundedIcon,
    shortcut: "R",
  },
  {
    label: "Erase",
    toolName: "Eraser",
    icon: CloseFullscreenRoundedIcon,
    shortcut: "X",
  },
];

const viewportActions = [
  { label: "Invert", action: () => buttonEvent.invertOn() },
  { label: "Interpolation", action: () => buttonEvent.interpolationOn() },
  { label: "H Flip", action: () => buttonEvent.hflipOn() },
  { label: "V Flip", action: () => buttonEvent.vflipOn() },
  { label: "Rotate 90", action: () => buttonEvent.rotate90() },
  { label: "Reset View", action: () => buttonEvent.resetViewport() },
  { label: "Fit To Window", action: () => buttonEvent.fitToWindow() },
];

class MainUIElements extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTool: null,
      currentSlice: 0,
      isViewerLoading: true,
      totalSlices: 0,
    };

    this.handleEscapeKey = this.handleEscapeKey.bind(this);
    this.handleViewerLoadStart = this.handleViewerLoadStart.bind(this);
    this.handleViewerReady = this.handleViewerReady.bind(this);
    this.handleViewerLoadError = this.handleViewerLoadError.bind(this);
    this.handleViewportRendered = this.handleViewportRendered.bind(this);
    this.handleSliceStep = this.handleSliceStep.bind(this);
    this.resizeViewer = this.resizeViewer.bind(this);
  }

  componentDidMount() {
    buttonEvent.ensureToolsRegistered();
    buttonEvent.enableDefaultWheelStackScroll();
    this.updateCursorForTool(null);

    const dropZone = document.getElementById("dicomImage");
    dropZone.addEventListener("dragover", handleDragOver, false);
    dropZone.addEventListener("drop", handleFileSelect, false);
    dropZone.addEventListener(
      "cornerstoneimagerendered",
      this.handleViewportRendered,
    );

    window.addEventListener("keydown", this.handleEscapeKey);
    window.addEventListener("resize", this.resizeViewer);
    window.addEventListener("rtviewer:load-start", this.handleViewerLoadStart);
    window.addEventListener("rtviewer:image-ready", this.handleViewerReady);
    window.addEventListener("rtviewer:load-error", this.handleViewerLoadError);

    if (process.env.NODE_ENV !== "test") {
      document.getElementById("patientName").textContent =
        "Patient Name : Loading bundled TEST849 sample...";
      loadBundledSample().catch(() => {
        this.setState({ isViewerLoading: false });
        document.getElementById("patientName").textContent =
          'Patient Name : Sample auto-load failed. Use "Open patient" to choose a folder.';
      });
    }

    this.resizeViewer();
  }

  componentWillUnmount() {
    const dropZone = document.getElementById("dicomImage");

    if (dropZone) {
      dropZone.removeEventListener("dragover", handleDragOver, false);
      dropZone.removeEventListener("drop", handleFileSelect, false);
      dropZone.removeEventListener(
        "cornerstoneimagerendered",
        this.handleViewportRendered,
      );
    }

    window.removeEventListener("keydown", this.handleEscapeKey);
    window.removeEventListener("resize", this.resizeViewer);
    window.removeEventListener(
      "rtviewer:load-start",
      this.handleViewerLoadStart,
    );
    window.removeEventListener("rtviewer:image-ready", this.handleViewerReady);
    window.removeEventListener(
      "rtviewer:load-error",
      this.handleViewerLoadError,
    );
  }

  handleEscapeKey(event) {
    if (event.key === "Escape") {
      buttonEvent.deactivateAllTools();
      this.updateCursorForTool(null);
      this.setState({ activeTool: null });
      return;
    }

    if (this.handleToolShortcut(event)) {
      return;
    }

    if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      this.handleSliceStep(1);
    }

    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      this.handleSliceStep(-1);
    }
  }

  handleViewerLoadStart() {
    this.setState({ isViewerLoading: true });
  }

  handleViewerReady(event) {
    const detail = (event && event.detail) || {};
    const currentSlice =
      typeof detail.currentImageIndex === "number"
        ? detail.currentImageIndex
        : getCurrentSliceIndex();
    const totalSlices =
      typeof detail.totalImages === "number"
        ? detail.totalImages
        : getTotalSliceCount();

    this.setState({
      currentSlice,
      isViewerLoading: false,
      totalSlices,
    });
    this.resizeViewer();
  }

  handleViewerLoadError() {
    this.setState({ isViewerLoading: false });
  }

  handleViewportRendered(event) {
    const viewport = event.detail && event.detail.viewport;

    if (!viewport) {
      return;
    }

    const wwWc = document.getElementById("topright1");
    const zoom = document.getElementById("topright2");

    if (wwWc) {
      wwWc.textContent = `WW/WC:${Math.round(viewport.voi.windowWidth)}/${Math.round(viewport.voi.windowCenter)}`;
    }

    if (zoom) {
      zoom.textContent = `Zoom:${viewport.scale.toFixed(2)}x`;
    }
  }

  handleToolActivation(toolName) {
    const activated = buttonEvent.activateTool(toolName);

    if (activated) {
      this.updateCursorForTool(toolName);
      this.setState({ activeTool: toolName });
    }
  }

  handleToolShortcut(event) {
    const key = event.key.toLowerCase();
    const isShift = event.shiftKey;
    const tool = [...interactiveTools, ...annotationTools].find((item) => {
      if (!item.shortcut) {
        return false;
      }

      const shortcut = item.shortcut.toLowerCase();
      const expectsShift = shortcut.startsWith("shift+");
      const targetKey = expectsShift
        ? shortcut.replace("shift+", "")
        : shortcut;

      return targetKey === key && expectsShift === isShift;
    });

    if (!tool) {
      return false;
    }

    event.preventDefault();
    this.handleToolActivation(tool.toolName);
    return true;
  }

  handleViewportAction(action) {
    action();
    this.setState((previousState) => ({ ...previousState }));
  }

  handleSliceStep(step) {
    const moved = stepSlice(step);

    if (moved) {
      this.setState({
        currentSlice: getCurrentSliceIndex(),
        totalSlices: getTotalSliceCount(),
      });
    }
  }

  updateCursorForTool(toolName) {
    const element = document.getElementById("dicomImage");

    if (!element) {
      return;
    }

    const cursorMap = {
      Angle: "crosshair",
      ArrowAnnotate: "copy",
      Bidirectional: "crosshair",
      CobbAngle: "crosshair",
      DragProbe: "grab",
      EllipticalRoi: "crosshair",
      Eraser: "not-allowed",
      FreehandRoi: "cell",
      Length: "crosshair",
      Magnify: "zoom-in",
      Pan: "grab",
      Probe: "help",
      RectangleRoi: "crosshair",
      Rotate: "alias",
      StackScroll: "ns-resize",
      Wwwc: "col-resize",
      WwwcRegion: "crosshair",
      Zoom: "zoom-in",
    };

    element.style.cursor = cursorMap[toolName] || "default";
  }

  resizeViewer() {
    const element = document.getElementById("dicomImage");

    if (!element) {
      return;
    }

    const overlayCanvas = document.getElementById("myCanvas");

    if (overlayCanvas) {
      overlayCanvas.style.width = "100%";
      overlayCanvas.style.height = "100%";
    }

    try {
      cornerstone.resize(element, true);
    } catch (error) {
      // Resize can run before the element is fully enabled; safe to ignore.
    }
  }

  renderInteractiveToolButtons(tools) {
    const { activeTool } = this.state;

    return (
      <Box className="tool-grid tool-grid-icons">
        {tools.map((tool) =>
          (() => {
            const IconComponent = tool.icon;

            return (
              <Tooltip
                key={tool.toolName}
                title={`${tool.label} (${tool.shortcut})`}
                placement="bottom"
                arrow
              >
                <Button
                  variant={
                    activeTool === tool.toolName ? "contained" : "outlined"
                  }
                  color="primary"
                  onClick={() => this.handleToolActivation(tool.toolName)}
                  className="tool-icon-button"
                  aria-label={tool.label}
                >
                  {IconComponent ? <IconComponent fontSize="small" /> : null}
                </Button>
              </Tooltip>
            );
          })(),
        )}
      </Box>
    );
  }

  renderActionButtons(buttons) {
    return (
      <Box className="tool-grid tool-grid-dense">
        {buttons.map((tool) => (
          <Button
            key={tool.label}
            variant="outlined"
            color="primary"
            onClick={() => this.handleViewportAction(tool.action)}
            className="tool-button"
          >
            {tool.label}
          </Button>
        ))}
      </Box>
    );
  }

  renderLoadingOverlay() {
    if (!this.state.isViewerLoading) {
      return null;
    }

    return (
      <Box className="viewer-loading">
        <Stack
          spacing={2.5}
          alignItems="center"
          className="viewer-loading-card"
        >
          <CircularProgress color="primary" thickness={4.2} />
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="subtitle2"
              color="primary.main"
              gutterBottom
              align="center"
            >
              Preparing Study
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 2 }}
            >
              TEST case and overlays are loading into the viewer workspace.
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  }

  render() {
    const { activeTool, currentSlice, totalSlices } = this.state;

    return (
      <ThemeProvider theme={viewerTheme}>
        <CssBaseline />
        <Box id="outsideWrapper" className="app-shell">
          <AppBar
            position="static"
            color="transparent"
            elevation={0}
            className="topbar"
          >
            <Toolbar className="topbar-toolbar">
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ flexGrow: 1, minWidth: 0 }}
              >
                <Box className="brand-badge">
                  <BiotechRoundedIcon fontSize="small" />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" color="primary.main">
                    RT Viewer
                  </Typography>
                  <Typography variant="h6" noWrap>
                    Radiation Therapy Imaging Workspace
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<ShieldRoundedIcon />}
                  label={
                    activeTool ? `Active Tool: ${activeTool}` : "No Active Tool"
                  }
                  color={activeTool ? "warning" : "secondary"}
                  variant="outlined"
                />
                <Chip
                  icon={<MonitorHeartRoundedIcon />}
                  label="CT / RTSTRUCT / RTDOSE"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label="Wheel: Stack Scroll"
                  color="primary"
                  variant="outlined"
                />
              </Stack>
            </Toolbar>
          </AppBar>

          <Box className="workspace-grid">
            <Paper className="panel panel-sidebar" elevation={0}>
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="primary.main"
                    gutterBottom
                  >
                    Data Intake
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Patient Session
                  </Typography>
                  {/* <Typography variant="body2" color="text.secondary" className="panel-copy">
                                        초기에 샘플 데이터가 로딩되는 동안 스피너와 스켈레톤을 표시하고, 이후에는 모든 뷰어 조작을 툴 버튼 중심으로 수행하도록 정리했습니다.
                                    </Typography> */}
                </Box>

                <Stack spacing={1.5}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FolderOpenRoundedIcon />}
                    component="label"
                    size="large"
                  >
                    Open patient folder
                    <input
                      type="file"
                      id="filepicker"
                      name="fileList"
                      webkitdirectory=""
                      directory=""
                      multiple
                      hidden
                      onChange={(event) => {
                        this.setState({ isViewerLoading: true });
                        fileLoader(event);
                      }}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      this.setState({ isViewerLoading: true });
                      loadBundledSample().catch(() => {
                        this.setState({ isViewerLoading: false });
                        alert("Unable to load the bundled TEST849 sample.");
                      });
                    }}
                  >
                    Load TEST849 sample
                  </Button>
                </Stack>

                <Divider />

                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <TuneRoundedIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" color="primary.main">
                      Interaction Tools
                    </Typography>
                  </Stack>
                  {this.renderInteractiveToolButtons(interactiveTools)}
                </Box>

                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <GridViewRoundedIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" color="primary.main">
                      Annotation Tools
                    </Typography>
                  </Stack>
                  {this.renderInteractiveToolButtons(annotationTools)}
                </Box>

                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <FilterCenterFocusRoundedIcon
                      color="primary"
                      fontSize="small"
                    />
                    <Typography variant="subtitle2" color="primary.main">
                      View Actions
                    </Typography>
                  </Stack>
                  {this.renderActionButtons(viewportActions)}
                </Box>

                <Button
                  variant="text"
                  color="warning"
                  startIcon={<CloseFullscreenRoundedIcon />}
                  onClick={() => {
                    buttonEvent.deactivateAllTools();
                    this.updateCursorForTool(null);
                    this.setState({ activeTool: null });
                  }}
                >
                  Clear active tool (Esc)
                </Button>
              </Stack>
            </Paper>

            <Box className="viewer-column">
              <Paper className="panel hero-panel" elevation={0}>
                <Stack
                  direction={{ xs: "column", lg: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", lg: "center" }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="primary.main"
                      gutterBottom
                    >
                      Active Study
                    </Typography>
                    <Typography variant="h5" className="hero-title">
                      RT Planning Review Console
                    </Typography>
                    {/* <Typography variant="body2" color="text.secondary" className="panel-copy">
                                            기본 마우스 팬과 우클릭 WW/WC를 제거했고, 마우스 휠은 기본적으로 Stack Scroll이 동작하도록 유지했습니다.
                                        </Typography> */}
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      label="Loading Overlay Added"
                      color="success"
                      variant="filled"
                    />
                    <Chip
                      label="Esc Clears Tool"
                      color="warning"
                      variant="outlined"
                    />
                    <Chip
                      label={`${TOOL_DEFINITIONS.length} Tools Registered`}
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </Paper>

              <Paper className="panel patient-panel" elevation={0}>
                <Typography
                  variant="subtitle2"
                  color="primary.main"
                  gutterBottom
                >
                  Patient Summary
                </Typography>
                <Box className="patient-grid">
                  <Paper className="info-chip" elevation={0}>
                    <span id="patientName">Patient Name : </span>
                  </Paper>
                  <Paper className="info-chip" elevation={0}>
                    <span id="patientID">Patient ID : </span>
                  </Paper>
                  <Paper className="info-chip" elevation={0}>
                    <span id="gender">Gender : </span>
                  </Paper>
                </Box>
              </Paper>

              <Paper className="panel viewer-panel" elevation={0}>
                <Box className="slice-toolbar">
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<KeyboardDoubleArrowDownRoundedIcon />}
                    onClick={() => this.handleSliceStep(-1)}
                    disabled={currentSlice <= 0}
                  >
                    Prev Slice
                  </Button>
                  <Chip
                    label={`Slice ${Math.max(currentSlice + 1, 0)} / ${Math.max(totalSlices, 0)}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    endIcon={<KeyboardDoubleArrowUpRoundedIcon />}
                    onClick={() => this.handleSliceStep(1)}
                    disabled={
                      totalSlices === 0 || currentSlice >= totalSlices - 1
                    }
                  >
                    Next Slice
                  </Button>
                </Box>

                <Box
                  id="dicomImageWrapper"
                  className="wrapper"
                  onContextMenu={(event) => {
                    event.preventDefault();
                  }}
                >
                  <Box className="viewer-stage">
                    <Controlled />
                  </Box>
                  <div id="topleft" className="overlay topleft">
                    <div id="topleft1">Image :</div>
                    <div id="topleft2">Position:</div>
                  </div>
                  <div className="overlay topright">
                    <div id="topright1">WW/WC:</div>
                    <div id="topright2">Zoom:</div>
                  </div>
                  {this.renderLoadingOverlay()}
                </Box>

                <Box className="viewer-footer">
                  <Paper className="metric-card" elevation={0}>
                    <span id="coords" />
                    <span id="voxelCoords" />
                  </Paper>
                  <Paper className="metric-card" elevation={0}>
                    <span id="pixelValue" />
                    <span id="voxelValue" />
                  </Paper>
                  <Paper className="metric-card" elevation={0}>
                    <span id="doseCoords" />
                  </Paper>
                </Box>
              </Paper>
            </Box>

            <Paper className="panel panel-sidebar" elevation={0}>
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="primary.main"
                    gutterBottom
                  >
                    Overlay Review
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Structure and Dose
                  </Typography>
                  {/* <Typography variant="body2" color="text.secondary" className="panel-copy">
                                        영상이 바뀌어도 RT Structure와 Isodose 오버레이가 함께 유지되도록 연결되어 있습니다.
                                    </Typography> */}
                </Box>

                <Paper className="list-panel" elevation={0}>
                  <Typography
                    variant="subtitle2"
                    color="primary.main"
                    gutterBottom
                  >
                    Structures
                  </Typography>
                  <ul id="structure_checkbox_ul" className="overlay-list">
                    Structures
                  </ul>
                </Paper>

                <Paper className="list-panel" elevation={0}>
                  <Typography
                    variant="subtitle2"
                    color="primary.main"
                    gutterBottom
                  >
                    Isodoses
                  </Typography>
                  <ul id="dose_checkbox_ul" className="overlay-list">
                    Isodoses
                  </ul>
                </Paper>

                <Divider />

                <Box>
                  <Typography
                    variant="subtitle2"
                    color="primary.main"
                    gutterBottom
                  >
                    Keyboard
                  </Typography>
                  <Paper className="tip-card" elevation={0}>
                    <Typography variant="body2" color="text.secondary">
                      Press Esc to deactivate the currently active Cornerstone
                      tool.
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      ArrowUp or PageUp moves to the next slice, ArrowDown or
                      PageDown moves to the previous slice, and the label on the
                      right side of each tool button shows its shortcut.
                    </Typography>
                  </Paper>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }
}

export default MainUIElements;
