/* eslint-disable no-param-reassign,dot-notation */
export function range(a, b) {
    if (!b) {
        b = a;
        a = 0;
    }
    const out = [];
    for (let i = a; i !== b; ++i) {
        out.push(i);
    }
    return out;
}

export function Topic(name, children, cappedScore, customCalculator) {
    if (!cappedScore) {
        cappedScore = 1000000000;
    }
    const maxChildScores = [];
    for (const child of children) {
        if (!child.future) {
            maxChildScores.push(child.maxScore);
        }
    }
    const maxFutureChildScores = [];
    for (const child of children) {
        maxFutureChildScores.push(child.futureMaxScore);
    }

    let maxScore;
    let futureMaxScore;

    if (customCalculator) {
        maxScore = Math.min(cappedScore, customCalculator(maxChildScores));
        futureMaxScore = Math.min(cappedScore, customCalculator(maxFutureChildScores));
    } else {
        maxScore = Math.min(cappedScore, maxChildScores.reduce((a, b) => a + b, 0));
        futureMaxScore = Math.min(cappedScore, maxFutureChildScores.reduce((a, b) => a + b, 0));
    }
    return {
        isTopic: true, name, children, maxScore, futureMaxScore, customCalculator,
    };
}

export function Assignment(name, maxScore, weighting) {
    if (!weighting) {
        weighting = 1;
    }
    return {
        isTopic: false, name, maxScore, futureMaxScore: maxScore, weighting,
    };
}

export function Future(elem) {
    elem.future = true;
    return elem;
}
