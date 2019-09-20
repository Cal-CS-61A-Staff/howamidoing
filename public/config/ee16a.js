import {
    Always,
    Assignment,
    BooleanValued,
    Hidden,
    LockedChildren,
    NoScore,
    OnlyDefault,
    range,
    sum,
    Topic,
} from "./elements.js";

const BINS = [300, 279, 270, 252, 225, 204, 195, 186, 174, 171, 165, 159, 0];
const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];

export const COURSE_CODE = "16A";

export const WARNING = `Please note that these scores are tentative and serve only as a rough guideline for your performance in the class. Grades listed here do not guarantee that assignment grade or final grade; we reserve the right to change these grades in the event of any mitigating circumstances (e.g., cheating, another violation of course policy, etc.) or errors in grading.
We will also be auditing these grades throughout the course of the semester - the Status Check is in an Alpha version and there will likely be many issues with the grades displayed. <b>Do not count on these grades as fully accurate - again, this is intended to serve as a rough guideline for how you're doing in the class. If you spot a possible issue with any of your grades, please let us know using this form (do NOT email):</b> <a href="https://forms.gle/m7GEAFfnrM1ErckH7">https://forms.gle/m7GEAFfnrM1ErckH7</a>`;

window.COURSE_CODE = COURSE_CODE;
window.createAssignments = createAssignments;
window.canDisplayFinalGrades = canDisplayFinalGrades;
window.computeNeededFinalScore = computeNeededFinalScore;
window.participationProvided = participationProvided;
window.WARNING = WARNING;

function labCalculator(labScores) {
    const rawTotalLabScore = sum(labScores);
    const numLabs = labScores.filter(x => !Number.isNaN(x)).length;
    if (Number.isNaN(rawTotalLabScore)) {
        return NaN;
    } else if (rawTotalLabScore === numLabs) {
        return 45;
    } else if (rawTotalLabScore === numLabs - 1) {
        return 42;
    } else if (rawTotalLabScore === numLabs - 2) {
        return 22;
    } else {
        return 0;
    }
}

function hwCalculator(hwScores) {
    const [rawScore, , resubmissionBonus, factor] = hwScores;
    const totalRawScore = rawScore + resubmissionBonus + factor;
    console.log(hwScores, totalRawScore);
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
                    ...range(15).map(i => LockedChildren(Topic(`Final (Scaled) Homework ${i} Score`, [
                        Assignment(`Raw Self-Grade (HW ${i})`, 10),
                        BooleanValued(Assignment(`Resubmitted? (HW ${i})`, 1)),
                        Assignment(`Resubmission Point Gain (HW ${i})`, 10),
                        OnlyDefault(Always(Hidden(Assignment("Reader Adjustment Factor")))),
                    ], 10, hwCalculator))),
                ]),
                OnlyDefault(Always(Topic("Reader Adjustment Factor", [
                    ...range(15).map(i => LockedChildren(NoScore(Topic(`Homework ${i} Adjustment`, [
                        Assignment(`Reader Grades for Selected Problems (HW ${i})`),
                        Assignment(`Raw Self-Grade for Selected Problems (HW ${i})`),
                        Assignment(`Number of Selected Problems (HW ${i})`),
                    ], null)))),
                ], null))),
            ], 35, ([raw]) => raw / 150 * 35),
            Topic("Labs", [
                ...["Imaging 1", "Imaging 2", "Imaging 3", "Touch 1", "Touch 2", "Touch 3A", "Touch 3B", "APS 1", "APS 2"].map(
                    title => Assignment(`${title}`, 1),
                ),
            ], 45, labCalculator),
            Topic("Participation",
                range(1, 16)
                    .flatMap(
                        i => ["A", "B"].map(
                            (letter, offset) => Assignment(`Discussion ${i}${letter} (${getDiscDate(i, offset)})`, 1.25),
                        ),
                    )
                    .filter(
                        ({ name }) => !["1A", "13B", "15A", "15B"].includes(name.split(" ")[1]),
                    ), 20),
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
