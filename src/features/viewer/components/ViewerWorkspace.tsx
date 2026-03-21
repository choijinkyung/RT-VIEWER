import React from "react";
import { Box, Button, Chip, Paper } from "@mui/material";
import KeyboardDoubleArrowDownRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowDownRounded";
import KeyboardDoubleArrowUpRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowUpRounded";
import ViewportTile from "./ViewportTile";
import type { LayoutAssignment, LayoutMode, LayoutPreset } from "./types";

interface ViewerWorkspaceProps {
  assignments: Array<LayoutAssignment | null>;
  currentSlice: number;
  isNextDisabled: boolean;
  isPrevDisabled: boolean;
  isViewerLoading: boolean;
  layoutMode: LayoutMode;
  layoutPreset: string;
  onNextPage: () => void;
  onPrevPage: () => void;
  onViewportSelection: (assignment: LayoutAssignment, isActiveTile: boolean) => void;
  onViewportWheel: (event: React.WheelEvent<HTMLDivElement>) => void;
  preset: LayoutPreset;
  renderLoadingOverlay: () => React.ReactNode;
  renderViewportSkeleton: (
    index: number,
    assignment: LayoutAssignment | null,
    isActiveTile: boolean,
  ) => React.ReactNode;
  totalSlices: number;
}

function ViewerWorkspace({
  assignments,
  currentSlice,
  isNextDisabled,
  isPrevDisabled,
  isViewerLoading,
  layoutPreset,
  onNextPage,
  onPrevPage,
  onViewportSelection,
  onViewportWheel,
  preset,
  renderLoadingOverlay,
  renderViewportSkeleton,
  totalSlices,
}: ViewerWorkspaceProps) {
  return (
    <Paper className="panel viewer-panel" elevation={0}>
      <Box className="slice-toolbar">
        <Button
          variant="outlined"
          color="primary"
          startIcon={<KeyboardDoubleArrowDownRoundedIcon />}
          onClick={onPrevPage}
          disabled={isPrevDisabled}
        >
          Prev Page
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
          onClick={onNextPage}
          disabled={isNextDisabled}
        >
          Next Page
        </Button>
      </Box>

      <Box
        id="dicomImageWrapper"
        className="wrapper"
        onContextMenu={(event) => {
          event.preventDefault();
        }}
      >
        <Box
          className={`viewport-grid preset-${layoutPreset}`}
          style={{
            gridTemplateColumns: `repeat(${preset.columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${preset.rows}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: preset.count }, (_, index) => (
            <ViewportTile
              key={index}
              assignment={assignments[index]}
              index={index}
              isActiveTile={index === 0}
              isViewerLoading={isViewerLoading}
              onViewportSelection={onViewportSelection}
              onViewportWheel={onViewportWheel}
              renderLoadingOverlay={renderLoadingOverlay}
              renderViewportSkeleton={renderViewportSkeleton}
            />
          ))}
        </Box>
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
  );
}

export default ViewerWorkspace;
