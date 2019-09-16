/* eslint-disable no-param-reassign,dot-notation */
import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

import "./App.css";
import $ from "jquery";

import GradeTable from "./GradeTable.js";
import GradePlanner from "./GradePlanner.js";
import FutureCheckBox from "./FutureCheckBox.js";

import LoginButton from "./LoginButton.js";

let ASSIGNMENTS = [];

let LOOKUP = {};

let setSchema;
let createAssignments;
let COURSE_CODE;

function initialize(header, scores) {
    ({ setSchema, createAssignments, COURSE_CODE } = window);
    setSchema(header, scores);
    ASSIGNMENTS = createAssignments();
    LOOKUP = {};
    for (const assignment of ASSIGNMENTS) {
        initializeLookup(assignment);
    }
}

function initializeLookup(assignment) {
    LOOKUP[assignment.name] = assignment;
    if (assignment.isTopic) {
        for (const child of assignment.children) {
            initializeLookup(child);
        }
    }
}

function extend(scores) {
    const out = JSON.parse(JSON.stringify(scores));
    for (const key of Object.keys(LOOKUP)) {
        if (out[key] === undefined) {
            out[key] = NaN;
        }
    }
    return out;
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            scores: [],
            plannedScores: [],
            future: false,
            success: false,
        };
    }

    async componentDidMount() {
        const {
            success, retry, header, data,
        } = await $.get("./query/");
        const scores = {};
        if (success) {
            this.setState({ success: true });

            initialize(header, data);

            for (let i = 0; i !== header.length; ++i) {
                if (LOOKUP[header[i]]) {
                    scores[header[i]] = data[i];
                }
            }
        } else if (retry) {
            this.refresh();
        }
        this.setState({ scores, plannedScores: extend(scores) });
    }

    handleFutureCheckboxChange = () => {
        this.setState(state => ({ future: !state.future, plannedScores: extend(state.scores) }));
    };

    handleFutureScoreChange = (name, newScore) => {
        this.state.plannedScores[name] = newScore === "" ? NaN : newScore;
        this.forceUpdate(); // sorry!
    };

    recursivelyMaximize = (topic, plannedScores) => {
        if (topic.isTopic) {
            for (const child of topic.children) {
                this.recursivelyMaximize(child, plannedScores);
            }
        } else if (topic.name !== "Final" && Number.isNaN(plannedScores[topic.name])) {
            plannedScores[topic.name] = topic.maxScore;
        }
    };

    refresh = () => {
        window.location.replace("./login");
    };

    handleSetCourseworkToMax = () => {
        for (const assignment of ASSIGNMENTS) {
            this.recursivelyMaximize(assignment, this.state.plannedScores);
        }
        this.forceUpdate();
    };

    handleSetParticipationToMax = () => {
        this.recursivelyMaximize(LOOKUP["Participation Credits"], this.state.plannedScores);
        this.forceUpdate();
    };

    computeTotals(curr, scores, totals) {
        if (curr.future && !this.state.future) {
            return 0;
        }
        if (!curr.isTopic) {
            totals[curr.name] = (scores[curr.name] !== undefined)
                ? Number.parseFloat(scores[curr.name]) : NaN;
            return totals[curr.name];
        }

        const childTotals = [];

        let out = 0;
        for (const child of curr.children) {
            const childTotal = this.computeTotals(child, scores, totals);
            out += childTotal;
            childTotals.push(childTotal);
        }

        if (curr.customCalculator) {
            out = curr.customCalculator(childTotals);
        }

        const limit = this.state.future ? curr.futureMaxScore : curr.maxScore;

        if (limit) {
            out = Math.min(out, limit);
        }

        totals[curr.name] = out;

        if (scores[curr.name] !== undefined
            && !Number.isNaN(Number.parseFloat(scores[curr.name]))) {
            totals[curr.name] = Number.parseFloat(scores[curr.name]);
            return totals[curr.name];
        }

        return out;
    }

    render() {
        const totals = {};
        const plannedTotals = {};

        for (const assignment of ASSIGNMENTS) {
            this.computeTotals(assignment, this.state.scores, totals);
            this.computeTotals(assignment, this.state.plannedScores, plannedTotals);
        }

        const contents = this.state.success
            ? (
                <>
                    <FutureCheckBox
                        onChange={this.handleFutureCheckboxChange}
                        checked={this.state.future}
                    />
                    <br />
                    {this.state.future && (
                        <GradePlanner
                            data={plannedTotals}
                            onSetCourseworkToMax={this.handleSetCourseworkToMax}
                            onSetParticipationToMax={this.handleSetParticipationToMax}
                        />
                    )}
                    <GradeTable
                        schema={ASSIGNMENTS}
                        data={totals}
                        planned={this.state.plannedScores}
                        plannedTotals={plannedTotals}
                        future={this.state.future}
                        onFutureScoreChange={this.handleFutureScoreChange}
                    />
                </>
            )
            : <LoginButton onClick={this.refresh} />;

        return (
            <div className="App container">
                <div className="row">
                    <div className="col">
                        <br />
                        <h1 className="display-4">
                            <strong>{COURSE_CODE}</strong>
                            {" "}
                            Status Check
                        </h1>
                        {contents}
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
