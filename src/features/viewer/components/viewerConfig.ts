import {
  alpha,
  createTheme,
} from "@mui/material";
import type { LayoutPreset, ToolDefinition, ViewportActionDefinition } from "./types";
import BorderColorRoundedIcon from "@mui/icons-material/BorderColorRounded";
import ChangeHistoryRoundedIcon from "@mui/icons-material/ChangeHistoryRounded";
import CloseFullscreenRoundedIcon from "@mui/icons-material/CloseFullscreenRounded";
import FilterCenterFocusRoundedIcon from "@mui/icons-material/FilterCenterFocusRounded";
import GestureRoundedIcon from "@mui/icons-material/GestureRounded";
import HeightRoundedIcon from "@mui/icons-material/HeightRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LinearScaleRoundedIcon from "@mui/icons-material/LinearScaleRounded";
import OpenWithRoundedIcon from "@mui/icons-material/OpenWithRounded";
import PanToolRoundedIcon from "@mui/icons-material/PanToolRounded";
import PhotoSizeSelectSmallRoundedIcon from "@mui/icons-material/PhotoSizeSelectSmallRounded";
import RotateRightRoundedIcon from "@mui/icons-material/RotateRightRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import StraightenRoundedIcon from "@mui/icons-material/StraightenRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import VerticalAlignCenterRoundedIcon from "@mui/icons-material/VerticalAlignCenterRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

export const viewerTheme = createTheme({
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

export const interactiveTools: ToolDefinition[] = [
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

export const annotationTools: ToolDefinition[] = [
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

export const layoutPresets: LayoutPreset[] = Array.from(
  { length: 4 },
  (_, rowIndex) => {
    const rows = rowIndex + 1;
    return Array.from({ length: 4 }, (_, columnIndex) => {
      const columns = columnIndex + 1;

      return {
        label: `${rows}x${columns}`,
        rows,
        columns,
        count: rows * columns,
      };
    });
  },
).flat();

export const createViewportActions = (
  buttonEvent: {
    fitToWindow: () => void;
    hflipOn: () => void;
    interpolationOn: () => void;
    invertOn: () => void;
    resetViewport: () => void;
    rotate90: () => void;
    vflipOn: () => void;
  },
): ViewportActionDefinition[] => [
  { label: "Invert", action: () => buttonEvent.invertOn() },
  { label: "Interpolation", action: () => buttonEvent.interpolationOn() },
  { label: "H Flip", action: () => buttonEvent.hflipOn() },
  { label: "V Flip", action: () => buttonEvent.vflipOn() },
  { label: "Rotate 90", action: () => buttonEvent.rotate90() },
  { label: "Reset View", action: () => buttonEvent.resetViewport() },
  { label: "Fit To Window", action: () => buttonEvent.fitToWindow() },
];
