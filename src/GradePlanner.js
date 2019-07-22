import React from "react";

const BINS = [294, 283, 270, 255, 230, 215, 200, 190, 180, 175, 170, 165, 0];
const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];

export default function GradePlanner(props) {
    const { Homework, Projects, Lab } = props.data;
    if (!(Homework && Projects && Lab)) {
        return (
            <>
                <div className="card">
                    <h5 className="card-header">Grade Planning</h5>
                    <div className="card-body">
                        <h5 className="card-title">Insufficient Data</h5>
                        <p className="card-text">
                            You need to specify your expected homework, project,
                            and lab scores in the below table to enable grade planning.
                        </p>
                        <p>
                            Or click the button to set them all to the maximum (including extra
                            credit)!
                        </p>
                        <button className="btn btn-primary" type="button">
                            Set all unknown non-exam scores to maximum
                        </button>
                    </div>
                </div>
                <br />
            </>
        );
    }

    const { Midterm } = props.data;
    const participation = props.data["Participation Credits"];

    const totalNonFinal = Midterm + Homework + Projects + Lab;
    const needed = [];

    for (const bin of BINS) {
        needed.push(Math.max(0, bin - totalNonFinal));
        if (needed[needed.length - 1] === 0) {
            break;
        }
    }

    const gradeWithoutFinal = GRADES[needed.length - 1];

    if (!participation) {
        return (
            <>
                <div className="card">
                    <h5 className="card-header">Grade Planning</h5>
                    <div className="card-body">
                        <h5 className="card-title">Grade Forecast:</h5>
                        <p className="card-text">
                            If you skip the final, you will receive a {gradeWithoutFinal}.

                            To take exam recovery points into account, specify
                            an estimate of your participation credits. Or click the button to set
                            them all to the maximum!
                        </p>
                        <button className="btn btn-primary" type="button">
                            Set all unknown participation credits to maximum
                        </button>
                    </div>
                </div>
                <br />
            </>
        );
    } else {
        return (
            <>
                <div className="card">
                    <h5 className="card-header">Grade Planning</h5>
                    <div className="card-body">
                        <h5 className="card-title">Grade Forecast:</h5>
                        <p className="card-text">
                            If you skip the final, you will receive a(n)
                            {" "}
                            {gradeWithoutFinal}
                            .
                        </p>
                    </div>
                </div>
                <br />
            </>
        );
    }
}
