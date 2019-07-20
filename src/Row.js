import React from "react";

export function Row(props) {
    return (
        <tr>
            <th scope="row">{props.name}</th>
            <td>{props.score}</td>
        </tr>
    );
}
