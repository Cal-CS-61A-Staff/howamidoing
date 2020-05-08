import React from "react";
import { Dropdown } from "react-bootstrap";

export default function MyDropdown({ value, children, onChange }) {
    return (
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
    );
}
