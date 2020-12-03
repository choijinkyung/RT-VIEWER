import React from "react";
import {MapInteractionCSS} from "react-map-interaction";
/**
 * Element Zoom , pan Controlled Class
 * @class
 * @description
 * Performs CT Image, DOSE, and RT STRUCTURE simultaneously with Zoom in, out, and pan.
 * <br>This is open source - react-map-interaction
 *
 * To Install
 * <br> -> npm install react-map-interaction
 *
 * To apply
 *  1. import Controlled from "./mouseControl";
 *  2. Where there is a tag you want, Put <Controled// in place of the tag.
 *  3. Then, put the tag in the Controlled class.
 *
 * @example
 * //How to use?
 * //In Controlled Class
 *     render() {
        return (
            <MapInteractionCSS
                value={this.state.value}
                onChange={(value) => this.setState({value})}>
                // Put the tag you want to apply here.
            </MapInteractionCSS>
        );
    }
 *
 * @author Choi jin kyung
 */
class Controlled extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: {
                scale: 1,
                translation: {x: 0, y: 0}
            }
        };
    }

    render() {
        return (
            <MapInteractionCSS
                value={this.state.value}
                onChange={(value) => this.setState({value})}
            >
                <div id="dicomImage" className="viewportElement"
                     ref={input => {
                         this.element = input;
                     }}>
                    <canvas id="myCanvas" className={"canvas"} width={512} height={512}/>
                </div>
            </MapInteractionCSS>
        );
    }
}

export default Controlled
