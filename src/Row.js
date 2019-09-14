import React from "react";
import "./Row.css";
import ScoreEntry from "./ScoreEntry.js";

function formatScore(score, places = 1) {
    return Number.parseFloat(score).toFixed(Math.max(places, (score.toString().split(".")[1] || "").length));
}

export default function Row(props) {
    let className = "Row";
    if (props.collapsed) {
        className += " closed";
    }
    if (props.childrenCollapsed !== undefined) {
        className += " pointable";
    }

    const score = Number.isNaN(props.score) || props.future || props.booleanValued
        ? (
            <ScoreEntry
                name={props.name}
                value={props.plannedScore}
                placeholder={props.placeholder}
                readOnly={props.readOnly}
                onChange={val => (props.booleanValued ? props.onChange(props.name, val * props.maxScore) : props.onChange(props.name, val))}
                booleanValued={props.booleanValued}
            />
        ) : formatScore(props.score);

    const maxScore = (!props.booleanValued && props.maxScore) ? ` / ${formatScore(props.maxScore)}` : "";

    return (
        <tr onClick={props.onClick} className={className}>
            <td style={{ paddingLeft: 10 + 40 * props.indent }}>
                {props.childrenCollapsed !== undefined ? (
                    <button type="button" className="close closeButton" aria-label="Close">
                        <span aria-hidden="true">{props.childrenCollapsed ? "+" : "-"}</span>
                    </button>
                ) : false}

                <div className="collapse show">
                    {props.name}
                </div>
            </td>
            <td>
                <div className="collapse show">
                    {score}
                    {maxScore}
                </div>
            </td>
        </tr>
    );
}
