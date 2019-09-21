/* eslint-disable no-param-reassign,dot-notation */
import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

import $ from "jquery";

import StudentView from "./StudentView.js";
import StaffView from "./StaffView.js";
import ExplanationModal from "./ExplanationModal.js";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isStaff: false,
            data: null,
        };
        this.explanationModalRef = React.createRef();
    }

    componentDidMount() {
        return this.reloadData();
    }

    reloadData = async (target) => {
        const {
            success, retry, header, data, isStaff,
        } = await $.get("./query/", { target });
        if (!success && retry) {
            this.refresh();
        }

        this.setState({
            data: { success, header, data },
            isStaff,
        });
    };

    handleExplanationClick = () => {
        $(this.explanationModalRef.current).modal();
        console.log(this.explanationModalRef.current);
    };

    render() {
        const contents = this.state.isStaff ? <StaffView handleSubmit={this.reloadData} />
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
                                <a href="#" onClick={this.handleExplanationClick}>Explanation</a>
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
