/**
 * Navigation Graph — Corridor-Aware Pathfinding
 *
 * Architecture: room_center → door_waypoint → corridor_spine → door_waypoint → room_center
 * All indoor node coordinates MUST match visual room centres from ARCH_PLANS (x+w/2, y+h/2).
 * All door coordinates are derived from the ARCH_PLANS doors array (doorX + doorW/2, wallY).
 */

export const NAV_GRAPHS = {

    // ── CAMPUS (outdoor) ─────────────────────────────────────────────
    campus: {
        nodes: [
            { id: 'CP-NW', x: 110, y: 140, type: 'path' },
            { id: 'CP-NE', x: 450, y: 140, type: 'path' },
            { id: 'CP-SE', x: 450, y: 320, type: 'path' },
            { id: 'CP-SW', x: 110, y: 320, type: 'path' },
            { id: 'CP-AMN', x: 300, y: 180, type: 'path' },
            { id: 'CP-AMS', x: 300, y: 280, type: 'path' },
            { id: 'CP-AME', x: 370, y: 230, type: 'path' },
            { id: 'ENT-block_a', x: 110, y: 140, type: 'entry', buildingId: 'block_a' },
            { id: 'ENT-block_b', x: 210, y: 140, type: 'entry', buildingId: 'block_b' },
            { id: 'ENT-block_c', x: 315, y: 140, type: 'entry', buildingId: 'block_c' },
            { id: 'ENT-block_d', x: 415, y: 140, type: 'entry', buildingId: 'block_d' },
            { id: 'ENT-block_e', x: 450, y: 85, type: 'entry', buildingId: 'block_e' },
            { id: 'ENT-block_f', x: 450, y: 180, type: 'entry', buildingId: 'block_f' },
            { id: 'ENT-block_g', x: 450, y: 275, type: 'entry', buildingId: 'block_g' },
            { id: 'ENT-block_h', x: 450, y: 320, type: 'entry', buildingId: 'block_h' },
            { id: 'ENT-block_ij', x: 410, y: 320, type: 'entry', buildingId: 'block_ij' },
            { id: 'ENT-block_k', x: 310, y: 320, type: 'entry', buildingId: 'block_k' },
            { id: 'ENT-block_l', x: 205, y: 320, type: 'entry', buildingId: 'block_l' },
            { id: 'ENT-tifac', x: 110, y: 320, type: 'entry', buildingId: 'tifac' },
            { id: 'ENT-center', x: 300, y: 230, type: 'entry', buildingId: 'center_stage' },
        ],
        edges: [
            { from: 'CP-NW', to: 'ENT-block_a', weight: 1 },
            { from: 'CP-NW', to: 'ENT-block_b', weight: 100 },
            { from: 'ENT-block_b', to: 'ENT-block_c', weight: 105 },
            { from: 'ENT-block_c', to: 'ENT-block_d', weight: 100 },
            { from: 'ENT-block_d', to: 'CP-NE', weight: 35 },
            { from: 'CP-NE', to: 'ENT-block_e', weight: 55 },
            { from: 'ENT-block_e', to: 'ENT-block_f', weight: 95 },
            { from: 'ENT-block_f', to: 'CP-AME', weight: 50 },
            { from: 'CP-AME', to: 'ENT-block_g', weight: 45 },
            { from: 'ENT-block_g', to: 'CP-SE', weight: 45 },
            { from: 'CP-SE', to: 'ENT-block_h', weight: 1 },
            { from: 'CP-SE', to: 'ENT-block_ij', weight: 40 },
            { from: 'ENT-block_ij', to: 'ENT-block_k', weight: 100 },
            { from: 'ENT-block_k', to: 'CP-AMS', weight: 10 },
            { from: 'CP-AMS', to: 'ENT-block_l', weight: 105 },
            { from: 'ENT-block_l', to: 'CP-SW', weight: 95 },
            { from: 'CP-SW', to: 'ENT-tifac', weight: 1 },
            { from: 'CP-NW', to: 'CP-SW', weight: 180 },
            { from: 'CP-NE', to: 'CP-SE', weight: 180 },
            { from: 'CP-NW', to: 'CP-NE', weight: 340 },
            { from: 'CP-SW', to: 'CP-SE', weight: 340 },
            { from: 'ENT-block_c', to: 'CP-AMN', weight: 95 },
            { from: 'CP-AMN', to: 'ENT-center', weight: 50 },
            { from: 'ENT-center', to: 'CP-AMS', weight: 50 },
        ]
    },

    // ── BLOCK A (Admin) ──────────────────────────────────────────────
    // viewBox "0 0 500 380", corridor band y:188-212 (spine y=200)
    // Door centres from ARCH_PLANS:
    //   Nord wall y=188: (113,188) MN-101, (263,188) MN-102, (399,188) MN-103
    //   South wall y=212: (91,212) MN-104, (241,212) MN-105, (362,212) MN-106~approx
    // Room centres (x+w/2, y+h/2):
    //   MN-101:96,104  MN-102:252,104  MN-103:406,104
    //   MN-104:88,286  MN-105:230,286  MN-106:362,247  MN-107:362,323
    block_a: {
        nodes: [
            { id: 'MN-ENT', x: 252, y: 360, floor: 0, type: 'entry', label: 'Front Entrance' },
            // Corridor spine at y=200
            { id: 'MN-CW', x: 88, y: 200, floor: 0, type: 'corridor', label: 'Corridor West' },
            { id: 'MN-CC', x: 252, y: 200, floor: 0, type: 'corridor', label: 'Corridor Centre' },
            { id: 'MN-CE', x: 406, y: 200, floor: 0, type: 'corridor', label: 'Corridor East' },
            // North doors (y=188)
            { id: 'D-MN-101', x: 113, y: 188, floor: 0, type: 'door', label: 'Door — Principal' },
            { id: 'D-MN-102', x: 263, y: 188, floor: 0, type: 'door', label: 'Door — Admin' },
            { id: 'D-MN-103', x: 399, y: 188, floor: 0, type: 'door', label: 'Door — Placement' },
            // South doors (y=212)
            { id: 'D-MN-104', x: 91, y: 212, floor: 0, type: 'door', label: 'Door — Reception' },
            { id: 'D-MN-105', x: 241, y: 212, floor: 0, type: 'door', label: 'Door — Conference' },
            { id: 'D-MN-106', x: 362, y: 212, floor: 0, type: 'door', label: 'Door — Security' },
            // Rooms
            { id: 'MN-101', x: 96, y: 104, floor: 0, type: 'room', label: "Principal's Office" },
            { id: 'MN-102', x: 252, y: 104, floor: 0, type: 'room', label: 'Administration' },
            { id: 'MN-103', x: 406, y: 104, floor: 0, type: 'room', label: 'Placement Cell' },
            { id: 'MN-104', x: 88, y: 286, floor: 0, type: 'room', label: 'Reception / Lobby' },
            { id: 'MN-105', x: 230, y: 286, floor: 0, type: 'room', label: 'Conference Room' },
            { id: 'MN-106', x: 362, y: 247, floor: 0, type: 'room', label: 'Security Office' },
            { id: 'MN-107', x: 362, y: 323, floor: 0, type: 'stairs', label: 'Stairs / Lift' },
        ],
        edges: [
            { from: 'MN-ENT', to: 'MN-CC', weight: 160 },
            // Corridor spine
            { from: 'MN-CW', to: 'MN-CC', weight: 164 },
            { from: 'MN-CC', to: 'MN-CE', weight: 154 },
            // North door ↔ spine (vertical)
            { from: 'D-MN-101', to: 'MN-CW', weight: 28 },
            { from: 'D-MN-102', to: 'MN-CC', weight: 15 },
            { from: 'D-MN-103', to: 'MN-CE', weight: 15 },
            // South door ↔ spine (vertical)
            { from: 'D-MN-104', to: 'MN-CW', weight: 12 },
            { from: 'D-MN-105', to: 'MN-CC', weight: 12 },
            { from: 'D-MN-106', to: 'MN-CE', weight: 44 },
            // Room ↔ door (vertical)
            { from: 'MN-101', to: 'D-MN-101', weight: 84 },
            { from: 'MN-102', to: 'D-MN-102', weight: 84 },
            { from: 'MN-103', to: 'D-MN-103', weight: 84 },
            { from: 'MN-104', to: 'D-MN-104', weight: 74 },
            { from: 'MN-105', to: 'D-MN-105', weight: 74 },
            { from: 'MN-106', to: 'D-MN-106', weight: 35 },
            { from: 'MN-CE', to: 'MN-107', weight: 123 },
            { from: 'MN-106', to: 'MN-107', weight: 76 },
        ]
    },

    // ── BLOCK C (CS) ─────────────────────────────────────────────────
    // GF / 1F viewBox "0 0 460 310", corridor band y:148-172 (spine y=160)
    // 2F viewBox "0 0 460 310"
    //   Seminar Hall fills y:20-205 (full width)
    //   Small rooms y:209-290; dividing wall at y=205 with 3 doors
    //
    // DOOR centres from ARCH_PLANS:
    //   GF north y=148: (109,148) CS-101, (326,148) CS-102
    //   GF south y=172: (93,172)  CS-103, (326,172) CS-105/106, (404,172) stairs
    //   1F north y=148: (169,148) CS-201, (371,148) CS-202
    //   1F south y=172: (76,172)  CS-203, (176,172) CS-204, (286,172) CS-205, (386,172) stairs
    //   2F  south y=205: (129,205) CS-302, (296,205) CS-303, (411,205) CS-304/stairs
    block_c: {
        nodes: [
            // ── Ground Floor (fi=0) ──
            { id: 'CS-G-ENT', x: 440, y: 209, floor: 0, type: 'entry', label: 'GF Main Entrance' },
            { id: 'CS-GCW', x: 109, y: 160, floor: 0, type: 'corridor', label: 'GF Corridor West' },
            { id: 'CS-GCE', x: 326, y: 160, floor: 0, type: 'corridor', label: 'GF Corridor East' },
            { id: 'D-CS-101', x: 109, y: 148, floor: 0, type: 'door', label: 'Door CS-101' },
            { id: 'D-CS-102', x: 326, y: 148, floor: 0, type: 'door', label: 'Door CS-102' },
            { id: 'D-CS-103', x: 93, y: 172, floor: 0, type: 'door', label: 'Door CS-103' },
            { id: 'D-CS-105', x: 326, y: 172, floor: 0, type: 'door', label: 'Door CS-105/106' },
            { id: 'D-CS-STAIR', x: 404, y: 172, floor: 0, type: 'door', label: 'Door to GF Stairs' },
            { id: 'CS-101', x: 124, y: 84, floor: 0, type: 'room', label: 'Computer Lab 1' },
            { id: 'CS-102', x: 336, y: 84, floor: 0, type: 'room', label: 'Computer Lab 2' },
            { id: 'CS-103', x: 106, y: 231, floor: 0, type: 'room', label: 'Network Lab' },
            { id: 'CS-104', x: 234, y: 231, floor: 0, type: 'room', label: 'Server Room' },
            { id: 'CS-105', x: 320, y: 201, floor: 0, type: 'room', label: 'HOD Office' },
            { id: 'CS-106', x: 404, y: 201, floor: 0, type: 'room', label: 'Reception' },
            { id: 'CS-G-STAIR', x: 404, y: 262, floor: 0, type: 'stairs', label: 'Stairs / Lift (GF)' },

            // ── First Floor (fi=1) ──
            { id: 'CS-1CW', x: 76, y: 160, floor: 1, type: 'corridor', label: '1F Corridor West' },
            { id: 'CS-1CC', x: 230, y: 160, floor: 1, type: 'corridor', label: '1F Corridor Centre' },
            { id: 'CS-1CE', x: 371, y: 160, floor: 1, type: 'corridor', label: '1F Corridor East' },
            { id: 'D-CS-201', x: 169, y: 148, floor: 1, type: 'door', label: 'Door CS-201' },
            { id: 'D-CS-202', x: 371, y: 148, floor: 1, type: 'door', label: 'Door CS-202' },
            { id: 'D-CS-203', x: 76, y: 172, floor: 1, type: 'door', label: 'Door CS-203' },
            { id: 'D-CS-204', x: 176, y: 172, floor: 1, type: 'door', label: 'Door CS-204' },
            { id: 'D-CS-205', x: 286, y: 172, floor: 1, type: 'door', label: 'Door CS-205' },
            { id: 'D-CS-1STR', x: 386, y: 172, floor: 1, type: 'door', label: 'Door to 1F Stairs' },
            { id: 'CS-201', x: 168, y: 84, floor: 1, type: 'room', label: 'AI/ML Lab' },
            { id: 'CS-202', x: 380, y: 84, floor: 1, type: 'room', label: 'Cybersecurity Lab' },
            { id: 'CS-203', x: 68, y: 231, floor: 1, type: 'room', label: 'Faculty Room A' },
            { id: 'CS-204', x: 168, y: 231, floor: 1, type: 'room', label: 'Faculty Room B' },
            { id: 'CS-205', x: 274, y: 201, floor: 1, type: 'room', label: 'Project Room' },
            { id: 'CS-1-STAIR', x: 386, y: 249, floor: 1, type: 'stairs', label: 'Stairs / Lift (1F)' },

            // ── Second Floor (fi=2) ──
            // CS-2HS = hub on south wall of seminar hall, centre (230,205)
            { id: 'CS-2HS', x: 230, y: 205, floor: 2, type: 'corridor', label: '2F Hall South Centre' },
            // Door nodes along y=205
            { id: 'D2-302', x: 129, y: 205, floor: 2, type: 'door', label: 'Door to Research Lab' },
            { id: 'D2-303', x: 296, y: 205, floor: 2, type: 'door', label: 'Door to SW Dev Lab' },
            { id: 'D2-304', x: 411, y: 205, floor: 2, type: 'door', label: 'Door to Stairs/Print' },
            // Rooms 2F
            { id: 'CS-301', x: 230, y: 113, floor: 2, type: 'room', label: 'Seminar Hall' },
            { id: 'CS-302', x: 118, y: 250, floor: 2, type: 'room', label: 'Research Lab' },
            { id: 'CS-303', x: 286, y: 250, floor: 2, type: 'room', label: 'Software Dev Lab' },
            { id: 'CS-304', x: 398, y: 250, floor: 2, type: 'room', label: 'Utility & Print' },
            // 2F stair landing is at the east door D2-304 position
            { id: 'CS-2-STAIR', x: 411, y: 205, floor: 2, type: 'stairs', label: 'Stairs / Lift (2F)' },
        ],
        edges: [
            // ── Ground Floor ──
            { from: 'CS-G-ENT', to: 'CS-106', weight: 8 },
            { from: 'CS-106', to: 'D-CS-105', weight: 84 },
            { from: 'CS-GCW', to: 'CS-GCE', weight: 217 },
            { from: 'D-CS-101', to: 'CS-GCW', weight: 12 },
            { from: 'D-CS-102', to: 'CS-GCE', weight: 12 },
            { from: 'D-CS-103', to: 'CS-GCW', weight: 16 },
            { from: 'D-CS-105', to: 'CS-GCE', weight: 12 },
            { from: 'CS-101', to: 'D-CS-101', weight: 64 },
            { from: 'CS-102', to: 'D-CS-102', weight: 64 },
            { from: 'CS-103', to: 'D-CS-103', weight: 59 },
            { from: 'CS-104', to: 'D-CS-103', weight: 76 },
            { from: 'CS-105', to: 'D-CS-105', weight: 29 },
            // GF stairs: corridor → stair door → stair room (all orthogonal)
            { from: 'CS-GCE', to: 'D-CS-STAIR', weight: 78 },
            { from: 'D-CS-STAIR', to: 'CS-G-STAIR', weight: 90 },
            { from: 'CS-106', to: 'D-CS-STAIR', weight: 30 },

            // ── First Floor ──
            { from: 'CS-1CW', to: 'CS-1CC', weight: 154 },
            { from: 'CS-1CC', to: 'CS-1CE', weight: 141 },
            { from: 'D-CS-201', to: 'CS-1CC', weight: 61 },
            { from: 'D-CS-202', to: 'CS-1CE', weight: 1 },
            { from: 'D-CS-203', to: 'CS-1CW', weight: 1 },
            { from: 'D-CS-204', to: 'CS-1CC', weight: 54 },
            { from: 'D-CS-205', to: 'CS-1CC', weight: 56 },
            { from: 'CS-201', to: 'D-CS-201', weight: 64 },
            { from: 'CS-202', to: 'D-CS-202', weight: 64 },
            { from: 'CS-203', to: 'D-CS-203', weight: 59 },
            { from: 'CS-204', to: 'D-CS-204', weight: 59 },
            { from: 'CS-205', to: 'D-CS-205', weight: 29 },
            // 1F stairs: corridor → door → stair room (orthogonal)
            { from: 'CS-1CE', to: 'D-CS-1STR', weight: 15 },
            { from: 'D-CS-1STR', to: 'CS-1-STAIR', weight: 77 },

            // ── Second Floor ──
            // Seminar Hall (CS-301) → straight DOWN to south-wall hub (CS-2HS)
            { from: 'CS-301', to: 'CS-2HS', weight: 92 },
            // Hub → door nodes horizontally along y=205
            { from: 'CS-2HS', to: 'D2-302', weight: 101 },
            { from: 'CS-2HS', to: 'D2-303', weight: 66 },
            { from: 'CS-2HS', to: 'D2-304', weight: 181 },
            // Corridor along y=205 (horizontal)
            { from: 'D2-302', to: 'D2-303', weight: 167 },
            { from: 'D2-303', to: 'D2-304', weight: 115 },
            // Door → room (straight DOWN)
            { from: 'D2-302', to: 'CS-302', weight: 45 },
            { from: 'D2-303', to: 'CS-303', weight: 45 },
            { from: 'D2-304', to: 'CS-304', weight: 45 },
            // Stair landing = same coords as D2-304 → connects into corridor
            { from: 'CS-2-STAIR', to: 'D2-303', weight: 115 },
            { from: 'CS-2-STAIR', to: 'CS-2HS', weight: 181 },
            { from: 'CS-2-STAIR', to: 'CS-301', weight: 274 },

            // ── Inter-floor stairs ──
            { from: 'CS-G-STAIR', to: 'CS-1-STAIR', weight: 100 },
            { from: 'CS-1-STAIR', to: 'CS-2-STAIR', weight: 100 },
        ]
    },

    // ── Simplified graphs for other buildings ──────────────────────
    block_b: { nodes: [{ id: 'B-ENT', x: 240, y: 200, floor: 0, type: 'entry', label: 'Block B Entrance' }], edges: [] },
    block_d: { nodes: [{ id: 'D-ENT', x: 240, y: 200, floor: 0, type: 'entry', label: 'Library Entrance' }], edges: [] },
    block_e: { nodes: [{ id: 'E-ENT', x: 240, y: 200, floor: 0, type: 'entry', label: 'Block E Entrance' }], edges: [] },
    block_f: { nodes: [{ id: 'F-ENT', x: 240, y: 200, floor: 0, type: 'entry', label: 'Block F Entrance' }], edges: [] },
    block_g: { nodes: [{ id: 'G-ENT', x: 240, y: 200, floor: 0, type: 'entry', label: 'Block G Entrance' }], edges: [] },
    block_h: { nodes: [{ id: 'H-ENT', x: 240, y: 200, floor: 0, type: 'entry', label: 'Block H Entrance' }], edges: [] },
    block_ij: { nodes: [{ id: 'IJ-ENT', x: 240, y: 200, floor: 0, type: 'entry', label: 'Block I/J Entrance' }], edges: [] },
    block_k: { nodes: [{ id: 'K-ENT', x: 240, y: 200, floor: 0, type: 'entry', label: 'Block K Entrance' }], edges: [] },
    block_l: { nodes: [{ id: 'L-ENT', x: 240, y: 200, floor: 0, type: 'entry', label: 'Block L Entrance' }], edges: [] },
    tifac: { nodes: [{ id: 'TI-ENT', x: 240, y: 200, floor: 0, type: 'entry', label: 'TIFAC Entrance' }], edges: [] },
    center_stage: { nodes: [{ id: 'CA-ENT', x: 240, y: 200, floor: 0, type: 'entry', label: 'Amphitheater' }], edges: [] },
};
