import React from "react";
import { Dropdown } from "react-bootstrap";

import "./Dropdown.css";

export default function MyDropdown({ value, children, onChange }) {
    return (
        <div className="Dropdown">
            <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    {value || "Choose assignment"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {
                        children.map((assignmentName, index) => (
                            <Dropdown.Item
                                key={assignmentName}
                                onClick={() => {
                                    onChange(index);
                                }}
                            >
                                {assignmentName}
                            </Dropdown.Item>
                        ))
                    }
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}
