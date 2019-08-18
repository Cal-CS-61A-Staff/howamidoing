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
        if (this.props.booleanValued) {
            return (
                <div className="custom-control custom-checkbox">
                    <input
                        type="checkbox"
                        checked={!!this.props.value}
                        className="custom-control-input"
                        onClick={this.handleClick}
                        onChange={e => !this.props.readOnly
                                && this.props.onChange(e.target.checked ? 1 : 0)
                        }
                        readOnly={this.props.readOnly}
                        id={this.props.name}
                    />
                    <label className="custom-control-label" htmlFor={this.props.name} />
                </div>
            );
        } else {
            return (
                <input
                    className="ScoreEntry"
                    type="number"
                    value={valid(this.props.value) ? this.props.value : ""}
                    placeholder={valid(this.props.placeholder) ? this.props.placeholder : ""}
                    min="0"
                    step="0.1"
                    onClick={this.handleClick}
                    onChange={e => this.props.onChange(e.target.value)}
                    readOnly={this.props.readOnly}
                />
            );
        }
    }
}
