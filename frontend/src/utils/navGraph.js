/**
 * Navigation Graph Data Structure
 * Nodes represent locations (rooms, corridors, stairs, elevators).
 * Edges represent walkable paths between nodes.
 */

export const NAV_GRAPHS = {
    block_c: {
        nodes: [
            // GROUND FLOOR (0)
            { id: 'CS-G-C1', x: 100, y: 160, floor: 0, type: 'corridor', label: 'Ground Corridor West' },
            { id: 'CS-G-C2', x: 230, y: 160, floor: 0, type: 'corridor', label: 'Ground Corridor Center' },
            { id: 'CS-G-C3', x: 350, y: 160, floor: 0, type: 'corridor', label: 'Ground Corridor East' },
            { id: 'CS-101', x: 124, y: 148, floor: 0, type: 'room', label: 'Computer Lab 1' },
            { id: 'CS-102', x: 336, y: 148, floor: 0, type: 'room', label: 'Computer Lab 2' },
            { id: 'CS-103', x: 106, y: 172, floor: 0, type: 'room', label: 'Network Lab' },
            { id: 'CS-104', x: 234, y: 172, floor: 0, type: 'room', label: 'Server Room' },
            { id: 'CS-105', x: 320, y: 172, floor: 0, type: 'room', label: 'HOD Office' },
            { id: 'CS-106', x: 404, y: 172, floor: 0, type: 'room', label: 'Reception' },
            { id: 'CS-G-STAIRS', x: 404, y: 262, floor: 0, type: 'stairs', label: 'Ground Stairs' },

            // FIRST FLOOR (1)
            { id: 'CS-1-C1', x: 100, y: 160, floor: 1, type: 'corridor', label: '1F Corridor West' },
            { id: 'CS-1-C2', x: 230, y: 160, floor: 1, type: 'corridor', label: '1F Corridor Center' },
            { id: 'CS-1-C3', x: 350, y: 160, floor: 1, type: 'corridor', label: '1F Corridor East' },
            { id: 'CS-201', x: 168, y: 148, floor: 1, type: 'room', label: 'AI/ML Lab' },
            { id: 'CS-202', x: 380, y: 148, floor: 1, type: 'room', label: 'Cybersecurity Lab' },
            { id: 'CS-203', x: 68, y: 172, floor: 1, type: 'room', label: 'Faculty Room A' },
            { id: 'CS-204', x: 168, y: 172, floor: 1, type: 'room', label: 'Faculty Room B' },
            { id: 'CS-205', x: 274, y: 172, floor: 1, type: 'room', label: 'Project Room' },
            { id: 'CS-1-STAIRS', x: 386, y: 231, floor: 1, type: 'stairs', label: '1F Stairs' },
        ],
        edges: [
            // Ground Floor Edges
            { from: 'CS-G-C1', to: 'CS-G-C2', weight: 130 },
            { from: 'CS-G-C2', to: 'CS-G-C3', weight: 120 },
            { from: 'CS-G-C1', to: 'CS-101', weight: 40 },
            { from: 'CS-G-C3', to: 'CS-102', weight: 40 },
            { from: 'CS-G-C1', to: 'CS-103', weight: 30 },
            { from: 'CS-G-C2', to: 'CS-104', weight: 30 },
            { from: 'CS-G-C3', to: 'CS-105', weight: 30 },
            { from: 'CS-G-C3', to: 'CS-106', weight: 60 },
            { from: 'CS-106', to: 'CS-G-STAIRS', weight: 70 },

            // First Floor Edges
            { from: 'CS-1-C1', to: 'CS-1-C2', weight: 130 },
            { from: 'CS-1-C2', to: 'CS-1-C3', weight: 120 },
            { from: 'CS-1-C1', to: 'CS-201', weight: 80 },
            { from: 'CS-1-C3', to: 'CS-202', weight: 40 },
            { from: 'CS-1-C1', to: 'CS-203', weight: 40 },
            { from: 'CS-1-C2', to: 'CS-204', weight: 40 },
            { from: 'CS-1-C2', to: 'CS-205', weight: 60 },
            { from: 'CS-1-C3', to: 'CS-1-STAIRS', weight: 50 },

            // Inter-floor (Stairs)
            { from: 'CS-G-STAIRS', to: 'CS-1-STAIRS', weight: 100 },
        ]
    },
    block_a: {
        nodes: [
            // GROUND FLOOR (0)
            { id: 'MN-G-C1', x: 250, y: 200, floor: 0, type: 'corridor', label: 'Main Lobby' },
            { id: 'MN-101', x: 96, y: 188, floor: 0, type: 'room', label: "Principal's Office" },
            { id: 'MN-102', x: 252, y: 188, floor: 0, type: 'room', label: 'Administration' },
            { id: 'MN-103', x: 406, y: 188, floor: 0, type: 'room', label: 'Placement Cell' },
            { id: 'MN-104', x: 88, y: 212, floor: 0, type: 'room', label: 'Reception' },
            { id: 'MN-105', x: 230, y: 212, floor: 0, type: 'room', label: 'Conference Room' },
            { id: 'MN-106', x: 362, y: 212, floor: 0, type: 'room', label: 'Security' },
            { id: 'MN-107', x: 362, y: 323, floor: 0, type: 'stairs', label: 'Main Stairs' }
        ],
        edges: [
            { from: 'MN-G-C1', to: 'MN-101', weight: 154 },
            { from: 'MN-G-C1', to: 'MN-102', weight: 12 },
            { from: 'MN-G-C1', to: 'MN-103', weight: 156 },
            { from: 'MN-G-C1', to: 'MN-104', weight: 162 },
            { from: 'MN-G-C1', to: 'MN-105', weight: 20 },
            { from: 'MN-G-C1', to: 'MN-106', weight: 113 },
            { from: 'MN-106', to: 'MN-107', weight: 111 },
        ]
    }
};
