const populateLookup = (assignment, lookup) => {
    lookup[assignment.name] = assignment;
    if (assignment.isTopic) {
        for (const child of assignment.children) {
            populateLookup(child, lookup);
        }
    }
}

export const getAssignmentLookup = () => {
    const ASSIGNMENTS = getAssignments();
    const lookup = {};
    for (const assignment of ASSIGNMENTS) {
        populateLookup(assignment, lookup);
    }
    return lookup;
}

export const getAssignments = () => {
	const { createAssignments } = window;
    return createAssignments();
}
