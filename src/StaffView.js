import React from "react";
import "react-select2-wrapper/css/select2.css";

import StudentTargetSelector from "./StudentTargetSelector.js";
import UploadTargets from "./UploadTargets.js";

export default function StaffView({ students, onSubmit }) {
    return (
        <div>
            <StudentTargetSelector students={students} onSubmit={onSubmit} />
            <UploadTargets />
        </div>
    );
}
