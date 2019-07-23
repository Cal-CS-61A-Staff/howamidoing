import React from "react";

export default function FinalNeededScoreRow(props) {
    if (props.score > 80) {
        return null;
    }
    return (
        <tr>
            <th scope="row">{props.grade}</th>
            <td>{props.score}</td>
        </tr>
    );
}
