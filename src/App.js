/* eslint-disable no-param-reassign,dot-notation */
import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./App.css";
import $ from "jquery";
import GradeTable from "./GradeTable.js";
import GradePlanner from "./GradePlanner.js";
import FutureCheckBox from "./FutureCheckBox.js";

function range(a, b) {
    if (!b) {
        b = a;
        a = 0;
    }
    const out = [];
    for (let i = a; i !== b; ++i) {
        out.push(i);
    }
    return out;
}

function Topic(name, children, cappedScore) {
    if (!cappedScore) {
        cappedScore = 1000000000;
    }
    let maxScore = 0;
    for (const child of children) {
        if (!child.future) {
            maxScore += child.maxScore;
        }
    }
    let futureMaxScore = 0;
    for (const child of children) {
        futureMaxScore += child.futureMaxScore;
    }
    maxScore = Math.min(cappedScore, maxScore);
    futureMaxScore = Math.min(cappedScore, futureMaxScore);
    return {
        isTopic: true, name, children, maxScore, futureMaxScore,
    };
}

function Assignment(name, maxScore, weighting) {
    if (!weighting) {
        weighting = 1;
    }
    return {
        isTopic: false, name, maxScore, futureMaxScore: maxScore, weighting,
    };
}

function Future(elem) {
    elem.future = true;
    return elem;
}

const ASSIGNMENTS = [
    Topic("Raw Score", [
        Topic("Exams", [
            Assignment("Midterm", 60),
            Future(Assignment("Final", 80)),
        ]),
        Topic("Homework",
            [
                Assignment("Homework 0 (Total)", 2),
                ...range(1, 2).map(i => Assignment(`Homework ${i} (Total)`, 4)),
                ...range(2, 8).map(i => Future(Assignment(`Homework ${i} (Total)`, 4)))]),
        Topic("Projects", [
            Topic("Hog", [
                Assignment("Hog (Total)", 22),
                Assignment("Hog (Composition)", 2),
                Assignment("Hog Checkpoint (Total)", 1),
            ]),
            Future(Topic("Typing Test", [
                Assignment("Typing Test (Total)", 16),
                Assignment("Typing Test Checkpoint 1 (Total)", 1),
                Assignment("Typing Test Checkpoint 2 (Total)", 1),
                Assignment("Typing Test (Composition)", 2),
                Assignment("Typing Test (Extra Credit)", 1),
            ])),
            Future(Topic("Ants", [
                Assignment("Ants (Total)", 27),
                Assignment("Ants Checkpoint (Total)", 1),
                Assignment("Ants (Composition)", 2),
            ])),
            Future(Topic("Scheme", [
                Assignment("Scheme (Total)", 31),
                Assignment("Scheme Checkpoint 1 (Total)", 1),
                Assignment("Scheme Checkpoint 2 (Total)", 1),
                Assignment("Scheme (Composition)", 2),
            ])),
        ]),
        Topic("Lab", [
            ...range(4).map(i => Assignment(`Lab ${i} (Total)`, 2, 2)),
            ...range(4, 10).map(i => Future(Assignment(`Lab ${i} (Total)`, 2, 2))),
        ]),
    ]),
    Topic("Participation Credits", [
        Topic("Discussion Attendance", [
            ...range(2).map(i => Assignment(`Discussion ${i} (Total)`, 1)),
            ...range(2, 14).map(i => Future(Assignment(`Discussion ${i} (Total)`, 1))),
        ]),
        Topic("Lab Attendance", [
            ...range(14).map(i => Future(Assignment(`Lab Attendance ${i} (Total)`, 1))),
        ]),
    ], 20),
];

const LOOKUP = {};

for (const assignment of ASSIGNMENTS) {
    initializeLookup(assignment);
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
        };
    }

    async componentDidMount() {
        const { success, header, data } = await $.get("./query");
        const scores = {};
        if (success) {
            for (let i = 0; i !== header.length; ++i) {
                if (LOOKUP[header[i]]) {
                    scores[header[i]] = data[i] * LOOKUP[header[i]].weighting;
                }
            }
        } else {
            window.location.replace("./login");
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
        if (!topic.isTopic) {
            if (Number.isNaN(plannedScores[topic.name])) {
                plannedScores[topic.name] = topic.maxScore;
            }
        } else {
            for (const child of topic.children) {
                this.recursivelyMaximize(child, plannedScores);
            }
        }
    };

    handleSetCourseworkToMax = () => {
        this.recursivelyMaximize(LOOKUP["Homework"], this.state.plannedScores);
        this.recursivelyMaximize(LOOKUP["Projects"], this.state.plannedScores);
        this.recursivelyMaximize(LOOKUP["Lab"], this.state.plannedScores);
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
        let out = 0;
        for (const child of curr.children) {
            out += this.computeTotals(child, scores, totals);
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

        return (
            <div className="App container">
                <div className="row">
                    <div className="col">
                        <br />
                        <h1 className="display-4">
                            <strong>61A</strong>
                            {" "}
                            Status Check
                        </h1>
                        <FutureCheckBox
                            onChange={this.handleFutureCheckboxChange}
                            checked={this.state.future}
                        />
                        {/* <LoginButton /> */}
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
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
