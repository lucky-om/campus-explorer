/**
 * Navigation Utilities
 */

export function generateInstructions(path) {
    if (!path || path.length < 2) return ["You are at your destination."];

    const instructions = [];
    let currentFloor = path[0].floor;

    for (let i = 0; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];

        if (next.floor !== currentFloor) {
            instructions.push(`Go to the ${next.floor === 0 ? 'Ground' : next.floor + (next.floor === 1 ? 'st' : next.floor === 2 ? 'nd' : 'rd')} Floor via ${current.type === 'stairs' ? 'stairs' : 'elevator'}.`);
            currentFloor = next.floor;
            continue;
        }

        if (i === 0) {
            instructions.push(`Start walking from ${current.label} towards ${next.label}.`);
        } else {
            // Basic direction logic based on angles
            const prev = path[i - 1];
            const angle1 = Math.atan2(current.y - prev.y, current.x - prev.x);
            const angle2 = Math.atan2(next.y - current.y, next.x - current.x);
            let diff = (angle2 - angle1) * (180 / Math.PI);

            while (diff < -180) diff += 360;
            while (diff > 180) diff -= 360;

            if (Math.abs(diff) < 20) {
                // instructions.push(`Continue straight towards ${next.label}.`);
            } else if (diff > 20 && diff < 160) {
                instructions.push(`Turn right towards ${next.label}.`);
            } else if (diff < -20 && diff > -160) {
                instructions.push(`Turn left towards ${next.label}.`);
            } else {
                instructions.push(`Turn around towards ${next.label}.`);
            }
        }
    }

    instructions.push(`You have reached ${path[path.length - 1].label}.`);

    // Deduplicate and clean up
    return instructions.filter((v, i, a) => a.indexOf(v) === i);
}

export function calculateDistance(path) {
    let dist = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const dx = path[i + 1].x - path[i].x;
        const dy = path[i + 1].y - path[i].y;
        dist += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.round(dist / 10); // Scale 10px = 1m
}
