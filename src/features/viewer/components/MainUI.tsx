import React from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneWadoImageLoader from "cornerstone-wado-image-loader";
import {
  Box,
  CircularProgress,
  CssBaseline,
  Skeleton,
  Stack,
  ThemeProvider,
  Typography,
} from "@mui/material";
import Hammer from "hammerjs";
import dicomParser from "dicom-parser";
import "../styles/viewer.css";
import ButtonEvent from "../lib/toolManager";
import {
  fileLoader,
  getCurrentSeriesIndex,
  getCurrentSliceIndex,
  getSeriesGroups,
  getTotalSliceCount,
  goToSlice,
  loadBundledSample,
  redrawCurrentImageOverlays,
  renderViewportOverlays,
  setCurrentSeriesIndex,
  stepSlice,
} from "../lib/fileLoader";
import { handleDragOver, handleFileSelect } from "../lib/dragAndDrop";
import OverlaySidebar from "./OverlaySidebar";
import PatientSummaryPanel from "./PatientSummaryPanel";
import ViewerSidebar from "./ViewerSidebar";
import ViewerTopBar from "./ViewerTopBar";
import ViewerWorkspace from "./ViewerWorkspace";
import {
  annotationTools,
  createViewportActions,
  interactiveTools,
  layoutPresets,
  viewerTheme,
} from "./viewerConfig";
import type {
  LayoutAssignment,
  LayoutMode,
  LayoutPreset,
  MainUIState,
} from "./types";

cornerstoneWadoImageLoader.external.cornerstone = cornerstone;
cornerstoneWadoImageLoader.external.dicomParser = dicomParser;
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.init();
dicomParser.toString().bold();

const buttonEvent = new ButtonEvent();
const viewportActions = createViewportActions(buttonEvent);

class MainUIElements extends React.Component<Record<string, never>, MainUIState> {
  constructor(props: Record<string, never>) {
    super(props);

    this.state = {
      activeTool: null,
      currentSlice: 0,
      isViewerLoading: true,
      layoutMode: "image",
      layoutPreset: "2x2",
      layoutHoverPreset: null,
      previousLayoutPreset: null,
      seriesCount: 0,
      totalSlices: 0,
    };

    this.handleDatasetReady = this.handleDatasetReady.bind(this);
    this.handleEscapeKey = this.handleEscapeKey.bind(this);
    this.handleLayoutModeChange = this.handleLayoutModeChange.bind(this);
    this.handleLayoutPresetChange = this.handleLayoutPresetChange.bind(this);
    this.handleLayoutPresetHover = this.handleLayoutPresetHover.bind(this);
    this.handleLayoutPresetHoverEnd = this.handleLayoutPresetHoverEnd.bind(this);
    this.handleLayoutStep = this.handleLayoutStep.bind(this);
    this.handleOverlaySelectionChanged = this.handleOverlaySelectionChanged.bind(this);
    this.handlePreviewSelection = this.handlePreviewSelection.bind(this);
    this.handleSliceStep = this.handleSliceStep.bind(this);
    this.handleToolActivation = this.handleToolActivation.bind(this);
    this.handleViewerLoadError = this.handleViewerLoadError.bind(this);
    this.handleViewerLoadStart = this.handleViewerLoadStart.bind(this);
    this.handleViewerReady = this.handleViewerReady.bind(this);
    this.handleViewportRendered = this.handleViewportRendered.bind(this);
    this.handleViewportSelection = this.handleViewportSelection.bind(this);
    this.handleViewportWheel = this.handleViewportWheel.bind(this);
    this.renderAuxiliaryViewports = this.renderAuxiliaryViewports.bind(this);
    this.resizeViewer = this.resizeViewer.bind(this);
  }

