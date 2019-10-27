import React from "react";
import "react-select2-wrapper/css/select2.css";

import StudentTargetSelector from "./StudentTargetSelector.js";
import UploadTargets from "./UploadTargets.js";
import AssignmentDetails from "./AssignmentDetails.js";

export default function StaffView({ students, onSubmit }) {
    if (window.location.toString().includes("labhistogram")) {
        return <AssignmentDetails assignment="Labs" onLogin={onSubmit} />;
    }
    return (
        <div>
            <StudentTargetSelector students={students} onSubmit={onSubmit} />
            <UploadTargets />
        </div>
    );
}
