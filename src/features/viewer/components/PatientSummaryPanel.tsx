import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

function PatientSummaryPanel() {
  return (
    <Paper className="panel patient-panel" elevation={0}>
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
            sx={{ display: "inline-block", mr: 2 }}
          >
            Patient Summary
          </Typography>
        </Box>
      </Stack>

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
  );
}

export default PatientSummaryPanel;
