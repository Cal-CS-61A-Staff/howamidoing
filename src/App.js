import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./App.css";
import { GradeTable } from "./GradeTable.js";

function App() {
    return (
        <div className="App container">
            <div className="row">
                <div className="col">
                    <br />
                    <h1 className="display-4">61A Grades</h1>
                    <GradeTable
                        assignments={[{ name: "cat", score: "1 milllllion dollars" }]}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