  componentDidMount() {
    buttonEvent.ensureToolsRegistered();
    buttonEvent.enableDefaultWheelStackScroll();
    this.updateCursorForTool(null);

    const dropZone = document.getElementById("dicomImage");
    if (dropZone) {
      dropZone.addEventListener("dragover", handleDragOver, false);
      dropZone.addEventListener("drop", handleFileSelect, false);
      dropZone.addEventListener(
        "cornerstoneimagerendered",
        this.handleViewportRendered as EventListener,
      );
    }

    window.addEventListener("keydown", this.handleEscapeKey);
    window.addEventListener("resize", this.resizeViewer);
    window.addEventListener("rtviewer:dataset-ready", this.handleDatasetReady);
    window.addEventListener("rtviewer:load-start", this.handleViewerLoadStart);
    window.addEventListener("rtviewer:image-ready", this.handleViewerReady as EventListener);
    window.addEventListener("rtviewer:load-error", this.handleViewerLoadError);
    window.addEventListener(
      "rtviewer:overlay-selection-changed",
      this.handleOverlaySelectionChanged,
    );

    if (process.env.NODE_ENV !== "test") {
      const patientName = document.getElementById("patientName");

      if (patientName) {
        patientName.textContent =
          "Patient Name : Loading bundled TEST849 sample...";
      }

      loadBundledSample().catch(() => {
        this.setState({ isViewerLoading: false });
        const failedPatientName = document.getElementById("patientName");

        if (failedPatientName) {
          failedPatientName.textContent =
            'Patient Name : Sample auto-load failed. Use "Open patient" to choose a folder.';
        }
      });
    }

    this.resizeViewer();
  }

  componentDidUpdate(_: Record<string, never>, prevState: MainUIState) {
    if (
      prevState.currentSlice !== this.state.currentSlice ||
      prevState.layoutMode !== this.state.layoutMode ||
      prevState.layoutPreset !== this.state.layoutPreset ||
      prevState.seriesCount !== this.state.seriesCount ||
      prevState.isViewerLoading !== this.state.isViewerLoading
    ) {
      this.renderAuxiliaryViewports();
    }
  }

  componentWillUnmount() {
    const dropZone = document.getElementById("dicomImage");

    if (dropZone) {
      dropZone.removeEventListener("dragover", handleDragOver, false);
      dropZone.removeEventListener("drop", handleFileSelect, false);
      dropZone.removeEventListener(
        "cornerstoneimagerendered",
        this.handleViewportRendered as EventListener,
      );
    }

    window.removeEventListener("keydown", this.handleEscapeKey);
    window.removeEventListener("resize", this.resizeViewer);
    window.removeEventListener("rtviewer:dataset-ready", this.handleDatasetReady);
    window.removeEventListener("rtviewer:load-start", this.handleViewerLoadStart);
    window.removeEventListener(
      "rtviewer:image-ready",
      this.handleViewerReady as EventListener,
    );
    window.removeEventListener("rtviewer:load-error", this.handleViewerLoadError);
    window.removeEventListener(
      "rtviewer:overlay-selection-changed",
      this.handleOverlaySelectionChanged,
    );
  }

  handleDatasetReady() {
    this.setState({
      currentSlice: getCurrentSliceIndex(),
      seriesCount: getSeriesGroups().length,
      totalSlices: getTotalSliceCount(),
      isViewerLoading: false,
    });
  }

