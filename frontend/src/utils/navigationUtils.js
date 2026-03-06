/**
 * Navigation Utilities – Rich Instructions Engine
 *
 * Generates step-by-step human-readable instructions from a node path.
 * Handles: room → door → corridor hops, floor transitions via stairs,
 * building exits/entries, and direction (left/right/straight).
 */

const FLOOR_NAMES = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'];

function floorName(fi) {
    return FLOOR_NAMES[fi] ?? `Floor ${fi}`;
}

function bearing(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
}

function turnWord(prev, cur, next) {
    const inBearing = bearing(prev, cur);
    const outBearing = bearing(cur, next);
    let diff = outBearing - inBearing;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;
    if (Math.abs(diff) < 30) return 'straight';
    if (diff > 30 && diff < 150) return 'right';
    if (diff < -30 && diff > -150) return 'left';
    return 'around';
}

function straightDistance(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    return Math.round(Math.sqrt(dx * dx + dy * dy) / 10); // 10px = 1m
}

export function generateInstructions(path) {
    if (!path || path.length < 2) return [{ type: 'info', text: 'You are already at your destination.' }];

    const steps = [];
    const start = path[0];
    const end = path[path.length - 1];

    steps.push({ type: 'start', text: `📍 Start at ${start.label || start.id}` });

    for (let i = 0; i < path.length - 1; i++) {
        const prev = path[Math.max(0, i - 1)];
        const cur = path[i];
        const next = path[i + 1];

        // ── Floor transition ──
        if (next.floor !== undefined && cur.floor !== undefined && next.floor !== cur.floor) {
            const direction = next.floor > cur.floor ? '⬆️ Go UP' : '⬇️ Go DOWN';
            steps.push({
                type: 'floor',
                text: `${direction} via stairs to ${floorName(next.floor)}`
            });
            continue;
        }

        // ── Skip door / corridor nodes (intermediate – no instruction needed) ──
        if (cur.type === 'door' || cur.type === 'corridor') continue;

        // ── Room → door transition (entering a corridor) ──
        if (next.type === 'door' || next.type === 'corridor') {
            const dist = straightDistance(cur, next);
            steps.push({
                type: 'walk',
                text: `🚶 Walk from ${cur.label || cur.id}${dist > 2 ? ` (~${dist}m)` : ''} to the corridor`
            });
            continue;
        }

        // ── Stairs reached ──
        if (next.type === 'stairs') {
            steps.push({ type: 'floor', text: `🪜 Continue to ${next.label || 'Stairs / Lift'}` });
            continue;
        }

        // ── Entry/exit transition ──
        if (cur.type === 'entry' && !cur.id.startsWith('ENT-')) {
            steps.push({ type: 'info', text: `🏛️ Enter ${next.label || next.id}` });
            continue;
        }

        // ── Direction change between regular nodes ──
        if (i > 0 && cur.type !== 'entry') {
            const turn = turnWord(prev, cur, next);
            const dist = straightDistance(cur, next);
            if (turn === 'straight') {
                steps.push({ type: 'walk', text: `↗️ Continue straight${dist > 2 ? ` (~${dist}m)` : ''} to ${next.label || next.id}` });
            } else if (turn === 'right') {
                steps.push({ type: 'turn', text: `↪️ Turn right → ${next.label || next.id}` });
            } else if (turn === 'left') {
                steps.push({ type: 'turn', text: `↩️ Turn left → ${next.label || next.id}` });
            } else {
                steps.push({ type: 'turn', text: `↩️ Turn around → ${next.label || next.id}` });
            }
        }
    }

    steps.push({ type: 'arrive', text: `🏁 Arrived at ${end.label || end.id}` });

    // Deduplicate consecutive identical texts
    return steps.filter((s, i, arr) => i === 0 || s.text !== arr[i - 1].text);
}

export function calculateDistance(path) {
    let dist = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const dx = path[i + 1].x - path[i].x;
        const dy = path[i + 1].y - path[i].y;
        dist += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.round(dist / 10); // 10px = 1m (SVG units)
}
