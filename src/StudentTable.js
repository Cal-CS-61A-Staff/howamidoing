import React from "react";

export default function StudentTable({ students, onLogin }) {
    const cols = ["Name", "Email", "SID", "Score"];
    const studentRows = students.map(student => (
        <tr>
            {cols.map(x => <td>{student[x]}</td>)}
            <td><button onClick={() => onLogin(student.Email)}>Enter</button></td>
        </tr>
    ));

    return (
        <table className="table table-hover">
            <thead>
                <tr>
                    {cols.map(col => <th scope="col">{col}</th>)}
                    <th>Login As</th>
                </tr>
            </thead>
            <tbody>
                { studentRows }
            </tbody>
        </table>
    );
}
