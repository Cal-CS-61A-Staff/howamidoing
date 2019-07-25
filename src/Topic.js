import React, { Component } from "react";
import Row from "./Row.js";

export default class Topic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: true,
        };
    }

    toggleCollapse = () => {
        this.setState(state => ({ collapsed: !state.collapsed }));
    };

    render() {
        const rows = [];

        const readOnly = false;

        for (const elem of this.props.schema.children) {
            if (!this.props.future && elem.future) {
                continue;
            }
            if (!elem.isTopic) {
                rows.push(
                    <Row
                        name={elem.name}
                        score={this.props.data[elem.name]}
                        plannedScore={this.props.planned[elem.name]}
                        placeholder={this.props.plannedTotals[elem.name]}
                        maxScore={elem.maxScore}
                        future={elem.future}
                        key={rows.length}
                        indent={this.props.indent + 1}
                        collapsed={this.props.collapsed || this.state.collapsed}
                        onChange={this.props.onFutureScoreChange}
                    />,
                );
            } else {
                rows.push(
                    <Topic
                        schema={elem}
                        data={this.props.data}
                        planned={this.props.planned}
                        plannedTotals={this.props.plannedTotals}
                        readOnly={readOnly}
                        key={rows.length}
                        indent={this.props.indent + 1}
                        collapsed={this.props.collapsed || this.state.collapsed}
                        future={this.props.future}
                        onFutureScoreChange={this.props.onFutureScoreChange}
                    />,
                );
            }
        }

        const displayedMaxScore = this.props.future
            ? this.props.schema.futureMaxScore : this.props.schema.maxScore;

        return (
            <>
                <Row
                    name={this.props.schema.name}
                    score={this.props.data[this.props.schema.name]}
                    plannedScore={this.props.planned[this.props.schema.name]}
                    placeholder={this.props.plannedTotals[this.props.schema.name]}
                    readOnly={this.props.readOnly}
                    maxScore={displayedMaxScore}
                    onClick={this.toggleCollapse}
                    indent={this.props.indent}
                    childrenCollapsed={this.state.collapsed}
                    collapsed={this.props.collapsed}
                    onChange={this.props.onFutureScoreChange}
                />
                {rows}
            </>
        );
    }
}
