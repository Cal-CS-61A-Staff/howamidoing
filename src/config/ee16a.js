import {
    Always, Assignment, range, Topic,
} from "./elements.js";

const BINS = [194, 180, 170, 160, 150, 140, 130, 120, 100, 0];
const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "F"];

export const COURSE_CODE = "16A";

function labCalculator(labScores) {
    const rawTotalLabScore = labScores.reduce((a, b) => a + b, 0);
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
    const rawTotalDiscScore = discScores.reduce((a, b) => a + b, 0);
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

export function createAssignments() {
    return [
        Topic("Raw Score", [
            Topic("Exams", [
                Assignment("Midterm 1", 34),
                Assignment("Midterm 2", 34),
                Assignment("Final", 68),
            ]),
            Topic("Homework", [
                ...range(13).map(i => makeHomeworkAssignment(i)),
            ]),
            Topic("Labs", [
                ...range(9).map(i => Always(Assignment(`Lab ${i} (lab title?)`, 1))),
            ], 32, labCalculator),
            Topic("Discussion APE", [
                ...range(2).map(i => Assignment(`Discussion ${i} (date?)`, 1)),
                ...range(2, 22).map(i => Assignment(`Discussion ${i} (date?)`, 1)),
            ], 6, discCalculator),
        ]),
    ];
}

export function canDisplayFinalGrades(scores) {
    const {
        Homework, Labs, "Discussion APE": APE, "Midterm 1": MT1, "Midterm 2": MT2,
    } = scores;
    return !Number.isNaN(Homework + Labs + APE + MT1 + MT2);
}

export function computeNeededFinalScore(scores) {
    const {
        Homework, Labs, "Discussion APE": APE, "Midterm 1": MT1, "Midterm 2": MT2,
    } = scores;
    const totalNonFinal = Homework + Labs + APE + MT1 + MT2;
    const needed = [];
    const grades = [];

    for (const [bin, i] of BINS.map((val, index) => [val, index])) {
        const neededScore = Math.max(0, bin - totalNonFinal);
        if (neededScore <= 68) {
            needed.push(neededScore);
            grades.push(GRADES[i]);
        }
        if (neededScore === 0) {
            break;
        }
    }

    return [grades, needed];
}

export function participationProvided() {
    return true;
}
