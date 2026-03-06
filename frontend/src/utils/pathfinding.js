/**
 * A* Pathfinding Algorithm
 */

export function findPath(graph, startId, endId) {
    const nodes = graph.nodes;
    const edges = graph.edges;

    const nodeMap = {};
    nodes.forEach(node => {
        nodeMap[node.id] = node;
    });

    const heuristic = (a, b) => {
        // Distance heuristic, including floor difference
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const df = (a.floor - b.floor) * 500; // Multi-floor penalty
        return Math.sqrt(dx * dx + dy * dy + df * df);
    };

    const openSet = [startId];
    const cameFrom = {};

    const gScore = {};
    const fScore = {};

    nodes.forEach(node => {
        gScore[node.id] = Infinity;
        fScore[node.id] = Infinity;
    });

    gScore[startId] = 0;
    fScore[startId] = heuristic(nodeMap[startId], nodeMap[endId]);

    while (openSet.length > 0) {
        // Find node in openSet with lowest fScore
        let currentId = openSet[0];
        let minF = fScore[currentId];
        let minIdx = 0;

        for (let i = 1; i < openSet.length; i++) {
            if (fScore[openSet[i]] < minF) {
                minF = fScore[openSet[i]];
                currentId = openSet[i];
                minIdx = i;
            }
        }

        if (currentId === endId) {
            // Reconstruct path
            const path = [];
            let temp = currentId;
            while (temp in cameFrom) {
                path.push(nodeMap[temp]);
                temp = cameFrom[temp];
            }
            path.push(nodeMap[startId]);
            return path.reverse();
        }

        openSet.splice(minIdx, 1);

        // Check neighbors
        const neighbors = edges
            .filter(e => e.from === currentId || e.to === currentId)
            .map(e => (e.from === currentId ? e.to : e.from));

        for (const neighborId of neighbors) {
            const edge = edges.find(
                e => (e.from === currentId && e.to === neighborId) ||
                    (e.to === currentId && e.from === neighborId)
            );

            const tentativeGScore = gScore[currentId] + edge.weight;

            if (tentativeGScore < gScore[neighborId]) {
                cameFrom[neighborId] = currentId;
                gScore[neighborId] = tentativeGScore;
                fScore[neighborId] = tentativeGScore + heuristic(nodeMap[neighborId], nodeMap[endId]);

                if (!openSet.includes(neighborId)) {
                    openSet.push(neighborId);
                }
            }
        }
    }

    return null; // No path found
}
