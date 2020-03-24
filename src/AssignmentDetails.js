import React, { useState, useEffect, useMemo } from "react";
import {
    Histogram, BarSeries, withParentSize, XAxis, YAxis,
} from "@data-ui/histogram";
import $ from "jquery";
import BinSelectors from "./BinSelectors.js";
import StudentTable from "./StudentTable.js";
import Dropdown from 'react-bootstrap/Dropdown'
import chunk from 'lodash/chunk';
import _ from 'lodash';

import { getAssignmentLookup } from './LoadAssignmentsUtil.js';

const ResponsiveHistogram = withParentSize(({ parentWidth, parentHeight, ...rest }) => (
    <Histogram
        width={parentWidth}
        height={parentHeight}
        {...rest}
    />
));

const extractAssignmentData = (arr, index, TA, TAs) => {
    return arr.map(scores => scores[index])
              .filter((item, index) => TA === "All" || TAs[index] === TA)
}

export default function AssignmentDetails({ onLogin }) {
    const [data, setData] = useState([]);
    const [assignmentIndex, setAssignmentIndex] = useState(0)

    useEffect(() => {
        $.post("/allScores").done(({ header, scores }) => {
            setData(scores.map(x => Object.fromEntries(x.map((v, i) => [header[i], v]))));
        });
    }, []);
    const {createAssignments, setSchema} = window
    setSchema([], [])
    const assignments = getAssignmentLookup()
    const assignmentNames = Object.keys(assignments)
                    .filter((name) => !assignments[name].isTopic)

    const [assignmentName, setAssignmentName] = useState(assignmentNames[0])
    const [assignment, setAssignment] = useState(assignments[assignmentName])

    const assignmentScores = useMemo(() => (data.map(
        student => assignmentNames
            .map(assignmentName => student[assignmentName] || 0)
            .map(x => Number.parseInt(x, 10))
    )), [data, assignmentNames]);

    const totalScores = assignmentScores.map((scores) =>
        scores.reduce((x, y) => x + y))

    const bins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    const [toggled, setToggled] = useState(bins.map(() => false));

    const handleToggle = (i) => {
        toggled[i] = !toggled[i];
        setToggled(toggled.slice());
    };

    const students = data
        .map((x, i) => ({
            ...x, Score: assignmentScores[i],
        }))
        .filter(({ Score }) => toggled[Score]);

    const TAs = data
        .map(x => x["TA"])
    const TANames = Array.from(new Set(TAs))
    const [TA, setTA] = useState("All")

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
                    binValues={assignment ? _.range(0, assignment["maxScore"] + 1, assignment["maxScore"]/4): [1,2,3,4,5]}
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
                        rawData={ extractAssignmentData(assignmentScores, assignmentIndex, TA, TAs)}
                    />
                    <XAxis />
                    <YAxis />
                </ResponsiveHistogram>
            </div>
            <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    {assignmentName || "Choose assignment"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {
                        assignmentNames.map((assignmentName, index) =>
                            <Dropdown.Item onClick={() => {
                                setAssignmentIndex(index)
                                setAssignmentName(assignmentName)
                                setAssignment(assignments[assignmentName])
                            }}>
                            {assignmentName} </Dropdown.Item>
                        )
                    }
                </Dropdown.Menu>
            </Dropdown>
            <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    {TA}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {
                        TANames.map((TAName, index) =>
                            <Dropdown.Item onClick={() => {
                                setTA(TAName)
                            }}>
                            {TAName} </Dropdown.Item>
                        )
                    }
                </Dropdown.Menu>
            </Dropdown>
            <BinSelectors bins={bins} toggled={toggled} onToggle={handleToggle} />
            <StudentTable students={students} onLogin={onLogin} />
        </>
    );

    return data.length ? contents : <div>Loading...</div>;
}
