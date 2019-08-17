import React from "react";
import logo from "./ok-logo.svg";

export default function LoginButton() {
    return (
        <button className="mt-3 btn btn-lg btn-warning btn-block" type="button">
Logged in with
            {" "}
            <img
                src={logo}
                alt="Logged in with OK"
                style={{ height: "1.5em", width: "1.5em" }}
            />
        </button>
    );
}
