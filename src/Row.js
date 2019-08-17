import React, { Component } from "react";
import "./Row.css";
import ScoreEntry from "./ScoreEntry.js";

function formatScore(score) {
    return Number.parseFloat(score).toFixed(1);
}

export default class Row extends Component {
    constructor(props) {
        super(props);
        this.nameRef = React.createRef();
        this.scoreRef = React.createRef();
    }

    componentDidMount() {
        if (this.props.collapsed) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.collapsed !== this.props.collapsed) {
            if (this.props.collapsed) {
                this.collapse();
            } else {
                this.expand();
            }
        }
    }

    collapse = () => {
        // $(this.nameRef.current).collapse("hide");
        // $(this.scoreRef.current).collapse("hide");
    };

    expand = () => {
        // $(this.nameRef.current).collapse("show");
        // $(this.scoreRef.current).collapse("show");
    };

    render() {
        let className = "Row";
        if (this.props.collapsed) {
            className += " closed";
        }
        if (this.props.childrenCollapsed !== undefined) {
            className += " pointable";
        }

        const score = Number.isNaN(this.props.score) || this.props.future
            ? (
                <ScoreEntry
                    value={this.props.plannedScore}
                    placeholder={this.props.placeholder}
                    readOnly={this.props.readOnly}
                    onChange={e => this.props.onChange(this.props.name, e.target.value)}
                />
            ) : formatScore(this.props.score);

        const maxScore = this.props.maxScore ? ` / ${formatScore(this.props.maxScore)}` : "";

        return (
            <tr onClick={this.props.onClick} className={className}>
                <td style={{ paddingLeft: 10 + 40 * this.props.indent }}>
                    {this.props.childrenCollapsed !== undefined ? (
                        <button type="button" className="close closeButton" aria-label="Close">
                            <span aria-hidden="true">{this.props.childrenCollapsed ? "+" : "-"}</span>
                        </button>
                    ) : false}

                    <div ref={this.nameRef} className="collapse show">
                        {this.props.name}
                    </div>
                </td>
                <td>
                    <div ref={this.scoreRef} className="collapse show">
                        {score}
                        {maxScore}
                    </div>
                </td>
            </tr>
        );
    }
}
