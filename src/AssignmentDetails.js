import React, { useState, useEffect, useMemo } from "react";
import {
    Histogram, BarSeries, withParentSize, XAxis, YAxis,
} from "@data-ui/histogram";
import $ from "jquery";
import BinSelectors from "./BinSelectors.js";
import StudentTable from "./StudentTable.js";

const ResponsiveHistogram = withParentSize(({ parentWidth, parentHeight, ...rest }) => (
    <Histogram
        width={parentWidth}
        height={parentHeight}
        {...rest}
    />
));

export default function AssignmentDetails({ onLogin }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        $.post("/allScores").done(({ header, scores }) => {
            setData(scores.map(x => Object.fromEntries(x.map((v, i) => [header[i], v]))));
        });
    }, []);

    const labs = [
        "Imaging 1", "Imaging 2", "Imaging 3", "Touchscreen 1", "Touchscreen 2",
        "Touchscreen 3A", "Touchscreen 3B", "APS 1", "APS 2"];

    const assignmentScores = useMemo(() => (data.map(
        student => labs
            .map(lab => student[lab] || 0)
            .map(x => Number.parseInt(x, 10))
            .reduce((x, y) => x + y),
    )), [data, labs]);


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

    const contents = (
        <>
            <div style={{ height: "40vh" }}>
                <ResponsiveHistogram
                    ariaLabel="Lab score histogram"
                    orientation="vertical"
                    cumulative={false}
                    normalized
                    valueAccessor={datum => datum}
                    binType="categorical"
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
                        rawData={assignmentScores}
                    />
                    <XAxis />
                    <YAxis />
                </ResponsiveHistogram>
            </div>
            <BinSelectors bins={bins} toggled={toggled} onToggle={handleToggle} />
            <StudentTable students={students} onLogin={onLogin} />
        </>
    );

    return data.length ? contents : <div>Loading...</div>;
}
