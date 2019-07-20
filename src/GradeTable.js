/* eslint-disable react/no-array-index-key */
import React from "react";
import { Row } from "./Row.js";

export function GradeTable(props) {
    const headerElems = ["Assignment", "Points"];
    const header = headerElems.map((elem, index) => <th scope="col" key={index}>{elem}</th>);

    const rows = props.assignments.map((elem, index) => (
        <Row
            name={elem.name}
            score={elem.score}
            key={index}
        />
    ));

    return (
        <table className="table">
            { header }
            { rows }
        </table>
    );
}
