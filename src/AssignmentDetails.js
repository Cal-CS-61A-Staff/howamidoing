import React, { useState, useEffect, useMemo } from "react";
import {
    Histogram, BarSeries, withParentSize, XAxis, YAxis,
} from "@data-ui/histogram";
import $ from "jquery";
import BinSelectors from "./BinSelectors.js";
import StudentTable from "./StudentTable.js";
import Dropdown from 'react-bootstrap/Dropdown'

import { getAssignmentLookup } from './LoadAssignmentsUtil.js';

const ResponsiveHistogram = withParentSize(({ parentWidth, parentHeight, ...rest }) => (
    <Histogram
        width={parentWidth}
        height={parentHeight}
        {...rest}
    />
));

const extractAssignmentData = (arr, index) => {
    return arr.map(scores => scores[index])
}

export default function AssignmentDetails({ onLogin }) {
    const [data, setData] = useState([]);
    const [currentAssignment, setAssignment] = useState(0)

    useEffect(() => {
        $.post("/allScores").done(({ header, scores }) => {
            setData(scores.map(x => Object.fromEntries(x.map((v, i) => [header[i], v]))));
        });
    }, []);
    console.log("data", data)
    let assignments = ["Homework 1", "Homework 2"];
    const {createAssignments, setSchema} = window
    setSchema([], [])
    console.log("getAssignmentLookup returns ", getAssignmentLookup())
    const lookup = getAssignmentLookup()
    assignments = Object.keys(lookup)
                    .filter((name) => !lookup[name].isTopic)
    console.log(assignments)
    const ASSIGNMENTS = createAssignments()
    for (const assignment of ASSIGNMENTS) {
        console.log(assignment)
    }

    const assignmentScores = useMemo(() => (data.map(
        student => assignments
            .map(assignment => student[assignment] || 0)
            .map(x => Number.parseInt(x, 10))
    )), [data, assignments]);
    console.log("asssn scores ", " hello?")
    console.log(assignmentScores)

    const totalScores = assignmentScores.map((assignments) =>
        assignments.reduce((x, y) => x + y))

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
    console.log("students ", students)
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
                        rawData={!assignmentScores || extractAssignmentData(assignmentScores, currentAssignment)}
                    />
                    <XAxis />
                    <YAxis />
                </ResponsiveHistogram>
            </div>
            <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    Choose assignment
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {
                        assignments.map((assignment, i) =>
                            <Dropdown.Item onClick={() => setAssignment(i)}> {assignment} </Dropdown.Item>
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
