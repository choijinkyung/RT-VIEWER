import React from "react";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";

function OverlaySidebar() {
  return (
    <Paper className="panel panel-sidebar" elevation={0}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" color="primary.main" gutterBottom>
            Overlay Review
          </Typography>
          <Typography variant="h6" gutterBottom>
            Structure and Dose
          </Typography>
        </Box>

        <Paper className="list-panel" elevation={0}>
          <Typography variant="subtitle2" color="primary.main" gutterBottom>
            Structures
          </Typography>
          <ul id="structure_checkbox_ul" className="overlay-list">
            Structures
          </ul>
        </Paper>

        <Paper className="list-panel" elevation={0}>
          <Typography variant="subtitle2" color="primary.main" gutterBottom>
            Isodoses
          </Typography>
          <ul id="dose_checkbox_ul" className="overlay-list">
            Isodoses
          </ul>
        </Paper>

        <Divider />

        <Box>
          <Typography variant="subtitle2" color="primary.main" gutterBottom>
            Keyboard
          </Typography>
          <Paper className="tip-card" elevation={0}>
            <Typography variant="body2" color="text.secondary">
              Press Esc to deactivate the currently active Cornerstone tool.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              ArrowUp or PageUp moves to the next slice, ArrowDown or PageDown
              moves to the previous slice, and the label on the right side of each
              tool button shows its shortcut.
            </Typography>
          </Paper>
        </Box>
      </Stack>
    </Paper>
  );
}

export default OverlaySidebar;
