import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import Controlled from "./Viewport";
import type { LayoutAssignment } from "./types";

interface ViewportTileProps {
  assignment: LayoutAssignment | null;
  index: number;
  isActiveTile: boolean;
  isViewerLoading: boolean;
  onViewportSelection: (assignment: LayoutAssignment, isActiveTile: boolean) => void;
  onViewportWheel: (event: React.WheelEvent<HTMLDivElement>) => void;
  renderLoadingOverlay: () => React.ReactNode;
  renderViewportSkeleton: (
    index: number,
    assignment: LayoutAssignment | null,
    isActiveTile: boolean,
  ) => React.ReactNode;
}

function ViewportTile({
  assignment,
  index,
  isActiveTile,
  isViewerLoading,
  onViewportSelection,
  onViewportWheel,
  renderLoadingOverlay,
  renderViewportSkeleton,
}: ViewportTileProps) {
  if (!assignment && !isActiveTile) {
    return (
      <Paper key={`empty-${index}`} className="viewport-tile viewport-placeholder" elevation={0}>
        <Typography variant="body2" color="text.secondary">
          No image assigned
        </Typography>
      </Paper>
    );
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!assignment) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onViewportSelection(assignment, isActiveTile);
    }
  };

  return (
    <Box
      key={isActiveTile ? "active-viewport" : `preview-${index}`}
      className={`viewport-tile ${isActiveTile ? "is-active" : ""}`}
      onClick={assignment ? () => onViewportSelection(assignment, isActiveTile) : undefined}
      onWheel={!isActiveTile && assignment ? onViewportWheel : undefined}
      role={assignment ? "button" : undefined}
      tabIndex={assignment ? 0 : undefined}
      onKeyDown={assignment ? handleKeyDown : undefined}
    >
      <Box className="viewport-frame">
        <Box className="viewer-stage">
          {isActiveTile ? (
            <>
              <Controlled />
              {isViewerLoading ? renderViewportSkeleton(index, assignment, isActiveTile) : null}
              <div id="topleft" className="overlay topleft">
                <div id="topleft1">Image :</div>
                <div id="topleft2">Position:</div>
              </div>
              <div className="overlay topright">
                <div id="topright1">WW/WC:</div>
                <div id="topright2">Zoom:</div>
              </div>
              {renderLoadingOverlay()}
            </>
          ) : (
            <>
              <Controlled id={`previewViewport-${index}`} />
              <canvas id={`previewCanvas-${index}`} className="canvas" width={512} height={512} />
              {isViewerLoading ? renderViewportSkeleton(index, assignment, isActiveTile) : null}
              <div id={`previewOverlay-${index}`} className="overlay topleft">
                <div id={`previewImage-${index}`}>Image :</div>
                <div id={`previewPosition-${index}`}>Position :</div>
              </div>
              <div className="overlay topright">
                <div id={`previewWwwc-${index}`}>WW/WC:</div>
                <div id={`previewZoom-${index}`}>Zoom:</div>
              </div>
            </>
          )}
        </Box>
      </Box>

      {assignment ? (
        <Box className="viewport-meta">
          <Typography variant="body2" className="viewport-title">
            {assignment.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {assignment.secondaryLabel}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}

export default ViewportTile;
