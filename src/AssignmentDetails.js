import React, { useState, useEffect, useMemo } from "react";
import $ from "jquery";
import _ from "lodash";

import {
    Histogram, BarSeries, withParentSize, XAxis, YAxis,
} from "@data-ui/histogram";
import { Dropdown, Row, Col } from "react-bootstrap";

import BinSelectors from "./BinSelectors.js";
import StudentTable from "./StudentTable.js";

import { getAssignmentLookup } from "./loadAssignments.js";

const ResponsiveHistogram = withParentSize(({ parentWidth, parentHeight, ...rest }) => (
    <Histogram
        width={parentWidth}
        height={parentHeight}
        {...rest}
    />
));

const extractAssignmentData = (arr, index, TA, TAs) => (
    arr.map(scores => scores[index]).filter((score, i) => TA === "All" || TAs[i] === TA)
);

export default function AssignmentDetails({ onLogin }) {
    const [data, setData] = useState([]);
    const [assignmentIndex, setAssignmentIndex] = useState(0);

    useEffect(() => {
        $.post("/allScores").done(({ header, scores }) => {
            setData(scores.map(x => Object.fromEntries(x.map((v, i) => [header[i], v]))));
        });
    }, []);
    window.setSchema([], []);
    const assignments = getAssignmentLookup();
    const assignmentNames = Object.keys(assignments)
        .filter(name => !assignments[name].isTopic);

    const [currentAssignmentName, setCurrentAssignmentName] = useState(assignmentNames[0]);
    const [assignment, setAssignment] = useState(assignments[currentAssignmentName]);

    const assignmentScores = useMemo(() => (data.map(
        student => assignmentNames
            .map(assignmentName => student[assignmentName] || 0)
            .map(x => Number.parseFloat(x)),
    )), [data, assignmentNames]);

    const maxScore = assignment.maxScore || 0;
    const binSize = maxScore / 4;
    const bins = assignment ? _.range(0, maxScore + 0.01, binSize) : [0, 1, 2, 3, 4, 5];

    const [toggled, setToggled] = useState(bins.map(() => false));

    const handleToggle = (i) => {
        toggled[i] = !toggled[i];
        setToggled(toggled.slice());
    };

    const students = data
        .map((x, student) => ({
            ...x, Score: assignmentScores[student][assignmentIndex],
        }))
        .filter(({ Score }) => (binSize ? toggled[Math.floor(Score / binSize)] : false));

    const TAs = data
        .map(x => x.TA);
    const TANames = Array.from(new Set(TAs));
    const [TA, setTA] = useState("All");

    const contents = (
        <>
            <div style={{ height: "40vh" }}>
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
                        rawData={extractAssignmentData(assignmentScores, assignmentIndex, TA, TAs)}
                    />
                    <XAxis />
                    <YAxis />
                </ResponsiveHistogram>
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
            <BinSelectors bins={bins} toggled={toggled} onToggle={handleToggle} />
            <StudentTable students={students} onLogin={onLogin} />
        </>
    );

    return data.length ? contents : <div>Loading...</div>;
}
