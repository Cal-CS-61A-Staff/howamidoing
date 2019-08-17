import {
    Assignment, Future, range, Topic,
} from "./elements.js";

function labCalculator(labScores) {
    const rawTotalLabScore = labScores.reduce((a, b) => a + b);
    if (Number.isNaN(rawTotalLabScore)) {
        return NaN;
    } else if (rawTotalLabScore === 9) {
        return 32;
    } else if (rawTotalLabScore === 8) {
        return 30;
    } else if (rawTotalLabScore === 7) {
        return 16;
    } else {
        return 0;
    }
}

function discCalculator(discScores) {
    const rawTotalDiscScore = discScores.reduce((a, b) => a + b);
    if (Number.isNaN(rawTotalDiscScore)) {
        return NaN;
    } else {
        return Math.min(rawTotalDiscScore / 2, 6);
    }
}

function hwCalculator(hwScores) {
    const [, readerAdjustedGrade, , resubmissionBonus] = hwScores;
    const totalRawScore = readerAdjustedGrade + resubmissionBonus;
    if (Number.isNaN(totalRawScore)) {
        return NaN;
    } else if (totalRawScore >= 8) {
        return 2;
    } else {
        return totalRawScore / 5;
    }
}

const makeHomeworkAssignment = i => Topic(`Final Homework ${i} Score`, [
    Assignment(`Raw Self-Grade (HW ${i})`, 10),
    Assignment(`Reader Adjusted Self-Grade (HW ${i})`, 10),
    Assignment(`Resubmitted? (0 / 1) (HW ${i})`, 1),
    Assignment(`Resubmission Point Gain (HW ${i})`, 10),
], 2, hwCalculator);

export const ASSIGNMENTS = [
    Topic("Raw Score", [
        Future(Topic("Exams", [
            Future(Assignment("Midterm 1", 34)),
            Future(Assignment("Midterm 2", 34)),
            Future(Assignment("Final", 68)),
        ])),
        Topic("Homework", [
            ...range(1).map(makeHomeworkAssignment),
            ...range(1, 13).map(i => Future(makeHomeworkAssignment(i))),
        ]),
        Topic("Labs", [
            ...range(9).map(i => Assignment(`Lab ${i} (lab title?)`, 1)),
        ], 32, labCalculator),
        Topic("Discussion APE", [
            ...range(2).map(i => Assignment(`Discussion ${i} (date?)`, 1)),
            ...range(2, 22).map(i => Future(Assignment(`Discussion ${i} (date?)`, 1))),
        ], 6, discCalculator),

    ]),
];
