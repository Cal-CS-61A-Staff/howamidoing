import React, { Component } from "react";
import "./ScoreEntry.css";

export default class ScoreEntry extends Component {
    handleClick = (e) => {
        e.stopPropagation();
    };

    render() {
        return (
            <input
                className="ScoreEntry"
                type="number"
                value={Number.isNaN(this.props.value) ? "" : this.props.value}
                min="0"
                step="0.1"
                onClick={this.handleClick}
                onChange={this.props.onChange}
                readOnly={this.props.readOnly}
            />
        );
    }
}
