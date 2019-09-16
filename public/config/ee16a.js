import {
    Always, Assignment, range, Topic,
} from "./elements.js";

const BINS = [300, 279, 270, 252, 225, 204, 195, 186, 174, 171, 165, 159, 0];
const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];

export const COURSE_CODE = "16A";

window.COURSE_CODE = COURSE_CODE;
window.createAssignments = createAssignments;
window.canDisplayFinalGrades = canDisplayFinalGrades;
window.computeNeededFinalScore = computeNeededFinalScore;
window.participationProvided = participationProvided;

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
    const [rawScore, , resubmissionBonus] = hwScores;
    const totalRawScore = rawScore + resubmissionBonus;
    if (Number.isNaN(totalRawScore)) {
        return NaN;
    } else {
        return Math.min(10, totalRawScore / 8 * 10);
    }
}

function getDiscDate(index, offset) {
    const out = new Date(2019, 8, 2);
    out.setDate(out.getDate() + 7 * (index - 1) + offset * 2);
    return out.toLocaleString("en-us", { month: "long", day: "numeric" });
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
                    ...range(15).map(i => Topic(`Final Homework ${i} Score`, [
                        Assignment(`Raw Self-Grade (HW ${i})`, 10),
                        Assignment(`Resubmitted? (HW ${i})`, 1, true),
                        Assignment(`Resubmission Point Gain (HW ${i})`, 10),
                    ], 10, hwCalculator, true)),
                ]),
                Topic("Reader Adjustment Factor", [
                    Assignment("Raw self-grades for selected problems", 0),
                    Assignment("Adjusted self-grades for selected problems", 0),
                ]),
            ], 35, ([raw, factor]) => Math.min(1, raw * (factor || 1) / 140) * 35),
            Topic("Labs", [
                ...["Imaging 1", "Imaging 2", "Imaging 3", "Touch 1", "Touch 2", "Touch 3A", "Touch 3B", "APS 1", "APS 2"].map(
                    title => Always(Assignment(`${title}`, 1, true)),
                ),
            ], 45, labCalculator),
            Topic("Participation",
                range(1, 16)
                    .flatMap(
                        i => ["A", "B"].map(
                            (letter, offset) => Assignment(`Discussion ${i}${letter} (${getDiscDate(i, offset)})`, 1, true),
                        ),
                    )
                    .filter(
                        ({ name }) => !["1A", "13B", "15A", "15B"].includes(name.split(" ")[1]),
                    ), 20,
                scores => scores.reduce((a, b) => a + b) / 16 * 20),
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
        if (neededScore <= 100) {
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
