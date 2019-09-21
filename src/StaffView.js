import React, { useRef } from "react";

export default function StaffView({ handleSubmit }) {
    const emailInputRef = useRef(null);

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(emailInputRef.current.value);
        }}
        >
            <div className="form-group">
                <label htmlFor="inputEmail">Enter target student email address</label>
                <input
                    ref={emailInputRef}
                    type="email"
                    className="form-control"
                    id="inputEmail"
                    aria-describedby="emailHelp"
                    placeholder="Enter email"
                />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
        </form>
    );
}
