/**
 * Navigation Graph Data Structure
 * Nodes represent locations (rooms, corridors, stairs, elevators).
 * Edges represent walkable paths between nodes.
 *
 * IMPORTANT: Campus-level node (x,y) coordinates MUST match the FLAT array
 * positions in CampusMap.jsx so paths render correctly on the 2D overview.
 *
 * FLAT building centers used here (x + w/2, y + h/2):
 *   block_a: 105, 85    block_b: 210, 85    block_c: 315, 85
 *   block_d: 415, 85    block_e: 510, 85    block_f: 510, 180
 *   block_g: 510, 275   block_h: 510, 370   block_ij: 410, 375
 *   block_k: 310, 375   block_l: 205, 375   tifac: 100, 375
 *   center_stage: 300, 230
 *
 * Path loop corners (matching FPATHS): NW:110,140  NE:450,140  SE:450,320  SW:110,320
 */

export const NAV_GRAPHS = {
    campus: {
        nodes: [
            // Courtyard loop waypoints (match FPATHS exactly)
            { id: 'CP-NW', x: 110, y: 140, type: 'path', label: 'NW Corner' },
            { id: 'CP-NE', x: 450, y: 140, type: 'path', label: 'NE Corner' },
            { id: 'CP-SE', x: 450, y: 320, type: 'path', label: 'SE Corner' },
            { id: 'CP-SW', x: 110, y: 320, type: 'path', label: 'SW Corner' },
            { id: 'CP-AMP-N', x: 300, y: 180, type: 'path', label: 'Amphitheater North' },
            { id: 'CP-AMP-S', x: 300, y: 280, type: 'path', label: 'Amphitheater South' },
            { id: 'CP-AMP-E', x: 370, y: 230, type: 'path', label: 'Amphitheater East' },

            // Building entry points (on the courtyard loop, facing each building)
            { id: 'ENT-block_a', x: 110, y: 140, type: 'entry', label: 'Block A Entry', buildingId: 'block_a' },
            { id: 'ENT-block_b', x: 210, y: 140, type: 'entry', label: 'Block B Entry', buildingId: 'block_b' },
            { id: 'ENT-block_c', x: 315, y: 140, type: 'entry', label: 'Block C Entry', buildingId: 'block_c' },
            { id: 'ENT-block_d', x: 415, y: 140, type: 'entry', label: 'Block D Entry', buildingId: 'block_d' },
            { id: 'ENT-block_e', x: 450, y: 85, type: 'entry', label: 'Block E Entry', buildingId: 'block_e' },
            { id: 'ENT-block_f', x: 450, y: 180, type: 'entry', label: 'Block F Entry', buildingId: 'block_f' },
            { id: 'ENT-block_g', x: 450, y: 275, type: 'entry', label: 'Block G Entry', buildingId: 'block_g' },
            { id: 'ENT-block_h', x: 450, y: 320, type: 'entry', label: 'Block H Entry', buildingId: 'block_h' },
            { id: 'ENT-block_ij', x: 410, y: 320, type: 'entry', label: 'Block I/J Entry', buildingId: 'block_ij' },
            { id: 'ENT-block_k', x: 310, y: 320, type: 'entry', label: 'Block K Entry', buildingId: 'block_k' },
            { id: 'ENT-block_l', x: 205, y: 320, type: 'entry', label: 'Block L Entry', buildingId: 'block_l' },
            { id: 'ENT-tifac', x: 110, y: 320, type: 'entry', label: 'TIFAC Entry', buildingId: 'tifac' },
            { id: 'ENT-center', x: 300, y: 230, type: 'entry', label: 'Amphitheater', buildingId: 'center_stage' },
        ],
        edges: [
            // Courtyard loop (clockwise)
            { from: 'CP-NW', to: 'ENT-block_b', weight: 100 },
            { from: 'ENT-block_b', to: 'ENT-block_c', weight: 105 },
            { from: 'ENT-block_c', to: 'ENT-block_d', weight: 100 },
            { from: 'ENT-block_d', to: 'CP-NE', weight: 35 },
            { from: 'CP-NW', to: 'ENT-block_a', weight: 1 },
            { from: 'CP-NE', to: 'ENT-block_e', weight: 55 },
            { from: 'ENT-block_e', to: 'ENT-block_f', weight: 95 },
            { from: 'ENT-block_f', to: 'CP-AMP-E', weight: 50 },
            { from: 'CP-AMP-E', to: 'ENT-block_g', weight: 45 },
            { from: 'ENT-block_g', to: 'CP-SE', weight: 45 },
            { from: 'CP-SE', to: 'ENT-block_h', weight: 1 },
            { from: 'CP-SE', to: 'ENT-block_ij', weight: 40 },
            { from: 'ENT-block_ij', to: 'ENT-block_k', weight: 100 },
            { from: 'ENT-block_k', to: 'CP-AMP-S', weight: 10 },
            { from: 'CP-AMP-S', to: 'ENT-block_l', weight: 105 },
            { from: 'ENT-block_l', to: 'CP-SW', weight: 95 },
            { from: 'CP-SW', to: 'ENT-tifac', weight: 1 },
            // Loop cross-connections
            { from: 'CP-NW', to: 'CP-SW', weight: 180 },
            { from: 'CP-NE', to: 'CP-SE', weight: 180 },
            { from: 'CP-NW', to: 'CP-NE', weight: 340 },
            { from: 'CP-SW', to: 'CP-SE', weight: 340 },
            // Amphitheatre spurs
            { from: 'ENT-block_c', to: 'CP-AMP-N', weight: 95 },
            { from: 'CP-AMP-N', to: 'ENT-center', weight: 50 },
            { from: 'ENT-center', to: 'CP-AMP-S', weight: 50 },
            { from: 'CP-AMP-E', to: 'ENT-center', weight: 140 },
        ]
    },

    // ── Block C (CS) ────────────────────────────────────────────────
    block_c: {
        nodes: [
            { id: 'CS-G-ENT', x: 440, y: 188, floor: 0, type: 'entry', label: 'Main Entrance' },
            { id: 'CS-G-C1', x: 100, y: 160, floor: 0, type: 'corridor', label: 'Ground Corridor West' },
            { id: 'CS-G-C2', x: 230, y: 160, floor: 0, type: 'corridor', label: 'Ground Corridor Centre' },
            { id: 'CS-G-C3', x: 350, y: 160, floor: 0, type: 'corridor', label: 'Ground Corridor East' },
            { id: 'CS-101', x: 124, y: 84, floor: 0, type: 'room', label: 'Computer Lab 1' },
            { id: 'CS-102', x: 336, y: 84, floor: 0, type: 'room', label: 'Computer Lab 2' },
            { id: 'CS-103', x: 106, y: 231, floor: 0, type: 'room', label: 'Network Lab' },
            { id: 'CS-104', x: 234, y: 231, floor: 0, type: 'room', label: 'Server Room' },
            { id: 'CS-105', x: 320, y: 203, floor: 0, type: 'room', label: 'HOD Office' },
            { id: 'CS-106', x: 404, y: 203, floor: 0, type: 'room', label: 'Reception' },
            { id: 'CS-G-STAIRS', x: 404, y: 262, floor: 0, type: 'stairs', label: 'Ground Stairs' },
            // First Floor
            { id: 'CS-1-C1', x: 100, y: 160, floor: 1, type: 'corridor', label: '1F Corridor West' },
            { id: 'CS-1-C2', x: 230, y: 160, floor: 1, type: 'corridor', label: '1F Corridor Centre' },
            { id: 'CS-1-C3', x: 350, y: 160, floor: 1, type: 'corridor', label: '1F Corridor East' },
            { id: 'CS-201', x: 168, y: 84, floor: 1, type: 'room', label: 'AI/ML Lab' },
            { id: 'CS-202', x: 380, y: 84, floor: 1, type: 'room', label: 'Cybersecurity Lab' },
            { id: 'CS-203', x: 68, y: 231, floor: 1, type: 'room', label: 'Faculty Room A' },
            { id: 'CS-204', x: 168, y: 231, floor: 1, type: 'room', label: 'Faculty Room B' },
            { id: 'CS-205', x: 274, y: 231, floor: 1, type: 'room', label: 'Project Room' },
            { id: 'CS-1-STAIRS', x: 386, y: 231, floor: 1, type: 'stairs', label: '1F Stairs' },
            // Second Floor
            { id: 'CS-2-C1', x: 230, y: 112, floor: 2, type: 'corridor', label: '2F Corridor' },
            { id: 'CS-301', x: 230, y: 113, floor: 2, type: 'room', label: 'Seminar Hall' },
            { id: 'CS-302', x: 108, y: 249, floor: 2, type: 'room', label: 'Research Lab' },
            { id: 'CS-303', x: 286, y: 249, floor: 2, type: 'room', label: 'Software Dev Lab' },
            { id: 'CS-2-STAIRS', x: 398, y: 249, floor: 2, type: 'stairs', label: '2F Stairs' },
        ],
        edges: [
            // Ground floor
            { from: 'CS-G-ENT', to: 'CS-G-C3', weight: 70 },
            { from: 'CS-G-C1', to: 'CS-G-C2', weight: 130 },
            { from: 'CS-G-C2', to: 'CS-G-C3', weight: 120 },
            { from: 'CS-G-C1', to: 'CS-101', weight: 76 },
            { from: 'CS-G-C3', to: 'CS-102', weight: 76 },
            { from: 'CS-G-C1', to: 'CS-103', weight: 71 },
            { from: 'CS-G-C2', to: 'CS-104', weight: 71 },
            { from: 'CS-G-C3', to: 'CS-105', weight: 43 },
            { from: 'CS-G-C3', to: 'CS-106', weight: 54 },
            { from: 'CS-106', to: 'CS-G-STAIRS', weight: 59 },
            // 1st floor
            { from: 'CS-1-C1', to: 'CS-1-C2', weight: 130 },
            { from: 'CS-1-C2', to: 'CS-1-C3', weight: 120 },
            { from: 'CS-1-C1', to: 'CS-201', weight: 76 },
            { from: 'CS-1-C3', to: 'CS-202', weight: 76 },
            { from: 'CS-1-C1', to: 'CS-203', weight: 71 },
            { from: 'CS-1-C2', to: 'CS-204', weight: 71 },
            { from: 'CS-1-C2', to: 'CS-205', weight: 44 },
            { from: 'CS-1-C3', to: 'CS-1-STAIRS', weight: 119 },
            // 2nd floor
            { from: 'CS-2-C1', to: 'CS-301', weight: 1 },
            { from: 'CS-2-C1', to: 'CS-302', weight: 137 },
            { from: 'CS-2-C1', to: 'CS-303', weight: 56 },
            { from: 'CS-2-C1', to: 'CS-2-STAIRS', weight: 168 },
            // Stairs (inter-floor)
            { from: 'CS-G-STAIRS', to: 'CS-1-STAIRS', weight: 100 },
            { from: 'CS-1-STAIRS', to: 'CS-2-STAIRS', weight: 100 },
        ]
    },

    // ── Block A (Admin) ─────────────────────────────────────────────
    block_a: {
        nodes: [
            { id: 'MN-G-ENT', x: 250, y: 360, floor: 0, type: 'entry', label: 'Front Entrance' },
            { id: 'MN-G-C1', x: 250, y: 200, floor: 0, type: 'corridor', label: 'Main Lobby' },
            { id: 'MN-101', x: 96, y: 104, floor: 0, type: 'room', label: "Principal's Office" },
            { id: 'MN-102', x: 252, y: 104, floor: 0, type: 'room', label: 'Administration' },
            { id: 'MN-103', x: 406, y: 104, floor: 0, type: 'room', label: 'Placement Cell' },
            { id: 'MN-104', x: 88, y: 286, floor: 0, type: 'room', label: 'Reception / Lobby' },
            { id: 'MN-105', x: 230, y: 286, floor: 0, type: 'room', label: 'Conference Room' },
            { id: 'MN-106', x: 362, y: 247, floor: 0, type: 'room', label: 'Security Office' },
            { id: 'MN-107', x: 362, y: 323, floor: 0, type: 'stairs', label: 'Main Stairs' },
        ],
        edges: [
            { from: 'MN-G-ENT', to: 'MN-G-C1', weight: 160 },
            { from: 'MN-G-C1', to: 'MN-101', weight: 154 },
            { from: 'MN-G-C1', to: 'MN-102', weight: 12 },
            { from: 'MN-G-C1', to: 'MN-103', weight: 156 },
            { from: 'MN-G-C1', to: 'MN-104', weight: 86 },
            { from: 'MN-G-C1', to: 'MN-105', weight: 20 },
            { from: 'MN-G-C1', to: 'MN-106', weight: 113 },
            { from: 'MN-106', to: 'MN-107', weight: 76 },
        ]
    },

    // ── Simplified graphs for remaining buildings ─────────────────────
    block_b: { nodes: [{ id: 'B-ENT', x: 100, y: 100, floor: 0, type: 'entry', label: 'Block B Entrance' }], edges: [] },
    block_d: { nodes: [{ id: 'D-ENT', x: 100, y: 100, floor: 0, type: 'entry', label: 'Library Entrance' }], edges: [] },
    block_e: { nodes: [{ id: 'E-ENT', x: 100, y: 100, floor: 0, type: 'entry', label: 'Block E Entrance' }], edges: [] },
    block_f: { nodes: [{ id: 'F-ENT', x: 100, y: 100, floor: 0, type: 'entry', label: 'Block F Entrance' }], edges: [] },
    block_g: { nodes: [{ id: 'G-ENT', x: 100, y: 100, floor: 0, type: 'entry', label: 'Block G Entrance' }], edges: [] },
    block_h: { nodes: [{ id: 'H-ENT', x: 100, y: 100, floor: 0, type: 'entry', label: 'Block H Entrance' }], edges: [] },
    block_ij: { nodes: [{ id: 'IJ-ENT', x: 100, y: 100, floor: 0, type: 'entry', label: 'Block I/J Entrance' }], edges: [] },
    block_k: { nodes: [{ id: 'K-ENT', x: 100, y: 100, floor: 0, type: 'entry', label: 'Block K Entrance' }], edges: [] },
    block_l: { nodes: [{ id: 'L-ENT', x: 100, y: 100, floor: 0, type: 'entry', label: 'Block L Entrance' }], edges: [] },
    tifac: { nodes: [{ id: 'TI-ENT', x: 100, y: 100, floor: 0, type: 'entry', label: 'TIFAC Entrance' }], edges: [] },
    center_stage: { nodes: [{ id: 'CS-ENT', x: 100, y: 100, floor: 0, type: 'entry', label: 'Amphitheater' }], edges: [] },
};
