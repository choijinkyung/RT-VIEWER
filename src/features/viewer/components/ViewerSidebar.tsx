import React from "react";
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import FilterCenterFocusRoundedIcon from "@mui/icons-material/FilterCenterFocusRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import CloseFullscreenRoundedIcon from "@mui/icons-material/CloseFullscreenRounded";
import LayoutModeSelector from "./LayoutModeSelector";
import type {
  LayoutMode,
  LayoutPreset,
  ToolDefinition,
  ViewportActionDefinition,
} from "./types";

interface ViewerSidebarProps {
  activePreset: LayoutPreset;
  activeTool: string | null;
  annotationTools: ToolDefinition[];
  interactiveTools: ToolDefinition[];
  layoutMode: LayoutMode;
  layoutPreset: string;
  layoutPresets: LayoutPreset[];
  onClearActiveTool: () => void;
  onLayoutHoverEnd: () => void;
  onLayoutHoverPreset: (layoutPreset: string) => void;
  onLayoutModeChange: (layoutMode: LayoutMode) => void;
  onLayoutPresetChange: (layoutPreset: string) => void;
  onLoadSample: () => void;
  onOpenPatientFolder: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToolActivation: (toolName: string) => void;
  onViewportAction: (action: () => void) => void;
  viewportActions: ViewportActionDefinition[];
}

function ViewerSidebar({
  activePreset,
  activeTool,
  annotationTools,
  interactiveTools,
  layoutMode,
  layoutPreset,
  layoutPresets,
  onClearActiveTool,
  onLayoutHoverEnd,
  onLayoutHoverPreset,
  onLayoutModeChange,
  onLayoutPresetChange,
  onLoadSample,
  onOpenPatientFolder,
  onToolActivation,
  onViewportAction,
  viewportActions,
}: ViewerSidebarProps) {
  return (
    <Paper className="panel panel-sidebar" elevation={0}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" color="primary.main" gutterBottom>
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
              onChange={onOpenPatientFolder}
            />
          </Button>
          <Button variant="outlined" color="secondary" onClick={onLoadSample}>
            Load TEST849 sample
          </Button>
        </Stack>

        <Divider />

        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <TuneRoundedIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" color="primary.main">
              Interaction Tools
            </Typography>
          </Stack>
          <Box className="tool-grid tool-grid-icons">
            {interactiveTools.map((tool) => {
              const IconComponent = tool.icon;

              return (
                <Tooltip
                  key={tool.toolName}
                  title={`${tool.label} (${tool.shortcut})`}
                  placement="bottom"
                  arrow
                >
                  <Button
                    variant={activeTool === tool.toolName ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => onToolActivation(tool.toolName)}
                    className="tool-icon-button"
                    aria-label={tool.label}
                  >
                    <IconComponent fontSize="small" />
                  </Button>
                </Tooltip>
              );
            })}
          </Box>
        </Box>

        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <GridViewRoundedIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" color="primary.main">
              Annotation Tools
            </Typography>
          </Stack>
          <Box className="tool-grid tool-grid-icons">
            {annotationTools.map((tool) => {
              const IconComponent = tool.icon;

              return (
                <Tooltip
                  key={tool.toolName}
                  title={`${tool.label} (${tool.shortcut})`}
                  placement="bottom"
                  arrow
                >
                  <Button
                    variant={activeTool === tool.toolName ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => onToolActivation(tool.toolName)}
                    className="tool-icon-button"
                    aria-label={tool.label}
                  >
                    <IconComponent fontSize="small" />
                  </Button>
                </Tooltip>
              );
            })}
          </Box>
        </Box>

        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <GridViewRoundedIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" color="primary.main">
              Layout Mode
            </Typography>
          </Stack>
          <Stack spacing={1}>
            <LayoutModeSelector
              activePreset={activePreset}
              isActiveMode={layoutMode === "image"}
              label="Image Layout"
              layoutPresets={layoutPresets}
              layoutPreset={layoutPreset}
              mode="image"
              onHoverEnd={onLayoutHoverEnd}
              onHoverPreset={onLayoutHoverPreset}
              onModeChange={onLayoutModeChange}
              onPresetChange={onLayoutPresetChange}
            />
            <LayoutModeSelector
              activePreset={activePreset}
              isActiveMode={layoutMode === "series"}
              label="Series Layout"
              layoutPresets={layoutPresets}
              layoutPreset={layoutPreset}
              mode="series"
              onHoverEnd={onLayoutHoverEnd}
              onHoverPreset={onLayoutHoverPreset}
              onModeChange={onLayoutModeChange}
              onPresetChange={onLayoutPresetChange}
            />
          </Stack>
        </Box>

        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <FilterCenterFocusRoundedIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" color="primary.main">
              View Actions
            </Typography>
          </Stack>
          <Box className="tool-grid tool-grid-dense">
            {viewportActions.map((tool) => (
              <Button
                key={tool.label}
                variant="outlined"
                color="primary"
                onClick={() => onViewportAction(tool.action)}
                className="tool-button"
              >
                {tool.label}
              </Button>
            ))}
          </Box>
        </Box>

        <Button
          variant="text"
          color="warning"
          startIcon={<CloseFullscreenRoundedIcon />}
          onClick={onClearActiveTool}
        >
          Clear active tool (Esc)
        </Button>
      </Stack>
    </Paper>
  );
}

export default ViewerSidebar;
