/* eslint-disable no-param-reassign,dot-notation */
import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

import $ from "jquery";

import StudentView from "./StudentView.js";
import StaffView from "./StaffView.js";
import ExplanationModal from "./ExplanationModal.js";
import LoginButton from "./LoginButton.js";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isStaff: false,
            email: null,
            name: null,
            SID: null,
            students: [],
            success: false,
            data: null,
        };
        this.explanationModalRef = React.createRef();
    }

    componentDidMount() {
        return this.reloadData();
    }

    reloadData = async (target) => {
        const {
            success, retry, header, data, isStaff, allStudents, email, name, SID,
        } = await $.get("./query/", { target });
        if (!success && retry) {
            this.refresh();
        }

        if (isStaff) {
            this.setState({
                students: allStudents.map(({ Name, Email, SID }) => ({ text: `${Name} - ${Email} (${SID})`, id: Email })),
            });
        }

        this.setState({
            success,
            email,
            name,
            SID,
            data: { header, data },
            isStaff,
        });
    };

    refresh = () => {
        window.location.replace("./login");
    };

    handleExplanationClick = () => {
        if (window.EXPLANATION_IS_LINK) {
            window.open(window.EXPLANATION, "__blank");
        } else {
            $(this.explanationModalRef.current).modal();
        }
    };

    render() {
        const contents = !this.state.success
            ? <LoginButton onClick={this.refresh} />
            : this.state.isStaff
                ? <StaffView onSubmit={this.reloadData} students={this.state.students} />
                : <StudentView {...this.state.data} />;

        return (
            <>
                <div className="App container">
                    <div className="row">
                        <div className="col">
                            <br />
                            <h1 className="display-4">
                                <strong>{window.COURSE_CODE}</strong>
                                {" "}
                            Status Check
                                <span className="badge badge-danger warningBadge">Beta</span>
                            </h1>
                        </div>
                        <div className="col-auto">
                            <br />
                            <p className="text-right">
                                Logged in as
                                {" "}
                                {this.state.name}
                                {" ("}
                                {this.state.email}
                                {")."}
                                <br />
                                {this.state.SID && `SID: ${this.state.SID}`}
                                {this.state.SID && <br />}
                                <a href="#" onClick={this.handleExplanationClick}>Grade Explanation</a>
                            </p>
                        </div>
                    </div>
                    {" "}
                    <div className="row">
                        <div className="col">
                            {contents}
                        </div>
                    </div>
                </div>
                <ExplanationModal ref={this.explanationModalRef} />
            </>
        );
    }
}

export default App;
