import React from "react";
import { Box, Button, Typography } from "@mui/material";
import type { LayoutPreset, LayoutMode } from "./types";

interface LayoutModeSelectorProps {
  activePreset: LayoutPreset;
  isActiveMode: boolean;
  label: string;
  layoutPresets: LayoutPreset[];
  layoutPreset: string;
  mode: LayoutMode;
  onHoverEnd: () => void;
  onHoverPreset: (layoutPreset: string) => void;
  onModeChange: (layoutMode: LayoutMode) => void;
  onPresetChange: (layoutPreset: string) => void;
}

function LayoutModeSelector({
  activePreset,
  isActiveMode,
  label,
  layoutPresets,
  layoutPreset,
  mode,
  onHoverEnd,
  onHoverPreset,
  onModeChange,
  onPresetChange,
}: LayoutModeSelectorProps) {
  const getLayoutPresetByGrid = (rows: number, columns: number) =>
    layoutPresets.find((preset) => preset.rows === rows && preset.columns === columns) || null;

  return (
    <Box
      className={`layout-mode-selector ${isActiveMode ? "is-active" : ""}`}
      onMouseLeave={onHoverEnd}
    >
      <Box className="layout-selector-panel layout-selector-panel-block">
        <Button
          variant={isActiveMode ? "contained" : "outlined"}
          color="primary"
          onClick={() => onModeChange(mode)}
          className="layout-selector-trigger layout-selector-trigger-block"
        >
          {label}
          {isActiveMode ? ` · ${layoutPreset}` : ""}
        </Button>
        <Box className="layout-selector-hover">
          <Box className="layout-selector-grid">
            {Array.from({ length: 4 }, (_, rowIndex) =>
              Array.from({ length: 4 }, (_, columnIndex) => {
                const rows = rowIndex + 1;
                const columns = columnIndex + 1;
                const presetOption = getLayoutPresetByGrid(rows, columns);
                const isHighlighted =
                  rowIndex < activePreset.rows && columnIndex < activePreset.columns;

                return (
                  <Box
                    key={`${mode}-${rows}-${columns}`}
                    className={`layout-selector-cell ${
                      isHighlighted ? "is-highlighted" : ""
                    } ${presetOption ? "is-supported" : "is-disabled"}`}
                    onMouseEnter={() => {
                      if (presetOption) {
                        onHoverPreset(presetOption.label);
                      }
                    }}
                    onClick={() => {
                      if (presetOption) {
                        onModeChange(mode);
                        onPresetChange(presetOption.label);
                      }
                    }}
                    role={presetOption ? "button" : undefined}
                    tabIndex={presetOption ? 0 : -1}
                    onKeyDown={(event) => {
                      if (presetOption && (event.key === "Enter" || event.key === " ")) {
                        event.preventDefault();
                        onModeChange(mode);
                        onPresetChange(presetOption.label);
                      }
                    }}
                  />
                );
              }),
            )}
          </Box>
          <Typography variant="body2" className="layout-preset-label">
            {label} · {activePreset.label}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default LayoutModeSelector;
