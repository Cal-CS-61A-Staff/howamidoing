import React, { useState, useEffect, useMemo } from "react";
import $ from "jquery";
import _ from "lodash";

import {
    Histogram, BarSeries, withParentSize, XAxis, YAxis,
} from "@data-ui/histogram";
import { Dropdown, Row, Col } from "react-bootstrap";
import { Slider } from "@material-ui/core";

import StudentTable from "./StudentTable.js";

import { getAssignmentLookup, getAssignments } from "./loadAssignments.js";
import { extend } from "./StudentView";
import computeTotals from "./computeTotals.js";

const ResponsiveHistogram = withParentSize(({ parentWidth, parentHeight, ...rest }) => (
    <Histogram
        width={parentWidth}
        height={parentHeight}
        {...rest}
    />
));

const showScore = (score, rangeMin, rangeMax, TAToShow, TA) => (TAToShow === "All" || TAToShow === TA) && score <= rangeMax && score >= rangeMin;

const extractAssignmentData = (arr, index, TA, TAs, rangeMin, rangeMax) => (
    arr.map(scores => scores[index]).filter(
        (score, i) => showScore(score, rangeMin, rangeMax, TA, TAs[i]),
    )
);

// note: mutates data
const addAssignmentTotals = (data, assignments, topics) => {
    for (let student = 0; student < data.length; ++student) {
        let scores = {};
        const header = data[student];
        for (const title of Object.keys(header)) {
            if (assignments[title]) {
                scores[title] = header[title];
            }
        }
        scores = extend(scores, assignments);
        const totals = computeTotals(topics, scores, false);
        for (const assignment of Object.keys(totals)) {
            header[assignment] = totals[assignment];
        }
    }
    return data;
};

const updateBins = (value, setRangeMin, setRangeMax) => {
    setRangeMin(value[0]);
    setRangeMax(value[1]);
};

export default function AssignmentDetails({ onLogin }) {
    const [data, setData] = useState([]);
    const [assignmentIndex, setAssignmentIndex] = useState(0);

    window.setSchema([], []);

    const assignments = getAssignmentLookup();

    useEffect(() => {
        $.post("/allScores").done(({ header: newHeader, scores }) => {
            window.setSchema(newHeader, []);
            const assignmentData = (
                scores.map(x => Object.fromEntries(x.map((v, i) => [newHeader[i], v])))
            );
            const newData = addAssignmentTotals(
                assignmentData, getAssignmentLookup(), getAssignments()
            );
            setData(newData);
        });
    }, []);

    const assignmentNames = Object.keys(assignments);

    const [currentAssignmentName, setCurrentAssignmentName] = useState(assignmentNames[0]);
    const assignment = assignments[currentAssignmentName];

    const assignmentScores = useMemo(() => (data.map(
        student => assignmentNames
            .map(assignmentName => student[assignmentName] || 0)
            .map(x => Number.parseFloat(x)),
    )), [data, assignmentNames]);

    const maxScore = assignment.maxScore || 0;
    const binSize = maxScore / 4;
    const defaultBins = [0, 1, 2, 3, 4, 5];
    const bins = (assignment.maxScore && assignment.maxScore !== Infinity)
        ? _.range(0, maxScore + 0.01, binSize) : defaultBins;

    const [rangeMin, setRangeMin] = useState(0);
    const [rangeMax, setRangeMax] = useState(bins[bins.length - 1]);

    useEffect(() => {
        setRangeMax(bins[bins.length - 1]);
    }, [bins, defaultBins]);

    const TAs = data.map(x => x.TA);
    TAs.push("All");
    const TANames = Array.from(new Set(TAs));
    const [TA, setTA] = useState("All");
    const students = data
        .map((x, student) => ({
            ...x, Score: assignmentScores[student][assignmentIndex],
        }))
        .filter(student => showScore(student.Score, rangeMin, rangeMax, TA, student.TA));

    const contents = (
        <>
            <div style={{ height: "40vh" }}>
                {students.length === 0
                    || (
                        <ResponsiveHistogram
                            ariaLabel="Lab score histogram"
                            orientation="vertical"
                            cumulative={false}
                            normalized
                            valueAccessor={datum => datum}
                            binType="numeric"
                            binValues={bins}
                            renderTooltip={({ datum, color }) => (
                                <div>
                                    <strong style={{ color }}>
                                        {datum.bin0}
                                        {" "}
                                    to
                                        {" "}
                                        {datum.bin1}
                                    </strong>
                                    <div>
                                        <strong>count </strong>
                                        {datum.count}
                                    </div>
                                    <div>
                                        <strong>cumulative </strong>
                                        {datum.cumulative}
                                    </div>
                                    <div>
                                        <strong>density </strong>
                                        {datum.density}
                                    </div>
                                </div>
                            )}
                        >
                            <BarSeries
                                animated
                                rawData={extractAssignmentData(
                                    assignmentScores, assignmentIndex, TA, TAs, rangeMin, rangeMax,
                                )}
                            />
                            <XAxis />
                            <YAxis />
                        </ResponsiveHistogram>
                    )
                }
            </div>
            <Row>
                <Col>
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            {currentAssignmentName || "Choose assignment"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {
                                assignmentNames.map((assignmentName, index) => (
                                    <Dropdown.Item
                                        key={assignmentName}
                                        onClick={() => {
                                            setAssignmentIndex(index);
                                            setCurrentAssignmentName(assignmentName);
                                        }}
                                    >
                                        {assignmentName}
                                    </Dropdown.Item>
                                ))
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
                <Col>
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            {TA}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {
                                TANames.map(TAName => (
                                    <Dropdown.Item
                                        key={TAName}
                                        onClick={() => {
                                            setTA(TAName);
                                        }}
                                    >
                                        {TAName}
                                    </Dropdown.Item>
                                ))
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>
            <Row>
                <Col md={3}>
                    <Slider
                        min={0}
                        max={bins[bins.length - 1] || 0}
                        value={[rangeMin, rangeMax]}
                        valueLabelDisplay="auto"
                        onChange={(__, values) => updateBins(values, setRangeMin, setRangeMax)}
                    />
                </Col>
            </Row>
            <StudentTable students={students} onLogin={onLogin} />
        </>
    );

    return data.length ? contents : <div>Loading...</div>;
}
