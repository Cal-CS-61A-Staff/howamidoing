import {
    Always, Assignment, range, Topic,
} from "./elements.js";

const BINS = [300, 279, 270, 252, 225, 204, 195, 186, 174, 171, 165, 159, 0];
const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];

export const COURSE_CODE = "16A";

function labCalculator(labScores) {
    const rawTotalLabScore = labScores.reduce((a, b) => a + b, 0);
    if (Number.isNaN(rawTotalLabScore)) {
        return NaN;
    } else if (rawTotalLabScore === 9) {
        return 45;
    } else if (rawTotalLabScore === 8) {
        return 42;
    } else if (rawTotalLabScore === 7) {
        return 22;
    } else {
        return 0;
    }
}

function hwCalculator(hwScores) {
    const [, readerAdjustedGrade, , resubmissionBonus] = hwScores;
    const totalRawScore = readerAdjustedGrade + resubmissionBonus;
    if (Number.isNaN(totalRawScore)) {
        return NaN;
    } else if (totalRawScore >= 8) {
        return 10;
    } else {
        return totalRawScore;
    }
}

export function createAssignments() {
    return [
        Topic("Raw Score", [
            Topic("Exams", [
                Assignment("Midterm 1", 50),
                Assignment("Midterm 2", 50),
                Assignment("Final", 100),
            ]),
            Topic("Homework", [
                Topic("Raw Homework Scores", [
                    ...range(14).map(i => Topic(`Final Homework ${i} Score`, [
                        Assignment(`Raw Self-Grade (HW ${i})`, 10),
                        Assignment(`Reader Adjusted Self-Grade (HW ${i})`, 10),
                        Assignment(`Resubmitted? (HW ${i})`, 1, 1, true),
                        Assignment(`Resubmission Point Gain (HW ${i})`, 10),
                    ], 10, hwCalculator, true)),
                ]),
                Topic("Reader Adjustment Factor", [
                    Assignment("Raw self-grades for selected problems", 0),
                    Assignment("Adjusted self-grades for selected problems", 0),
                ]),
            ], 35, lst => lst.reduce((a, b) => a + b, 0) / 140 * 35),
            Topic("Labs", [
                ...["Imaging 1", "Imaging 2", "Imaging 3", "Touch 1", "Touch 2", "Touch 3A", "Touch 3B", "APS 1", "APS 2"].map(
                    title => Always(Assignment(`${title}`, 1)),
                ),
            ], 45, labCalculator),
            Topic("Participation", [
                ...range(1, 16).flatMap(
                    i => ["A", "B"].map(
                        letter => Assignment(`Discussion ${i}${letter} (date?)`, 1.25),
                    ),
                ),
            ], 20),
        ]),
    ];
}

export function canDisplayFinalGrades(scores) {
    const {
        Homework, Labs, Participation, "Midterm 1": MT1, "Midterm 2": MT2,
    } = scores;
    return !Number.isNaN(Homework + Labs + Participation + MT1 + MT2);
}

export function computeNeededFinalScore(scores) {
    const {
        Homework, Labs, Participation, "Midterm 1": MT1, "Midterm 2": MT2,
    } = scores;
    const totalNonFinal = Homework + Labs + Participation + MT1 + MT2;
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
