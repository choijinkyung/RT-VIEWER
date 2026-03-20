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
  CssBaseline,
  Divider,
  Paper,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from "@mui/material";
import BiotechRoundedIcon from "@mui/icons-material/BiotechRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import Hammer from "hammerjs";
import dicomParser from "dicom-parser";
import "./MainUI.css";
import ButtonEvent from "./ButtonEvent";
import { fileLoader, loadBundledSample } from "./Loader/FileLoader.js";
import { handleFileSelect, handleDragOver } from "./Loader/DragAndDrop";
import Controlled from "./MouseControl";

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

const measurementTools = [
  { label: "Angle", action: () => buttonEvent.angleOn() },
  { label: "Length", action: () => buttonEvent.lengthOn() },
  { label: "Circle ROI", action: () => buttonEvent.drawCircle() },
  { label: "Rectangle ROI", action: () => buttonEvent.drawRectangle() },
  { label: "Erase", action: () => buttonEvent.eraserOn() },
];

const imageTools = [
  { label: "Invert", action: () => buttonEvent.invertOn() },
  { label: "Interpolation", action: () => buttonEvent.interpolationOn() },
  { label: "H Flip", action: () => buttonEvent.hflipOn() },
  { label: "V Flip", action: () => buttonEvent.vflipOn() },
  { label: "Rotate 90", action: () => buttonEvent.rotateOn() },
];

const workflowTips = [
  "좌클릭 드래그로 ROI 측정 도구를 사용합니다.",
  "마우스 휠로 CT 슬라이스를 이동합니다.",
  "우클릭 드래그로 WW/WC를 조절합니다.",
  "더블클릭으로 픽셀 및 보xel 좌표를 확인합니다.",
];

class MainUIElements extends React.Component {
  componentDidMount() {
    const dropZone = document.getElementById("dicomImage");
    dropZone.addEventListener("dragover", handleDragOver, false);
    dropZone.addEventListener("drop", handleFileSelect, false);

    if (process.env.NODE_ENV !== "test") {
      document.getElementById("patientName").textContent =
        "Patient Name : Loading bundled TEST849 sample...";
      loadBundledSample().catch(() => {
        document.getElementById("patientName").textContent =
          'Patient Name : Sample auto-load failed. Use "Open patient" to choose a folder.';
      });
    }

    const element = document.getElementById("dicomImage");
    element.addEventListener("mousedown", function (e) {
      let lastX = e.pageX;
      let lastY = e.pageY;
      const mouseButton = e.which;

      function mouseMoveHandler(moveEvent) {
        const deltaX = moveEvent.pageX - lastX;
        const deltaY = moveEvent.pageY - lastY;
        lastX = moveEvent.pageX;
        lastY = moveEvent.pageY;

        if (mouseButton === 2) {
          const viewport = cornerstone.getViewport(element);
          viewport.voi.windowWidth += deltaX / viewport.scale;
          viewport.voi.windowCenter += deltaY / viewport.scale;
          cornerstone.setViewport(element, viewport);

          document.getElementById("topright1").textContent =
            "WW/WC:" +
            Math.round(viewport.voi.windowWidth) +
            "/" +
            Math.round(viewport.voi.windowCenter);
        }
      }

      function mouseUpHandler() {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      }

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    });
  }

  renderToolButtons(buttons) {
    return (
      <Box className="tool-grid">
        {buttons.map((tool) => (
          <Button
            key={tool.label}
            variant="outlined"
            color="primary"
            onClick={tool.action}
            className="tool-button"
          >
            {tool.label}
          </Button>
        ))}
      </Box>
    );
  }

  render() {
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
                  label="Clinical Review UI"
                  color="secondary"
                  variant="outlined"
                />
                <Chip
                  icon={<MonitorHeartRoundedIcon />}
                  label="CT / RTSTRUCT / RTDOSE"
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
                      onChange={(e) => {
                        fileLoader(e);
                      }}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      loadBundledSample().catch(() => {
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
                      Measurement Tools
                    </Typography>
                  </Stack>
                  {this.renderToolButtons(measurementTools)}
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    color="primary.main"
                    gutterBottom
                  >
                    View Tools
                  </Typography>
                  {this.renderToolButtons(imageTools)}
                </Box>
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
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="panel-copy"
                    ></Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      label="Dose Overlay Ready"
                      color="success"
                      variant="filled"
                    />
                    <Chip
                      label="Structure Sync"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label="Mouse Control Enabled"
                      color="warning"
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
                <Box
                  id="dicomImageWrapper"
                  className="wrapper"
                  onContextMenu={(e) => {
                    e.preventDefault();
                  }}
                  onWheel={() => {}}
                >
                  <div>
                    <Controlled />
                  </div>
                  <div id="topleft" className="overlay topleft">
                    <div id="topleft1">Image :</div>
                    <div id="topleft2">Position:</div>
                  </div>
                  <div className="overlay topright">
                    <div id="topright1">WW/WC:</div>
                    <div id="topright2">Zoom:</div>
                  </div>
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

                {/* <Divider /> */}

                {/* <Box>
                  <Typography
                    variant="subtitle2"
                    color="primary.main"
                    gutterBottom
                  >
                    Workflow Notes
                  </Typography>
                  <Stack spacing={1.2}>
                    {workflowTips.map((tip) => (
                      <Paper key={tip} className="tip-card" elevation={0}>
                        <Typography variant="body2" color="text.secondary">
                          {tip}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Box> */}
              </Stack>
            </Paper>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }
}

export default MainUIElements;
