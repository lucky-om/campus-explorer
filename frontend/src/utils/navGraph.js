/**
 * Navigation Graph — Corridor-Aware Pathfinding
 *
 * Every room connects to a DOOR waypoint sitting exactly at the corridor wall.
 * Door waypoints connect to CORRIDOR SPINE nodes (midpoints along the hallway).
 * Spine nodes connect to each other horizontally.
 *
 * This produces realistic L-shaped Google Maps-style paths:
 *   room_center → door → corridor_spine → door → room_center
 *
 * Coordinates are derived from ARCH_PLANS: door.center = doorX + doorW/2, doorWallY
 */

export const NAV_GRAPHS = {

    // ────────────────────────────────────────────────────────────────
    //  CAMPUS (outdoor)  –  coords match FLAT building positions
    // ────────────────────────────────────────────────────────────────
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

    // ────────────────────────────────────────────────────────────────
    //  BLOCK A (Admin)   viewBox "0 0 500 380"
    //  Corridor band: y 188 → 212, corridor spine y = 200
    //
    //  DOOR positions (from ARCH_PLANS doors array):
    //    wallY:188, x:90,  w:46  → MN-101 door centre (113, 188) — north wall
    //    wallY:188, x:240, w:46  → MN-102 door centre (263, 188) — north wall
    //    wallY:188, x:376, w:46  → MN-103 door centre (399, 188) — north wall
    //    wallY:212, x:68,  w:46  → MN-104 door centre (91,  212) — south wall
    //    wallY:212, x:218, w:46  → MN-105 door centre (241, 212) — south wall
    //  (MN-106/107 accessible from east end of corridor)
    //
    //  ROOM centres  (x+w/2, y+h/2):
    //    MN-101 (20,20,w:152,h:168)  → 96,  104
    //    MN-102 (176,20,w:152,h:168) → 252, 104
    //    MN-103 (332,20,w:148,h:168) → 406, 104
    //    MN-104 (20,212,w:136,h:148) → 88,  286
    //    MN-105 (160,212,w:140,h:148)→ 230, 286
    //    MN-106 (304,212,w:116,h:70) → 362, 247
    //    MN-107 (304,286,w:116,h:74) → 362, 323  (stairs)
    // ────────────────────────────────────────────────────────────────
    block_a: {
        nodes: [
            // External entrance (south wall, below all rooms)
            { id: 'MN-ENT', x: 252, y: 360, floor: 0, type: 'entry', label: 'Front Entrance' },

            // Corridor spine waypoints
            { id: 'MN-CW', x: 88, y: 200, floor: 0, type: 'corridor', label: 'Corridor West' },
            { id: 'MN-CC', x: 252, y: 200, floor: 0, type: 'corridor', label: 'Corridor Centre' },
            { id: 'MN-CE', x: 406, y: 200, floor: 0, type: 'corridor', label: 'Corridor East' },

            // Door waypoints — north wall of corridor (y = 188)
            { id: 'D-MN-101', x: 113, y: 188, floor: 0, type: 'door', label: 'Door to Principal' },
            { id: 'D-MN-102', x: 263, y: 188, floor: 0, type: 'door', label: 'Door to Admin' },
            { id: 'D-MN-103', x: 399, y: 188, floor: 0, type: 'door', label: 'Door to Placement' },

            // Door waypoints — south wall of corridor (y = 212)
            { id: 'D-MN-104', x: 91, y: 212, floor: 0, type: 'door', label: 'Door to Reception' },
            { id: 'D-MN-105', x: 241, y: 212, floor: 0, type: 'door', label: 'Door to Conference' },
            { id: 'D-MN-106', x: 362, y: 212, floor: 0, type: 'door', label: 'Door to Security' },

            // Room centres
            { id: 'MN-101', x: 96, y: 104, floor: 0, type: 'room', label: "Principal's Office" },
            { id: 'MN-102', x: 252, y: 104, floor: 0, type: 'room', label: 'Administration' },
            { id: 'MN-103', x: 406, y: 104, floor: 0, type: 'room', label: 'Placement Cell' },
            { id: 'MN-104', x: 88, y: 286, floor: 0, type: 'room', label: 'Reception / Lobby' },
            { id: 'MN-105', x: 230, y: 286, floor: 0, type: 'room', label: 'Conference Room' },
            { id: 'MN-106', x: 362, y: 247, floor: 0, type: 'room', label: 'Security Office' },
            { id: 'MN-107', x: 362, y: 323, floor: 0, type: 'stairs', label: 'Stairs / Lift' },
        ],
        edges: [
            // Entrance → corridor
            { from: 'MN-ENT', to: 'MN-CC', weight: 160 },

            // Corridor spine (horizontal)
            { from: 'MN-CW', to: 'MN-CC', weight: 164 },
            { from: 'MN-CC', to: 'MN-CE', weight: 154 },

            // North door → spine (short vertical drop)
            { from: 'D-MN-101', to: 'MN-CW', weight: 28 },
            { from: 'D-MN-102', to: 'MN-CC', weight: 15 },
            { from: 'D-MN-103', to: 'MN-CE', weight: 15 },

            // South door → spine (short vertical rise)
            { from: 'D-MN-104', to: 'MN-CW', weight: 18 },
            { from: 'D-MN-105', to: 'MN-CC', weight: 12 },
            { from: 'D-MN-106', to: 'MN-CE', weight: 44 },

            // Room → door (vertical segment)
            { from: 'MN-101', to: 'D-MN-101', weight: 84 },
            { from: 'MN-102', to: 'D-MN-102', weight: 84 },
            { from: 'MN-103', to: 'D-MN-103', weight: 84 },
            { from: 'MN-104', to: 'D-MN-104', weight: 74 },
            { from: 'MN-105', to: 'D-MN-105', weight: 74 },
            { from: 'MN-106', to: 'D-MN-106', weight: 35 },

            // Stairs accessible from east corridor end
            { from: 'MN-CE', to: 'MN-107', weight: 123 },
            { from: 'MN-106', to: 'MN-107', weight: 76 },
        ]
    },

    // ────────────────────────────────────────────────────────────────
    //  BLOCK C (CS)      Ground Floor viewBox "0 0 460 310"
    //  Corridor band: y 148 → 172, spine y = 160
    //
    //  DOOR positions  (from ARCH_PLANS doors):
    //    GF  wallY:148 x:88,w:42  → CS-101 door (109, 148) north
    //    GF  wallY:148 x:305,w:42 → CS-102 door (326, 148) north
    //    GF  wallY:172 x:72,w:42  → CS-103 door (93,  172) south
    //    GF  wallY:172 x:305,w:42 → CS-105/106 door (326,172) south
    //    GF  wallX:440 y:188,h:42 → side entrance (440, 209) east
    //
    //  ROOM centres GF:
    //    CS-101(20,20,w:208,h:128)   → 124, 84
    //    CS-102(232,20,w:208,h:128)  → 336, 84
    //    CS-103(20,172,w:172,h:118)  → 106, 231
    //    CS-104(196,172,w:76,h:118)  → 234, 231
    //    CS-105(276,172,w:88,h:58)   → 320, 201
    //    CS-106(368,172,w:72,h:58)   → 404, 201     (Reception)
    //    CS-107(276,234,w:164,h:56)  → 358, 262     (Washrooms/entry)
    //
    //  1F  wallY:148 x:148,w:42 → CS-201 door (169,148)
    //      wallY:148 x:350,w:42 → CS-202 door (371,148)
    //      wallY:172 x:55,w:42  → CS-203 door (76,172)
    //      wallY:172 x:155,w:42 → CS-204 door (176,172)
    //      wallY:172 x:265,w:42 → CS-205 door (286,172)
    //
    //  2F  wallY:205 x:105,w:48 → (129,205)
    //      wallY:205 x:272,w:48 → (296,205)
    //      wallY:205 x:387,w:48 → (411,205)
    // ────────────────────────────────────────────────────────────────
    block_c: {
        nodes: [
            // ── Ground Floor (fi=0) ──
            { id: 'CS-G-ENT', x: 440, y: 209, floor: 0, type: 'entry', label: 'Main Entrance' },

            // Corridor spine
            { id: 'CS-GCW', x: 109, y: 160, floor: 0, type: 'corridor', label: 'GF Corridor West' },
            { id: 'CS-GCE', x: 326, y: 160, floor: 0, type: 'corridor', label: 'GF Corridor East' },

            // North doors (y = 148)
            { id: 'D-CS-101', x: 109, y: 148, floor: 0, type: 'door', label: 'Door CS-101' },
            { id: 'D-CS-102', x: 326, y: 148, floor: 0, type: 'door', label: 'Door CS-102' },

            // South doors (y = 172) — note: stairs room also sits below this wall
            { id: 'D-CS-103', x: 93, y: 172, floor: 0, type: 'door', label: 'Door CS-103' },
            { id: 'D-CS-105', x: 326, y: 172, floor: 0, type: 'door', label: 'Door CS-105/106' },
            { id: 'D-CS-STAIR', x: 404, y: 172, floor: 0, type: 'door', label: 'Door to Stairs GF' },

            // Room centres GF
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

            // North doors 1F (y = 148)
            { id: 'D-CS-201', x: 169, y: 148, floor: 1, type: 'door', label: 'Door CS-201' },
            { id: 'D-CS-202', x: 371, y: 148, floor: 1, type: 'door', label: 'Door CS-202' },

            // South doors 1F (y = 172)
            { id: 'D-CS-203', x: 76, y: 172, floor: 1, type: 'door', label: 'Door CS-203' },
            { id: 'D-CS-204', x: 176, y: 172, floor: 1, type: 'door', label: 'Door CS-204' },
            { id: 'D-CS-205', x: 286, y: 172, floor: 1, type: 'door', label: 'Door CS-205' },
            { id: 'D-CS-1STR', x: 386, y: 172, floor: 1, type: 'door', label: 'Door to Stairs 1F' },

            // Room centres 1F
            { id: 'CS-201', x: 168, y: 84, floor: 1, type: 'room', label: 'AI/ML Lab' },
            { id: 'CS-202', x: 380, y: 84, floor: 1, type: 'room', label: 'Cybersecurity Lab' },
            { id: 'CS-203', x: 68, y: 231, floor: 1, type: 'room', label: 'Faculty Room A' },
            { id: 'CS-204', x: 168, y: 231, floor: 1, type: 'room', label: 'Faculty Room B' },
            { id: 'CS-205', x: 274, y: 201, floor: 1, type: 'room', label: 'Project Room' },
            { id: 'CS-1-STAIR', x: 386, y: 249, floor: 1, type: 'stairs', label: '1F Stairs' },

            // ── Second Floor (fi=2) ──
            // Wall between big hall and small rooms at y = 205
            // Corridor waypoints along y = 205
            { id: 'CS-2CW', x: 129, y: 205, floor: 2, type: 'corridor', label: '2F Corridor West' },
            { id: 'CS-2CC', x: 296, y: 205, floor: 2, type: 'corridor', label: '2F Corridor Centre' },
            { id: 'CS-2CE', x: 411, y: 205, floor: 2, type: 'corridor', label: '2F Corridor East' },

            // South doors 2F (y = 205, going down into small rooms)
            { id: 'D-CS-302', x: 129, y: 205, floor: 2, type: 'door', label: 'Door CS-302' },
            { id: 'D-CS-303', x: 296, y: 205, floor: 2, type: 'door', label: 'Door CS-303' },
            { id: 'D-CS-304', x: 411, y: 205, floor: 2, type: 'door', label: 'Door CS-304' },

            // Room centres 2F
            { id: 'CS-301', x: 230, y: 113, floor: 2, type: 'room', label: 'Seminar Hall' },
            { id: 'CS-302', x: 118, y: 250, floor: 2, type: 'room', label: 'Research Lab' },
            { id: 'CS-303', x: 286, y: 250, floor: 2, type: 'room', label: 'Software Dev Lab' },
            { id: 'CS-304', x: 398, y: 250, floor: 2, type: 'room', label: 'Utility & Print' },
            { id: 'CS-2-STAIR', x: 398, y: 250, floor: 2, type: 'stairs', label: '2F Stairs' },
        ],
        edges: [
            // ── Ground Floor ──
            { from: 'CS-G-ENT', to: 'CS-106', weight: 8 },  // entrance → reception
            { from: 'CS-106', to: 'D-CS-105', weight: 84 },  // reception → east corridor door
            { from: 'CS-G-ENT', to: 'CS-G-STAIR', weight: 53 },

            // GF corridor spine
            { from: 'CS-GCW', to: 'CS-GCE', weight: 217 },

            // North doors → spine
            { from: 'D-CS-101', to: 'CS-GCW', weight: 12 },
            { from: 'D-CS-102', to: 'CS-GCE', weight: 12 },

            // South doors → spine
            { from: 'D-CS-103', to: 'CS-GCW', weight: 16 },
            { from: 'D-CS-105', to: 'CS-GCE', weight: 12 },

            // Room → door (vertical)
            { from: 'CS-101', to: 'D-CS-101', weight: 64 },
            { from: 'CS-102', to: 'D-CS-102', weight: 64 },
            { from: 'CS-103', to: 'D-CS-103', weight: 59 },
            { from: 'CS-104', to: 'D-CS-103', weight: 76 },  // closest door
            { from: 'CS-105', to: 'D-CS-105', weight: 29 },

            // Stairs route: GCE → door → stairs room (all vertical/horizontal, no diagonal)
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
            // 1F stairs via door waypoint
            { from: 'CS-1CE', to: 'D-CS-1STR', weight: 15 },
            { from: 'D-CS-1STR', to: 'CS-1-STAIR', weight: 77 },

            // ── Second Floor ──
            // Large Seminar Hall → door waypoints
            { from: 'CS-301', to: 'CS-2CW', weight: 122 },
            { from: 'CS-301', to: 'CS-2CC', weight: 92 },
            { from: 'CS-301', to: 'CS-2CE', weight: 199 },

            // Corridor spine 2F
            { from: 'CS-2CW', to: 'CS-2CC', weight: 167 },
            { from: 'CS-2CC', to: 'CS-2CE', weight: 115 },

            // Door → rooms below
            { from: 'D-CS-302', to: 'CS-302', weight: 45 },
            { from: 'D-CS-303', to: 'CS-303', weight: 45 },
            { from: 'D-CS-304', to: 'CS-304', weight: 45 },

            // Each corridor node IS the door on 2F (same coords)
            { from: 'CS-2CW', to: 'D-CS-302', weight: 1 },
            { from: 'CS-2CC', to: 'D-CS-303', weight: 1 },
            { from: 'CS-2CE', to: 'D-CS-304', weight: 1 },

            // Inter-floor stairs
            { from: 'CS-G-STAIR', to: 'CS-1-STAIR', weight: 100 },
            { from: 'CS-1-STAIR', to: 'CS-2-STAIR', weight: 100 },
        ]
    },

    // Simplified single-entry graphs for other buildings
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
