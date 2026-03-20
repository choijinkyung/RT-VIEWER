import React from "react";

class Controlled extends React.Component {
    render() {
        return (
            <div
                id="dicomImage"
                className="viewportElement"
                ref={(input) => {
                    this.element = input;
                }}
            >
                <canvas id="myCanvas" className="canvas" width={512} height={512} />
            </div>
        );
    }
}

export default Controlled;
