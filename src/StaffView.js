import React, { useState } from "react";
import Select2 from "react-select2-wrapper";
import "react-select2-wrapper/css/select2.css";

import $ from "jquery";

export default function StaffView({ students, handleSubmit }) {
    const [selected, setSelected] = useState(null);

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(selected);
        }}
        >
            <div className="form-group">
                <label htmlFor="inputEmail">Enter target student email address</label>
                <br />
                <Select2
                    style={{ width: "100%" }}
                    value={selected}
                    onSelect={x => setSelected($(x.target).val())}
                    data={students}
                />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
        </form>
    );
}
