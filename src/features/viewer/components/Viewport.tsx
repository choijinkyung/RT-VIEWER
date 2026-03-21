import React from "react";

interface ControlledProps {
  canvasId?: string;
  id?: string;
  showOverlayCanvas?: boolean;
}

class Controlled extends React.Component<ControlledProps> {
  private element: HTMLDivElement | null = null;

  render() {
    const {
      canvasId = "myCanvas",
      id = "dicomImage",
      showOverlayCanvas = true,
    } = this.props;

    return (
      <div
        id={id}
        className="viewportElement"
        ref={(input) => {
          this.element = input;
        }}
      >
        {showOverlayCanvas ? (
          <canvas id={canvasId} className="canvas" width={512} height={512} />
        ) : null}
      </div>
    );
  }
}

export default Controlled;
