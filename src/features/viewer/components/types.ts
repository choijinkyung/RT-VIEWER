import type { SvgIconComponent } from "@mui/icons-material";

export type LayoutMode = "image" | "series";

export interface ToolDefinition {
  icon: SvgIconComponent;
  label: string;
  shortcut: string;
  toolName: string;
}

export interface ViewportActionDefinition {
  action: () => void;
  label: string;
}

export interface LayoutPreset {
  columns: number;
  count: number;
  label: string;
  rows: number;
}

export interface LayoutAssignment {
  imageCount: number;
  imageId: string;
  imageIndex: number;
  label: string;
  secondaryLabel: string;
  seriesIndex: number;
}

export interface MainUIState {
  activeTool: string | null;
  currentSlice: number;
  isViewerLoading: boolean;
  layoutHoverPreset: string | null;
  layoutMode: LayoutMode;
  layoutPreset: string;
  previousLayoutPreset: string | null;
  seriesCount: number;
  totalSlices: number;
}
