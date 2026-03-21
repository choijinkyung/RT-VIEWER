import React from "react";
import {
  AppBar,
  Box,
  Chip,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import BiotechRoundedIcon from "@mui/icons-material/BiotechRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";

interface ViewerTopBarProps {
  activeTool: string | null;
}

function ViewerTopBar({ activeTool }: ViewerTopBarProps) {
  return (
    <AppBar position="static" color="transparent" elevation={0} className="topbar">
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
            label={activeTool ? `Active Tool: ${activeTool}` : "No Active Tool"}
            color={activeTool ? "warning" : "secondary"}
            variant="outlined"
          />
          <Chip
            icon={<MonitorHeartRoundedIcon />}
            label="CT / RTSTRUCT / RTDOSE"
            color="primary"
            variant="outlined"
          />
          <Chip label="Wheel: Stack Scroll" color="primary" variant="outlined" />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default ViewerTopBar;
