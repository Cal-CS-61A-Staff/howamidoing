import React from "react";
import FinalNeededScoreTable from "./FinalNeededScoreTable.js";

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
                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={props.onSetCourseworkToMax}
                        >
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

    if (!participation) {
        const needed = [];

        for (const bin of BINS) {
            needed.push(Math.max(0, bin - totalNonFinal));
            if (needed[needed.length - 1] === 0) {
                break;
            }
        }

        return (
            <>
                <div className="card">
                    <h5 className="card-header">Grade Planning</h5>
                    <div className="card-body">
                        <FinalNeededScoreTable
                            grades={GRADES}
                            needed={needed}
                        />
                        <p className="card-text">
                            To take exam recovery points into account, specify
                            an estimate of your participation credits. Or click the button to set
                            them all to the maximum!
                        </p>
                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={props.onSetParticipationToMax}
                        >
                            Set all unknown participation credits to maximum
                        </button>
                    </div>
                </div>
                <br />
            </>
        );
    } else {
        const recoveredMidtermPoints = examRecovery(Midterm, participation, 60, 20);
        const thresholdLookup = {};
        for (let rawFinalScore = 300; rawFinalScore >= 0; --rawFinalScore) {
            const recoveredFinalPoints = examRecovery(rawFinalScore, participation, 80, 20);
            const grade = getGrade(
                totalNonFinal + recoveredMidtermPoints + rawFinalScore + recoveredFinalPoints,
                BINS,
                GRADES,
            );
            thresholdLookup[grade] = rawFinalScore;
        }
        const needed = [];
        for (const grade of GRADES) {
            if (thresholdLookup[grade] !== undefined) {
                needed.push(thresholdLookup[grade]);
            }
        }
        return (
            <>
                <div className="card">
                    <h5 className="card-header">Grade Planning</h5>
                    <div className="card-body">
                        <FinalNeededScoreTable
                            grades={GRADES}
                            needed={needed}
                        />
                    </div>
                </div>
                <br />
            </>
        );
    }
}

function examRecovery(examScore, participation, maxExamScore, recoveryCap) {
    const halfScore = maxExamScore / 2;
    const maxRecovery = Math.max(0, (halfScore - examScore) / 2);
    const recoveryRatio = Math.min(participation, recoveryCap) / recoveryCap;
    return maxRecovery * recoveryRatio;
}

function getGrade(score, bins, grades) {
    for (let i = 0; i !== bins.length; ++i) {
        if (score >= bins[i]) {
            return grades[i];
        }
    }
    return "F";
}