  handleEscapeKey(event: KeyboardEvent) {
    if (event.key === "Escape") {
      buttonEvent.deactivateAllTools();
      this.updateCursorForTool(null);
      this.setState({ activeTool: null });
      return;
    }

    if (this.handleToolShortcut(event)) {
      return;
    }

    if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      this.handleLayoutStep(1);
    }

    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      this.handleLayoutStep(-1);
    }
  }

  handleLayoutModeChange(layoutMode: LayoutMode) {
    this.setState({ layoutMode });
  }

  handleLayoutPresetChange(layoutPreset: string) {
    this.setState((previousState): Pick<
      MainUIState,
      "layoutPreset" | "layoutHoverPreset" | "previousLayoutPreset"
    > => {
      if (layoutPreset === "1x1" && previousState.layoutPreset !== "1x1") {
        return {
          layoutPreset,
          layoutHoverPreset: null,
          previousLayoutPreset: previousState.layoutPreset,
        };
      }

      if (layoutPreset !== "1x1") {
        return {
          layoutPreset,
          layoutHoverPreset: null,
          previousLayoutPreset: null,
        };
      }

      return {
        layoutPreset,
        layoutHoverPreset: null,
        previousLayoutPreset: previousState.previousLayoutPreset,
      };
    });
  }

  handleLayoutPresetHover(layoutPreset: string) {
    this.setState({ layoutHoverPreset: layoutPreset });
  }

  handleLayoutPresetHoverEnd() {
    this.setState({ layoutHoverPreset: null });
  }

  handleLayoutStep(direction: number) {
    const stepSize = this.getLayoutStepSize();

    if (this.state.layoutMode === "series") {
      const switched = setCurrentSeriesIndex(
        getCurrentSeriesIndex() + direction * stepSize,
      );

      if (switched) {
        this.setState({
          currentSlice: getCurrentSliceIndex(),
          seriesCount: getSeriesGroups().length,
          totalSlices: getTotalSliceCount(),
        });
      }

      return;
    }

    this.handleSliceStep(direction * stepSize);
  }

  handleOverlaySelectionChanged() {
    this.renderAuxiliaryViewports();
  }

  handlePreviewSelection(assignment: LayoutAssignment | null) {
    if (!assignment) {
      return;
    }

    if (this.state.layoutMode === "series" && typeof assignment.seriesIndex === "number") {
      const switched = setCurrentSeriesIndex(assignment.seriesIndex);

      if (switched) {
        this.setState({
          currentSlice: getCurrentSliceIndex(),
          totalSlices: getTotalSliceCount(),
        });
      }

      return;
    }

    if (typeof assignment.imageIndex === "number") {
      const moved = goToSlice(assignment.imageIndex);

      if (moved) {
        this.setState({
          currentSlice: getCurrentSliceIndex(),
          totalSlices: getTotalSliceCount(),
        });
      }
    }
  }

  handleSliceStep(step: number) {
    const moved = stepSlice(step);

    if (moved) {
      this.setState({
        currentSlice: getCurrentSliceIndex(),
        totalSlices: getTotalSliceCount(),
      });
    }
  }

  handleToolActivation(toolName: string) {
    const activated = buttonEvent.activateTool(toolName);

    if (activated) {
      this.updateCursorForTool(toolName);
      this.setState({ activeTool: toolName });
    }
  }

  handleToolShortcut(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    const isShift = event.shiftKey;
    const tool = [...interactiveTools, ...annotationTools].find((item) => {
      const shortcut = item.shortcut.toLowerCase();
      const expectsShift = shortcut.startsWith("shift+");
      const targetKey = expectsShift ? shortcut.replace("shift+", "") : shortcut;

      return targetKey === key && expectsShift === isShift;
    });

    if (!tool) {
      return false;
    }

    event.preventDefault();
    this.handleToolActivation(tool.toolName);
    return true;
  }

  handleViewerLoadError() {
    this.setState({ isViewerLoading: false });
  }

  handleViewerLoadStart() {
    this.setState({ isViewerLoading: true });
  }

  handleViewerReady(event: Event) {
    const detail =
      event instanceof CustomEvent && event.detail
        ? (event.detail as { currentImageIndex?: number; totalImages?: number })
        : {};

    const currentSlice =
      typeof detail.currentImageIndex === "number"
        ? detail.currentImageIndex
        : getCurrentSliceIndex();
    const totalSlices =
      typeof detail.totalImages === "number"
        ? detail.totalImages
        : getTotalSliceCount();

    this.setState({
      currentSlice,
      isViewerLoading: false,
      totalSlices,
    });
    this.resizeViewer();
  }

  handleViewportRendered(event: Event) {
    const detail =
      event instanceof CustomEvent && event.detail
        ? (event.detail as {
            viewport?: {
              scale: number;
              voi: { windowCenter: number; windowWidth: number };
            };
          })
        : {};
    const viewport = detail.viewport;

    if (!viewport) {
      return;
    }

    const wwWc = document.getElementById("topright1");
    const zoom = document.getElementById("topright2");

    if (wwWc) {
      wwWc.textContent = `WW/WC:${Math.round(viewport.voi.windowWidth)}/${Math.round(
        viewport.voi.windowCenter,
      )}`;
    }

    if (zoom) {
      zoom.textContent = `Zoom:${viewport.scale.toFixed(2)}x`;
    }

    redrawCurrentImageOverlays();
  }

  handleViewportSelection(assignment: LayoutAssignment, isActiveTile: boolean) {
    if (this.state.layoutPreset === "1x1" && isActiveTile) {
      this.setState((previousState) => ({
        layoutPreset: previousState.previousLayoutPreset || "2x2",
        previousLayoutPreset: null,
      }));
      return;
    }

    this.handlePreviewSelection(assignment);

    if (this.state.layoutPreset !== "1x1") {
      this.setState((previousState) => ({
        layoutPreset: "1x1",
        previousLayoutPreset: previousState.layoutPreset,
      }));
    }
  }

  handleViewportWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    this.handleLayoutStep(event.deltaY > 0 ? 1 : -1);
  }

  getLayoutPresetByLabel(layoutPreset: string) {
    return layoutPresets.find((preset) => preset.label === layoutPreset) || layoutPresets[1];
  }

  getLayoutPresetConfig(): LayoutPreset {
    return this.getLayoutPresetByLabel(this.state.layoutPreset);
  }

  getLayoutStepSize() {
    const preset = this.getLayoutPresetConfig();
    return preset.count || 1;
  }

  getLayoutAssignments(): Array<LayoutAssignment | null> {
    const preset = this.getLayoutPresetConfig();
    const seriesGroups = getSeriesGroups();
    const currentSeriesIndex = getCurrentSeriesIndex();
    const currentSlice = getCurrentSliceIndex();

    if (this.state.layoutMode === "series") {
      return Array.from({ length: preset.count }, (_, offset) => {
        const seriesIndex = currentSeriesIndex + offset;
        const group = seriesGroups[seriesIndex];

        if (!group || !group.imageIds.length) {
          return null;
        }

        const imageIndex = Math.min(currentSlice, Math.max(group.imageIds.length - 1, 0));

        return {
          imageId: group.imageIds[imageIndex],
          imageIndex,
          imageCount: group.imageCount,
          label:
            group.seriesDescription || `Series ${group.seriesNumber || seriesIndex + 1}`,
          secondaryLabel: `${group.imageCount} images`,
          seriesIndex,
        };
      });
    }

    const activeSeries = seriesGroups[currentSeriesIndex];
    const imageIds = activeSeries ? activeSeries.imageIds : [];

    return Array.from({ length: preset.count }, (_, offset) => {
      const imageIndex = currentSlice + offset;
      const imageId = imageIds[imageIndex];

      if (!imageId) {
        return null;
      }

      return {
        imageId,
        imageIndex,
        imageCount: imageIds.length,
        label: `Image ${imageIndex + 1}`,
        secondaryLabel: activeSeries
          ? activeSeries.seriesDescription || `Series ${currentSeriesIndex + 1}`
          : "",
        seriesIndex: currentSeriesIndex,
      };
    });
  }

  updateCursorForTool(toolName: string | null) {
    const element = document.getElementById("dicomImage");

    if (!element) {
      return;
    }

    const cursorMap: Record<string, string> = {
      Angle: "crosshair",
      ArrowAnnotate: "copy",
      Bidirectional: "crosshair",
      CobbAngle: "crosshair",
      DragProbe: "grab",
      EllipticalRoi: "crosshair",
      Eraser: "not-allowed",
      FreehandRoi: "cell",
      Length: "crosshair",
      Magnify: "zoom-in",
      Pan: "grab",
      Probe: "help",
      RectangleRoi: "crosshair",
      Rotate: "alias",
      StackScroll: "ns-resize",
      Wwwc: "col-resize",
      WwwcRegion: "crosshair",
      Zoom: "zoom-in",
    };

    element.style.cursor = toolName ? cursorMap[toolName] || "default" : "default";
  }

  resizeViewer() {
    const overlayCanvas = document.getElementById("myCanvas") as HTMLCanvasElement | null;

    if (overlayCanvas) {
      overlayCanvas.style.width = "100%";
      overlayCanvas.style.height = "100%";
    }

    Array.from(document.querySelectorAll(".viewportElement")).forEach((element) => {
      try {
        cornerstone.resize(element as HTMLDivElement, true);
      } catch (_error) {
        // Safe to ignore before the element is enabled.
      }
    });

    redrawCurrentImageOverlays();
  }

  renderAuxiliaryViewports() {
    if (this.state.isViewerLoading) {
      return;
    }

    const assignments = this.getLayoutAssignments().slice(1);

    assignments.forEach((assignment, index) => {
      const previewIndex = index + 1;
      const element = document.getElementById(
        `previewViewport-${previewIndex}`,
      ) as HTMLDivElement | null;

      if (!element || !assignment || !assignment.imageId) {
        return;
      }

      try {
        cornerstone.getEnabledElement(element);
      } catch (_error) {
        try {
          cornerstone.enable(element);
        } catch (_enableError) {
          return;
        }
      }

      cornerstone
        .loadImage(assignment.imageId)
        .then((image) => {
          if (!element.isConnected) {
            return;
          }

          const viewport = cornerstone.getDefaultViewportForImage(element, image);
          cornerstone.displayImage(element, image, viewport);
          renderViewportOverlays({
            canvas: document.getElementById(`previewCanvas-${previewIndex}`),
            element,
            image,
            imageIndex: assignment.imageIndex,
          });
          this.updatePreviewOverlay(previewIndex, assignment, image, viewport);
        })
        .catch(() => {
          // Ignore preview failures so the main viewport remains usable.
        });
    });

    this.resizeViewer();
  }

  updatePreviewOverlay(
    index: number,
    assignment: LayoutAssignment,
    image: {
      data?: { string: (tag: string) => string };
    },
    viewport: {
      scale: number;
      voi: { windowCenter: number; windowWidth: number };
    },
  ) {
    const imageLabel = document.getElementById(`previewImage-${index}`);
    const positionLabel = document.getElementById(`previewPosition-${index}`);
    const wwWcLabel = document.getElementById(`previewWwwc-${index}`);
    const zoomLabel = document.getElementById(`previewZoom-${index}`);
    const position =
      image &&
      image.data &&
      image.data.string("x00200032") &&
      image.data.string("x00200032").split("\\")[2];

    if (imageLabel) {
      imageLabel.textContent = `Image : ${assignment.imageIndex + 1}/${assignment.imageCount || 0}`;
    }

    if (positionLabel) {
      positionLabel.textContent = `Position : ${position || "-"}`;
    }

    if (wwWcLabel) {
      wwWcLabel.textContent = `WW/WC:${Math.round(viewport.voi.windowWidth)}/${Math.round(
        viewport.voi.windowCenter,
      )}`;
    }

    if (zoomLabel) {
      zoomLabel.textContent = `Zoom:${viewport.scale.toFixed(2)}x`;
    }
  }

  renderLoadingOverlay() {
    if (!this.state.isViewerLoading) {
      return null;
    }

    return (
      <Box className="viewer-loading">
        <Stack spacing={2.5} alignItems="center" className="viewer-loading-card">
          <CircularProgress color="primary" thickness={4.2} />
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" color="primary.main" gutterBottom align="center">
              Preparing Study
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 2 }}
            >
              TEST case and overlays are loading into the viewer workspace.
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  }

  renderViewportSkeleton(
    index: number,
    assignment: LayoutAssignment | null,
    isActiveTile: boolean,
  ) {
    return (
      <Box className="viewport-skeleton-overlay">
        <Skeleton
          variant="rectangular"
          className="viewport-skeleton-surface"
          animation="wave"
        />
        <Box className="skeleton-overlay-info">
          <div>
            {assignment
              ? `Image : ${assignment.imageIndex + 1}/${assignment.imageCount || 0}`
              : "Image :"}
          </div>
          <div>Position : Loading...</div>
          <div>WW/WC: Loading...</div>
          <div>Zoom: Loading...</div>
        </Box>
        {isActiveTile ? this.renderLoadingOverlay() : null}
      </Box>
    );
  }

  render() {
    const { activeTool, currentSlice, isViewerLoading, layoutHoverPreset, layoutMode, layoutPreset, totalSlices } =
      this.state;
    const preset = this.getLayoutPresetConfig();
    const assignments = this.getLayoutAssignments();
    const activePreset =
      (layoutHoverPreset && this.getLayoutPresetByLabel(layoutHoverPreset)) ||
      this.getLayoutPresetByLabel(layoutPreset);
    const isPrevDisabled = currentSlice <= 0 && getCurrentSeriesIndex() <= 0;
    const isNextDisabled =
      layoutMode === "series"
        ? assignments.filter(Boolean).length < preset.count
        : totalSlices === 0 || currentSlice >= totalSlices - 1;

    return (
      <ThemeProvider theme={viewerTheme}>
        <CssBaseline />
        <Box id="outsideWrapper" className="app-shell">
          <ViewerTopBar activeTool={activeTool} />

          <Box className="workspace-grid">
            <ViewerSidebar
              activePreset={activePreset}
              activeTool={activeTool}
              annotationTools={annotationTools}
              interactiveTools={interactiveTools}
              layoutMode={layoutMode}
              layoutPreset={layoutPreset}
              layoutPresets={layoutPresets}
              onClearActiveTool={() => {
                buttonEvent.deactivateAllTools();
                this.updateCursorForTool(null);
                this.setState({ activeTool: null });
              }}
              onLayoutHoverEnd={this.handleLayoutPresetHoverEnd}
              onLayoutHoverPreset={this.handleLayoutPresetHover}
              onLayoutModeChange={this.handleLayoutModeChange}
              onLayoutPresetChange={this.handleLayoutPresetChange}
              onLoadSample={() => {
                this.setState({ isViewerLoading: true });
                loadBundledSample().catch(() => {
                  this.setState({ isViewerLoading: false });
                  alert("Unable to load the bundled TEST849 sample.");
                });
              }}
              onOpenPatientFolder={(event) => {
                this.setState({ isViewerLoading: true });
                fileLoader(event);
              }}
              onToolActivation={this.handleToolActivation}
              onViewportAction={(action) => {
                action();
                this.setState((previousState) => ({ ...previousState }));
              }}
              viewportActions={viewportActions}
            />

            <Box className="viewer-column">
              <PatientSummaryPanel />
              <ViewerWorkspace
                assignments={assignments}
                currentSlice={currentSlice}
                isNextDisabled={isNextDisabled}
                isPrevDisabled={isPrevDisabled}
                isViewerLoading={isViewerLoading}
                layoutMode={layoutMode}
                layoutPreset={layoutPreset}
                onNextPage={() => this.handleLayoutStep(1)}
                onPrevPage={() => this.handleLayoutStep(-1)}
                onViewportSelection={this.handleViewportSelection}
                onViewportWheel={this.handleViewportWheel}
                preset={preset}
                renderLoadingOverlay={this.renderLoadingOverlay.bind(this)}
                renderViewportSkeleton={this.renderViewportSkeleton.bind(this)}
                totalSlices={totalSlices}
              />
            </Box>

            <OverlaySidebar />
          </Box>
        </Box>
      </ThemeProvider>
    );
  }
}

export default MainUIElements;
