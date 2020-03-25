import React from "react";
import "react-select2-wrapper/css/select2.css";

import StudentTargetSelector from "./StudentTargetSelector.js";
import UploadTargets from "./UploadTargets.js";
import AssignmentDetails from "./AssignmentDetails.js";
import { Dropdown, Row, Col } from "react-bootstrap";

export default function StaffView({ students, onSubmit }) {
    if (window.location.toString().includes("histogram")) {
        return <AssignmentDetails assignment="Labs" onLogin={onSubmit} />;
    }
    return (
        <div>
            <Row>
                <Col md="10">
                    <StudentTargetSelector students={students} onSubmit={onSubmit} />
                </Col>
                <Col style={{ display: 'flex', alignItems: 'center' }}>
                    <a className="btn btn-success text-white" href="/histogram"> View Histogram </a>
                </Col>
            </Row>
            <UploadTargets />
        </div>
    );
}
