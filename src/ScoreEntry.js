import React, { Component } from "react";
import "./ScoreEntry.css";

function valid(x) {
    return !Number.isNaN(x) && (x !== undefined);
}

export default class ScoreEntry extends Component {
    handleClick = (e) => {
        e.stopPropagation();
    };

    render() {
        return (
            <input
                className="ScoreEntry"
                type="number"
                value={valid(this.props.value) ? this.props.value : ""}
                placeholder={valid(this.props.placeholder) ? this.props.placeholder : ""}
                min="0"
                step="0.1"
                onClick={this.handleClick}
                onChange={this.props.onChange}
                readOnly={this.props.readOnly}
            />
        );
    }
}
