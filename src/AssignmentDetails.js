import React, { useState, useEffect, useMemo } from "react";
import $ from "jquery";
import _ from "lodash";

import {
    Histogram, BarSeries, withParentSize, XAxis, YAxis,
} from "@data-ui/histogram";
import { Dropdown, Row, Col } from "react-bootstrap";
import { Slider } from '@material-ui/core';

import BinSelectors from "./BinSelectors.js";
import StudentTable from "./StudentTable.js";

import { getAssignmentLookup, getAssignments } from "./loadAssignments.js";
import computeTotals from "./computeTotals.js";

const ResponsiveHistogram = withParentSize(({ parentWidth, parentHeight, ...rest }) => (
    <Histogram
        width={parentWidth}
        height={parentHeight}
        {...rest}
    />
));

const extend = (scores, lookup) => {
    const out = JSON.parse(JSON.stringify(scores));
    for (const key of Object.keys(lookup)) {
        if (out[key] === undefined) {
            out[key] = NaN;
        }
    }
    return out;
}

const extractAssignmentData = (arr, index, TA, TAs, rangeMin, rangeMax) => (
    arr.map(scores => scores[index]).filter((score, i) =>
        (TA === "All" || TAs[i] === TA) && score <= rangeMax && score >= rangeMin)
);

const addAssignmentTotals = (data, assignments, topics) => {
    data = JSON.parse(JSON.stringify(data));
    for (let student = 0; student < data.length; ++student) {
        let scores = {}
        const header = data[student]
        for (const title in header) {
            if (assignments[title]) {
                scores[title] = header[title];
            }
        }
        scores = extend(scores, assignments)
        const totals = computeTotals(topics, scores, false);
        for (const assignment in totals) {
            header[assignment] = totals[assignment]
        }
    }
    return data;
}

const updateBins = (value, setRangeMin, setRangeMax) => {
    setRangeMin(value[0])
    setRangeMax(value[1])
}

export default function AssignmentDetails({ onLogin }) {
    const [data, setData] = useState([])
    const [assignmentIndex, setAssignmentIndex] = useState(0);
    const [header, setHeader] = useState([]);

    useEffect(() => {
        $.post("/allScores").done(({ header, scores }) => {
            setHeader(header);
            setData(scores.map(x => Object.fromEntries(x.map((v, i) => [header[i], v]))));
        });
    }, []);
    window.setSchema(header, []);

    const assignments = getAssignmentLookup();
    const topics = getAssignments();
    const assignmentNames = Object.keys(assignments);

    const [currentAssignmentName, setCurrentAssignmentName] = useState(assignmentNames[0]);
    const [assignment, setAssignment] = useState(assignments[currentAssignmentName]);

    const assignmentScores = useMemo(() => (data.map(
        student => assignmentNames
            .map(assignmentName => student[assignmentName] || 0)
            .map(x => Number.parseFloat(x)),
    )), [data, assignmentNames]);

    useEffect(() => {
        setData(addAssignmentTotals(data, assignments, topics));
        setAssignment(assignments[currentAssignmentName])
    }, [data.length === 0]);

    const maxScore = assignment.maxScore || 0;
    const binSize = maxScore / 4;
    const defaultBins = [0, 1, 2, 3, 4, 5];
    const bins = assignment.maxScore && assignment.maxScore !== Infinity ? _.range(0, maxScore + 0.01, binSize) : defaultBins;

    const [toggled, setToggled] = useState(bins.map(() => false));
    const [rangeMin, setRangeMin] = useState(0)
    const [rangeMax, setRangeMax] = useState(bins[bins.length - 1])

    useEffect(() => {
        setRangeMax(bins[bins.length - 1])
    }, [bins === defaultBins])
    const handleToggle = (i) => {
        toggled[i] = !toggled[i];
        setToggled(toggled.slice());
    };

    const TAs = data
        .map(x => x.TA);
    const TANames = Array.from(new Set(TAs));
    const [TA, setTA] = useState("All");
    const students = data
        .map((x, student) => ({
            ...x, Score: assignmentScores[student][assignmentIndex],
        }))
        .filter((student) => (student.Score >= rangeMin && student.Score <= rangeMax && (TA === 'All' || student.TA === TA)));

    const contents = (
        <>
            <div style={{ height: "40vh" }}>
                {students.length === 0 ||
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
                            rawData={extractAssignmentData(assignmentScores, assignmentIndex, TA, TAs, rangeMin, rangeMax)}
                        />
                        <XAxis />
                        <YAxis />
                    </ResponsiveHistogram>
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
                                    <Dropdown.Item onClick={() => {
                                        setAssignmentIndex(index);
                                        setCurrentAssignmentName(assignmentName);
                                        setAssignment(assignments[assignmentName]);
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
                                    <Dropdown.Item onClick={() => {
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
                        defaultValue={[0, bins[bins.length - 1 || 0]]}
                        valueLabelDisplay="auto"
                        onChange={(_, values) => updateBins(values, setRangeMin, setRangeMax)}
                    />
                </Col>
            </Row>
            <BinSelectors bins={bins} toggled={toggled} onToggle={handleToggle} />
            <StudentTable students={students} onLogin={onLogin} />
        </>
    );

    return data.length ? contents : <div>Loading...</div>;
}
