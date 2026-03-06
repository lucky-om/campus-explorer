import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocations, logSearch } from '../services/api';
import { NAV_GRAPHS } from '../utils/navGraph';
import { findPath } from '../utils/pathfinding';
import { calculateDistance, generateInstructions } from '../utils/navigationUtils';
import './CampusMap.css';

// ─── BUILDINGS (grid layout used by 3D map) ────────────────────────
const BUILDINGS = [
    { id: 'block_a', label: 'Block A (Admin)', icon: '🏛️', gx: 4, gy: 3, gw: 4, gd: 3, h: 80, color: '#94a3b8', desc: 'Admin, Principal, Placement', floors: 3 },
    { id: 'block_b', label: 'Block B (Arch)', icon: '🏗️', gx: 9, gy: 2, gw: 3, gd: 3, h: 72, color: '#bbf7d0', desc: 'Architecture & Design', floors: 3 },
    { id: 'block_c', label: 'Block C (CS)', icon: '💻', gx: 13, gy: 2, gw: 3, gd: 2, h: 68, color: '#fecdd3', desc: 'Computer Science Labs', floors: 3 },
    { id: 'block_d', label: 'Block D (Library)', icon: '📚', gx: 4, gy: 7, gw: 3, gd: 2, h: 50, color: '#e9d5ff', desc: 'Books, Digital Section', floors: 2 },
    { id: 'block_e', label: 'Block E (Elec)', icon: '⚡', gx: 9, gy: 7, gw: 3, gd: 2, h: 30, color: '#fef08a', desc: 'Electrical Labs', floors: 3 },
    { id: 'block_f', label: 'Block F (E&C)', icon: '📻', gx: 1, gy: 3, gw: 3, gd: 5, h: 78, color: '#ffedd5', desc: 'E&C Faculty & Labs', floors: 2 },
    { id: 'block_g', label: 'Block G (IC)', gx: 1, gy: 9, gw: 3, gd: 2, h: 20, icon: '🎛️', color: '#fbcfe8', desc: 'IC Engineering', floors: 1 },
    { id: 'block_h', label: 'Block H (IT)', gx: 14, gy: 7, gw: 4, gd: 3, h: 28, icon: '🌐', color: '#a7f3d0', desc: 'Information Technology', floors: 1 },
    { id: 'block_ij', label: 'Block I/J (Chem)', icon: '🧪', gx: 8, gy: 13, gw: 2, gd: 1, h: 38, color: '#dcfce7', desc: 'Chemical Engineering', floors: 1 },
    { id: 'block_k', label: 'Block K (Science)', icon: '🔬', gx: 10, gy: 13, gw: 2, gd: 1, h: 40, color: '#bbf7d0', desc: 'Basic Science Dept', floors: 1 },
    { id: 'block_l', label: 'Block L (Textile)', icon: '🧵', gx: 12, gy: 13, gw: 2, gd: 1, h: 35, color: '#fecdd3', desc: 'Textile Engineering', floors: 1 },
    { id: 'tifac', label: 'TIFAC Core', icon: '🏢', gx: 14, gy: 13, gw: 2, gd: 1, h: 45, color: '#e2e8f0', desc: 'Research Center', floors: 1 },
    { id: 'center_stage', label: 'Amphitheater', icon: '🎭', gx: 16, gy: 13, gw: 2, gd: 1, h: 10, color: '#f8fafc', desc: 'Open Air Theater', floors: 1 },
];

// ─── ARCHITECTURAL FLOOR PLAN DATA ─────────────────────────────────
// Doors: { wallY, x, w, open }  → horizontal wall at wallY, door from x to x+w, open=1 south/-1 north
//        { wallX, y, h, open }  → vertical wall at wallX, door from y to y+h, open=1 east/-1 west
// Windows: { wallY, x, w } or { wallX, y, h }

const ARCH_PLANS = {
    block_c: {
        name: 'CS Block', scale: '1:200', area: '1,800 sqm', floors: [
            {
                label: 'Ground Floor', vw: '0 0 460 310',
                outer: { x: 20, y: 20, w: 420, h: 270 }, W: 7,
                corridors: [{ x: 20, y: 148, w: 420, h: 24 }],
                rooms: [
                    { id: 'CS-101', x: 20, y: 20, w: 208, h: 128, label: 'Computer Lab 1', sub: '60 Workstations', color: '#0EA5E9', icon: '💻' },
                    { id: 'CS-102', x: 232, y: 20, w: 208, h: 128, label: 'Computer Lab 2', sub: '60 Workstations', color: '#0EA5E9', icon: '💻' },
                    { id: 'CS-103', x: 20, y: 172, w: 172, h: 118, label: 'Network Lab', sub: 'Cisco / Juniper', color: '#10B981', icon: '🌐' },
                    { id: 'CS-104', x: 196, y: 172, w: 76, h: 118, label: 'Server Room', sub: '24×7 AC', color: '#374151', icon: '🖥️' },
                    { id: 'CS-105', x: 276, y: 172, w: 88, h: 58, label: 'HOD Office', sub: 'Prof. Meena Patel', color: '#5B4FE9', icon: '👨‍💼' },
                    { id: 'CS-106', x: 368, y: 172, w: 72, h: 58, label: 'Reception', sub: '', color: '#9CA3AF', icon: '💁' },
                    { id: 'CS-107', x: 276, y: 234, w: 164, h: 56, label: 'Washrooms', sub: '', color: '#D1D5DB', icon: '🚻' },
                ],
                doors: [
                    { wallY: 148, x: 88, w: 42, open: 1 },
                    { wallY: 148, x: 305, w: 42, open: 1 },
                    { wallY: 172, x: 72, w: 42, open: 1 },
                    { wallY: 172, x: 305, w: 42, open: 1 },
                    { wallY: 20, x: 80, w: 42, open: 1, ext: true },
                    { wallY: 20, x: 298, w: 42, open: 1, ext: true },
                    { wallX: 440, y: 188, h: 42, open: -1 },
                ],
                windows: [
                    { wallY: 20, x: 148, w: 55 }, { wallY: 20, x: 340, w: 55 },
                    { wallY: 290, x: 50, w: 55 }, { wallY: 290, x: 210, w: 55 },
                    { wallX: 20, y: 55, h: 55 }, { wallX: 440, y: 205, h: 55 },
                ],
                cols: [[20, 20], [232, 20], [440, 20], [440, 148], [440, 290], [232, 290], [20, 290], [20, 148], [232, 148]],
                stairs: [{ x: 368, y: 234, w: 72, h: 56 }],
            },
            {
                label: 'First Floor', vw: '0 0 460 310',
                outer: { x: 20, y: 20, w: 420, h: 270 }, W: 7,
                corridors: [{ x: 20, y: 148, w: 420, h: 24 }],
                rooms: [
                    { id: 'CS-201', x: 20, y: 20, w: 296, h: 128, label: 'AI / ML Research Lab', sub: 'GPU Workstations', color: '#8B5CF6', icon: '🤖' },
                    { id: 'CS-202', x: 320, y: 20, w: 120, h: 128, label: 'Cybersecurity Lab', sub: 'Kali · Metasploit', color: '#EF4444', icon: '🔒' },
                    { id: 'CS-203', x: 20, y: 172, w: 96, h: 118, label: 'Faculty Room A', sub: '', color: '#0EA5E9', icon: '👨‍🏫' },
                    { id: 'CS-204', x: 120, y: 172, w: 96, h: 118, label: 'Faculty Room B', sub: '', color: '#0EA5E9', icon: '👨‍🏫' },
                    { id: 'CS-205', x: 220, y: 172, w: 108, h: 118, label: 'Project Room', sub: '', color: '#F59E0B', icon: '🛠️' },
                    { id: 'CS-206', x: 332, y: 172, w: 108, h: 118, label: 'Stairs / Lift', sub: '', color: '#9CA3AF', icon: '🪜' },
                ],
                doors: [
                    { wallY: 148, x: 148, w: 42, open: 1 },
                    { wallY: 148, x: 350, w: 42, open: 1 },
                    { wallY: 172, x: 55, w: 42, open: 1 },
                    { wallY: 172, x: 155, w: 42, open: 1 },
                    { wallY: 172, x: 265, w: 42, open: 1 },
                    { wallY: 20, x: 130, w: 42, open: 1, ext: true },
                    { wallY: 20, x: 352, w: 42, open: 1, ext: true },
                ],
                windows: [
                    { wallY: 20, x: 50, w: 55 }, { wallY: 20, x: 220, w: 55 }, { wallY: 20, x: 370, w: 55 },
                    { wallY: 290, x: 50, w: 55 }, { wallY: 290, x: 220, w: 55 },
                    { wallX: 20, y: 55, h: 55 }, { wallX: 440, y: 55, h: 55 },
                ],
                cols: [[20, 20], [320, 20], [440, 20], [440, 148], [440, 290], [320, 290], [20, 290], [20, 148], [320, 148]],
                stairs: [{ x: 332, y: 172, w: 108, h: 118 }],
            },
            {
                label: 'Second Floor', vw: '0 0 460 310',
                outer: { x: 20, y: 20, w: 420, h: 270 }, W: 7,
                corridors: [],
                rooms: [
                    { id: 'CS-301', x: 20, y: 20, w: 420, h: 185, label: 'Seminar Hall', sub: '200 Seats · Projector · AV System', color: '#8B5CF6', icon: '🎓' },
                    { id: 'CS-302', x: 20, y: 209, w: 196, h: 81, label: 'Research Lab', sub: 'PhD Students', color: '#5B4FE9', icon: '🔬' },
                    { id: 'CS-303', x: 220, y: 209, w: 132, h: 81, label: 'Software Dev Lab', sub: '', color: '#0EA5E9', icon: '⌨️' },
                    { id: 'CS-304', x: 356, y: 209, w: 84, h: 81, label: 'Utility & Print', sub: '', color: '#9CA3AF', icon: '🖨️' },
                ],
                doors: [
                    { wallY: 205, x: 105, w: 48, open: 1 },
                    { wallY: 205, x: 272, w: 48, open: 1 },
                    { wallY: 205, x: 387, w: 48, open: 1 },
                    { wallY: 20, x: 200, w: 52, open: 1, ext: true },
                ],
                windows: [
                    { wallY: 20, x: 60, w: 70 }, { wallY: 20, x: 240, w: 70 }, { wallY: 20, x: 390, w: 50 },
                    { wallY: 290, x: 50, w: 70 }, { wallY: 290, x: 250, w: 70 },
                    { wallX: 20, y: 60, h: 70 }, { wallX: 440, y: 60, h: 70 },
                ],
                cols: [[20, 20], [440, 20], [440, 205], [440, 290], [220, 290], [20, 290], [20, 205]],
                stairs: [{ x: 356, y: 209, w: 84, h: 81 }],
            },
        ]
    },
    block_a: {
        name: 'Block A (Admin)', scale: '1:200', area: '2,100 sqm', floors: [
            {
                label: 'Ground Floor', vw: '0 0 500 380',
                outer: { x: 20, y: 20, w: 460, h: 340 }, W: 7,
                corridors: [{ x: 20, y: 188, w: 460, h: 24 }],
                rooms: [
                    { id: 'MN-101', x: 20, y: 20, w: 152, h: 168, label: "Principal's Office", sub: 'Dr. Rajesh Sharma', color: '#5B4FE9', icon: '👔' },
                    { id: 'MN-102', x: 176, y: 20, w: 152, h: 168, label: 'Administration', sub: 'Records & Accounts', color: '#5B4FE9', icon: '📋' },
                    { id: 'MN-103', x: 332, y: 20, w: 148, h: 168, label: 'Placement Cell', sub: 'Prof. Ramesh Gupta', color: '#8B5CF6', icon: '💼' },
                    { id: 'MN-104', x: 20, y: 212, w: 136, h: 148, label: 'Reception / Lobby', sub: 'Visitor Entry', color: '#9CA3AF', icon: '💁' },
                    { id: 'MN-105', x: 160, y: 212, w: 140, h: 148, label: 'Conference Room', sub: '40 Seats', color: '#0EA5E9', icon: '🤝' },
                    { id: 'MN-106', x: 304, y: 212, w: 116, h: 70, label: 'Security Office', sub: 'CCTV Control', color: '#374151', icon: '🔒' },
                    { id: 'MN-107', x: 304, y: 286, w: 116, h: 74, label: 'Stairs / Lift', sub: '', color: '#9CA3AF', icon: '🪜' },
                    { id: 'MN-108', x: 424, y: 212, w: 56, h: 148, label: 'Wash-rooms', sub: '', color: '#D1D5DB', icon: '🚻' },
                ],
                doors: [
                    { wallY: 188, x: 90, w: 46, open: 1 },
                    { wallY: 188, x: 240, w: 46, open: 1 },
                    { wallY: 188, x: 376, w: 46, open: 1 },
                    { wallY: 212, x: 68, w: 46, open: 1 },
                    { wallY: 212, x: 218, w: 46, open: 1 },
                    { wallY: 20, x: 78, w: 46, open: 1, ext: true },
                    { wallY: 20, x: 246, w: 46, open: 1, ext: true },
                    { wallY: 20, x: 398, w: 46, open: 1, ext: true },
                ],
                windows: [
                    { wallY: 20, x: 36, w: 60 }, { wallY: 20, x: 214, w: 60 }, { wallY: 20, x: 368, w: 60 },
                    { wallY: 360, x: 50, w: 60 }, { wallY: 360, x: 220, w: 60 },
                    { wallX: 20, y: 60, h: 60 }, { wallX: 480, y: 60, h: 60 }, { wallX: 480, y: 240, h: 60 },
                ],
                cols: [[20, 20], [176, 20], [332, 20], [480, 20], [480, 188], [480, 360], [176, 360], [20, 360], [20, 188], [304, 188], [304, 212]],
                stairs: [{ x: 304, y: 286, w: 116, h: 74 }],
            },
        ]
    },
};
const DFLT_PLAN = { name: 'Floor Plan', scale: '1:200', area: '—', floors: [{ label: 'Ground Floor', vw: '0 0 300 200', outer: { x: 20, y: 20, w: 260, h: 160 }, W: 7, corridors: [], rooms: [], doors: [], windows: [], cols: [], stairs: [] }] };

// ─── FLOOR PLAN RENDERER ──────────────────────────────────────────
function FloorPlanSVG({ plan, fi }) {
    const floor = plan.floors[fi] || plan.floors[0];
    const { outer, W, rooms, corridors, doors, windows, cols, stairs } = floor;

    const Door = ({ d }) => {
        if (d.wallY !== undefined) {
            const { wallY: y, x, w, open = 1, ext } = d;
            const arcSweep = open > 0 ? 1 : 0;
            return (
                <g>
                    <rect x={x} y={y - W / 2 - 0.5} width={w} height={W + 1} fill="var(--fp-bg)" />
                    {ext && <rect x={x} y={y - W / 2 - 0.5} width={w} height={W + 1} fill="rgba(147,210,255,0.15)" />}
                    <line x1={x} y1={y} x2={x} y2={y + open * w} stroke="var(--fp-door)" strokeWidth="1.5" />
                    <path d={`M${x},${y} A${w},${w} 0 0,${arcSweep} ${x + w},${y}`} fill="none" stroke="var(--fp-door)" strokeWidth="0.9" strokeDasharray="3,2" />
                </g>
            );
        } else {
            const { wallX: x, y, h, open = 1, ext } = d;
            const arcSweep = open > 0 ? 1 : 0;
            return (
                <g>
                    <rect x={x - W / 2 - 0.5} y={y} width={W + 1} height={h} fill="var(--fp-bg)" />
                    {ext && <rect x={x - W / 2 - 0.5} y={y} width={W + 1} height={h} fill="rgba(147,210,255,0.15)" />}
                    <line x1={x} y1={y} x2={x + open * h} y2={y} stroke="var(--fp-door)" strokeWidth="1.5" />
                    <path d={`M${x},${y} A${h},${h} 0 0,${arcSweep} ${x},${y + h}`} fill="none" stroke="var(--fp-door)" strokeWidth="0.9" strokeDasharray="3,2" />
                </g>
            );
        }
    };

    const Win = ({ w: wn }) => {
        if (wn.wallY !== undefined) {
            const { wallY: y, x, w } = wn;
            return <g>
                <line x1={x} y1={y - 2} x2={x + w} y2={y - 2} stroke="var(--fp-win)" strokeWidth="3.5" />
                <line x1={x} y1={y + 2} x2={x + w} y2={y + 2} stroke="var(--fp-win)" strokeWidth="3.5" />
                <line x1={x} y1={y - 2} x2={x + w} y2={y - 2} stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
            </g>;
        } else {
            const { wallX: x, y, h } = wn;
            return <g>
                <line x1={x - 2} y1={y} x2={x - 2} y2={y + h} stroke="var(--fp-win)" strokeWidth="3.5" />
                <line x1={x + 2} y1={y} x2={x + 2} y2={y + h} stroke="var(--fp-win)" strokeWidth="3.5" />
                <line x1={x - 2} y1={y} x2={x - 2} y2={y + h} stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
            </g>;
        }
    };

    const [vx, , vw, vh] = floor.vw.split(' ').map(Number);

    return (
        <svg viewBox={floor.vw} className="fp-svg arch-fp" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="grid-fp" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M10,0L0,0 0,10" fill="none" stroke="var(--fp-grid)" strokeWidth="0.35" />
                </pattern>
                <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="8" x2="8" y2="0" stroke="var(--fp-hatch)" strokeWidth="1.2" />
                </pattern>
            </defs>

            {/* Background */}
            <rect width={vw + vx * 2} height={vh + vx * 2} fill="var(--fp-bg)" />
            <rect width={vw + vx * 2} height={vh + vx * 2} fill="url(#grid-fp)" />

            {/* Corridors */}
            {corridors.map((c, i) => <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill="var(--fp-corr)" />)}

            {/* Room fills */}
            {rooms.map(r => (
                <g key={r.id}>
                    <rect x={r.x + W / 2} y={r.y + W / 2} width={r.w - W} height={r.h - W} fill={`${r.color}14`} />
                    <text x={r.x + r.w / 2} y={r.y + r.h / 2 - 10} textAnchor="middle" fontSize="13" dominantBaseline="middle">{r.icon}</text>
                    <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 4} textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--fp-text)" fontFamily="Inter,sans-serif">
                        {r.label}
                    </text>
                    {r.sub && <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 13.5} textAnchor="middle" fontSize="5.5" fill="var(--fp-subtext)" fontFamily="Inter,sans-serif">{r.sub}</text>}
                    <text x={r.x + 3} y={r.y + 8} fontSize="4.5" fill={r.color} fontFamily="Inter,sans-serif" fontWeight="700">{r.id}</text>
                </g>
            ))}

            {/* Outer wall */}
            <rect x={outer.x} y={outer.y} width={outer.w} height={outer.h} fill="none" stroke="var(--fp-wall)" strokeWidth={W + 1} strokeLinejoin="miter" />

            {/* Interior room divider walls */}
            {rooms.map(r => <rect key={`w-${r.id}`} x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="var(--fp-wall)" strokeWidth={W} strokeLinejoin="miter" />)}

            {/* Stair blocks */}
            {(stairs || []).map((s, i) => (
                <g key={i}>
                    <rect x={s.x} y={s.y} width={s.w} height={s.h} fill="url(#hatch)" />
                    <rect x={s.x} y={s.y} width={s.w} height={s.h} fill="none" stroke="var(--fp-wall)" strokeWidth={4} />
                    {Array.from({ length: Math.floor(s.h / 8) }).map((_, j) => (
                        <line key={j} x1={s.x} y1={s.y + j * 8} x2={s.x + s.w} y2={s.y + j * 8} stroke="var(--fp-hatch)" strokeWidth="0.7" />
                    ))}
                    <text x={s.x + s.w / 2} y={s.y + s.h / 2} textAnchor="middle" fontSize="6" fill="var(--fp-subtext)" fontFamily="Inter,sans-serif">STAIRS</text>
                </g>
            ))}

            {/* Structural columns */}
            {(cols || []).map(([cx, cy], i) => <rect key={i} x={cx - 5} y={cy - 5} width={10} height={10} fill="var(--fp-wall)" />)}

            {/* Windows */}
            {(windows || []).map((w, i) => <Win key={i} w={w} />)}

            {/* Doors */}
            {(doors || []).map((d, i) => <Door key={i} d={d} />)}

            {/* North arrow */}
            <g transform={`translate(${vw - 18},18)`}>
                <circle cx={0} cy={0} r={14} fill="var(--fp-bg)" stroke="var(--fp-wall)" strokeWidth={1} />
                <polygon points="0,-11 2.5,4 0,0 -2.5,4" fill="var(--fp-wall)" />
                <polygon points="0,11 2.5,-4 0,0 -2.5,-4" fill="var(--fp-grid)" />
                <text textAnchor="middle" y="-2" fontSize="5.5" fontWeight="800" fill="var(--fp-wall)" fontFamily="Inter">N</text>
            </g>

            {/* Title block */}
            <text x={outer.x} y={vw > 400 ? vh - 8 : vh - 6} fontSize="6.5" fontWeight="700" fill="var(--fp-text)" fontFamily="Inter">{plan.name} — {floor.label}</text>
            <text x={outer.x + 200} y={vw > 400 ? vh - 8 : vh - 6} fontSize="6" fill="var(--fp-subtext)" fontFamily="Inter">Scale: {plan.scale}  |  Area: {plan.area}</text>

            {/* Scale bar */}
            <g transform={`translate(${outer.x},${vh - 2})`}>
                <line x1={0} y1={0} x2={50} y2={0} stroke="var(--fp-wall)" strokeWidth={1.5} />
                <line x1={0} y1={-3} x2={0} y2={3} stroke="var(--fp-wall)" strokeWidth={1.5} />
                <line x1={50} y1={-3} x2={50} y2={3} stroke="var(--fp-wall)" strokeWidth={1.5} />
                <text x={25} y={-5} textAnchor="middle" fontSize="5" fill="var(--fp-subtext)" fontFamily="Inter">10m</text>
            </g>
        </svg>
    );
}

// ─── OBLIQUE 3D MAP ───────────────────────────────────────────────
const GS = 30;   // px per grid unit
const OX = 0.52, OY = 0.70; // oblique skew factors

function darkenHex(hex, amt) {
    if (!hex.startsWith('#')) return hex;
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, (n >> 16) - amt * 2), g = Math.max(0, ((n >> 8) & 0xff) - amt * 2), b = Math.max(0, (n & 0xff) - amt * 2);
    return `rgb(${r},${g},${b})`;
}
function toHex(n) { return n.toString(16).padStart(2, '0'); }
function lightenHex(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, (n >> 16) + a * 2), g = Math.min(255, ((n >> 8) & 0xff) + a * 2), b = Math.min(255, (n & 0xff) + a * 2);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function Map3D({ buildings, selected, onSelect }) {
    const [hov, setHov] = useState(null);
    const OFFX = 70, OFFY = 30;

    const gp = (gx, gy) => [OFFX + gx * GS, OFFY + gy * GS];
    const lift = ([sx, sy], h) => [sx + h * OX, sy - h * OY];

    const renderBuilding = (b) => {
        const isSel = selected?.id === b.id, isHov = hov === b.id;
        const H = (isSel ? b.h + 14 : b.h);
        const [x0, y0] = gp(b.gx, b.gy);
        const W = b.gw * GS, D = b.gd * GS;

        // 4 footprint corners: TL, TR, BR, BL (top-left = north-west)
        const TL = [x0, y0], TR = [x0 + W, y0], BR = [x0 + W, y0 + D], BL = [x0, y0 + D];
        // Roof: lift each by H
        const TL_r = lift(TL, H), TR_r = lift(TR, H), BR_r = lift(BR, H), BL_r = lift(BL, H);

        const pts = ps => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

        const roofC = isSel ? lightenHex(b.color, 15) : b.color;
        const frontC = darkenHex(b.color, 25);
        const sideC = darkenHex(b.color, 48);

        // Window grid on south (front) face
        const fH = BL[1] - BL_r[1], fW = BR[0] - BL[0];
        const wRows = Math.max(1, Math.floor(H / 24)), wCols = Math.max(1, Math.floor(b.gw * GS / 22));

        return (
            <g key={b.id} onClick={() => onSelect(b)}
                onMouseEnter={() => setHov(b.id)} onMouseLeave={() => setHov(null)}
                style={{ cursor: 'pointer' }}>
                {/* Ground shadow */}
                <polygon points={pts([BL, BR, TR, TL])} fill="rgba(0,0,0,0.12)" transform="translate(4,5)" />
                {/* Footprint on ground */}
                <polygon points={pts([TL, TR, BR, BL])} fill={`${b.color}12`} stroke={`${b.color}35`} strokeWidth="0.8" />
                {/* Front face (south) */}
                <polygon points={pts([BL, BR, BR_r, BL_r])} fill={frontC} stroke="rgba(0,0,0,0.18)" strokeWidth={isSel ? 1.5 : 0.5} />
                {/* Right face (east) */}
                <polygon points={pts([BR, TR, TR_r, BR_r])} fill={sideC} stroke="rgba(0,0,0,0.18)" strokeWidth={isSel ? 1.5 : 0.5} />
                {/* Roof */}
                <polygon points={pts([TL_r, TR_r, BR_r, BL_r])} fill={roofC}
                    stroke={isSel ? '#fff' : darkenHex(b.color, 15)} strokeWidth={isSel ? 2 : 0.8} />
                {/* Windows on front face */}
                {Array.from({ length: wRows }).map((_, r) =>
                    Array.from({ length: wCols }).map((_, c) => {
                        const wx = BL[0] + 5 + c * (fW / wCols);
                        const wy = BL_r[1] + 5 + r * (fH / wRows);
                        const ww = Math.max(3, fW / wCols - 6), wh = Math.max(3, fH / wRows - 6);
                        return <rect key={`w${r}${c}`} x={wx} y={wy} width={ww} height={wh}
                            fill="rgba(147,210,255,0.4)" rx="1" stroke="rgba(147,210,255,0.15)" strokeWidth="0.5" />;
                    })
                )}
                {/* Roof label */}
                <text x={(TL_r[0] + BR_r[0]) / 2} y={(TL_r[1] + BR_r[1]) / 2 + 2} textAnchor="middle"
                    fontSize={isSel ? 8 : 7} fill={isSel ? '#fff' : 'rgba(255,255,255,0.85)'}
                    fontFamily="Inter,sans-serif" fontWeight="700" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    {b.icon}{isSel ? ` ${b.label}` : ''}
                </text>
                {/* Hover tooltip */}
                {isHov && !isSel && (
                    <text x={(TL_r[0] + BR_r[0]) / 2} y={(TL_r[1] + BR_r[1]) / 2 + 2} textAnchor="middle" fontSize="7"
                        fill="rgba(255,255,255,0.9)" fontFamily="Inter,sans-serif" fontWeight="700" style={{ pointerEvents: 'none' }}>
                        {b.label}
                    </text>
                )}
            </g>
        );
    };

    const sorted = [...buildings].sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));
    const mapW = 19 * GS + OFFX + 80, mapH = 16 * GS + OFFY + 60;

    return (
        <svg viewBox={`0 0 ${mapW} ${mapH}`} className="campus-svg">
            <defs>
                <linearGradient id="ground3d" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--bg-2)" />
                    <stop offset="100%" stopColor="var(--bg)" />
                </linearGradient>
            </defs>
            <rect width={mapW} height={mapH} fill="url(#ground3d)" />

            {/* Ground grid */}
            {[...Array(17)].map((_, i) => <line key={`gh${i}`} x1={OFFX} y1={OFFY + i * GS} x2={OFFX + 18 * GS} y2={OFFY + i * GS} stroke="var(--border)" strokeWidth="0.5" />)}
            {[...Array(19)].map((_, i) => <line key={`gv${i}`} x1={OFFX + i * GS} y1={OFFY} x2={OFFX + i * GS} y2={OFFY + 15 * GS} stroke="var(--border)" strokeWidth="0.5" />)}

            {/* Road strips */}
            {[5, 8, 11].map(gx => <rect key={`rv${gx}`} x={OFFX + gx * GS} y={OFFY} width={GS} height={15 * GS} fill="rgba(100,90,80,0.18)" />)}
            {[6, 9, 12].map(gy => <rect key={`rh${gy}`} x={OFFX} y={OFFY + gy * GS} width={18 * GS} height={GS} fill="rgba(100,90,80,0.18)" />)}

            {/* Road dashes */}
            {[5.5, 8.5, 11.5].map((gx, i) => {
                const x = OFFX + gx * GS;
                return [...Array(15)].map((_, j) => <line key={`rd${i}${j}`} x1={x} y1={OFFY + j * GS + 5} x2={x} y2={OFFY + j * GS + GS - 5} stroke="rgba(200,190,170,0.4)" strokeWidth="1" strokeDasharray="4,4" />);
            })}

            {/* Trees */}
            {[[6.5, 5.5], [6.5, 7.5], [6.5, 10.5], [9.5, 5.5], [12.5, 5.5], [12.5, 10.5]].map(([gx, gy], i) => {
                const [sx, sy] = [OFFX + gx * GS, OFFY + gy * GS];
                return <g key={i}>
                    <ellipse cx={sx} cy={sy + 4} rx={8} ry={4} fill="rgba(34,197,94,0.2)" />
                    <circle cx={sx} cy={sy - 4} r={8} fill="rgba(34,197,94,0.55)" />
                    <circle cx={sx} cy={sy - 9} r={5} fill="rgba(22,163,74,0.65)" />
                </g>;
            })}

            {/* Buildings */}
            {sorted.map(renderBuilding)}

            {/* Compass rose */}
            <g transform={`translate(${mapW - 34},34)`}>
                <circle r={22} fill="var(--bg-1)" stroke="var(--border-strong)" strokeWidth="1" />
                <polygon points="0,-17 3,0 0,-4 -3,0" fill="#EF4444" />
                <polygon points="0,17 3,0 0,4 -3,0" fill="var(--text-3)" />
                <text textAnchor="middle" y="-6" fontSize="7" fill="var(--text)" fontFamily="Inter" fontWeight="700">N</text>
                <text textAnchor="middle" y="14" fontSize="7" fill="var(--text-3)" fontFamily="Inter">S</text>
            </g>

            {/* Legend card */}
            <g transform={`translate(${OFFX},${mapH - 52})`}>
                <rect width="230" height="46" rx="8" fill="var(--bg-1)" fillOpacity="0.92" stroke="var(--border-strong)" strokeWidth="1" />
                <text x="10" y="16" fontSize="8" fontWeight="700" fill="var(--text)" fontFamily="Inter">SMART CAMPUS — 3D BLOCK VIEW</text>
                <text x="10" y="30" fontSize="7" fill="var(--text-2)" fontFamily="Inter">Click building → Floor Plan + AR Navigate</text>
                <text x="10" y="42" fontSize="6.5" fill="var(--text-3)" fontFamily="Inter">Hover to preview building name</text>
            </g>
        </svg>
    );
}

// ─── 2D FLAT MAP ─────────────────────────────────────────────────
const FLAT = [
    // --- TOP WING ---
    { id: 'block_a', label: 'Block A (Admin)', icon: '🏛️', x: 60, y: 50, w: 90, h: 70, color: '#94a3b8' },
    { id: 'block_b', label: 'Block B (Arch)', icon: '🏗️', x: 170, y: 50, w: 80, h: 70, color: '#bbf7d0' },
    { id: 'block_c', label: 'Block C (CS)', icon: '💻', x: 270, y: 50, w: 90, h: 70, color: '#fecdd3' },
    { id: 'block_d', label: 'Block D (Library)', icon: '📚', x: 380, y: 50, w: 70, h: 70, color: '#e9d5ff' },

    // --- RIGHT WING ---
    { id: 'block_e', label: 'Block E (Elec)', icon: '⚡', x: 470, y: 50, w: 80, h: 70, color: '#fef08a' },
    { id: 'block_f', label: 'Block F (E&C)', icon: '📻', x: 470, y: 140, w: 80, h: 80, color: '#ffedd5' },
    { id: 'block_g', label: 'Block G (IC)', icon: '🎛️', x: 470, y: 240, w: 80, h: 70, color: '#fbcfe8' },
    { id: 'block_h', label: 'Block H (IT)', icon: '🌐', x: 470, y: 330, w: 80, h: 80, color: '#a7f3d0' },

    // --- BOTTOM WING ---
    { id: 'block_ij', label: 'Block I/J (Chem)', icon: '🧪', x: 370, y: 340, w: 80, h: 70, color: '#dcfce7' },
    { id: 'block_k', label: 'Block K (Science)', icon: '🔬', x: 270, y: 340, w: 80, h: 70, color: '#bbf7d0' },
    { id: 'block_l', label: 'Block L (Textile)', icon: '🧵', x: 160, y: 340, w: 90, h: 70, color: '#fecdd3' },

    // --- OTHERS ---
    { id: 'tifac', label: 'TIFAC Core', icon: '🏢', x: 60, y: 340, w: 80, h: 70, color: '#e2e8f0' },
    { id: 'center_stage', label: 'Amphitheater', icon: '🎭', x: 230, y: 180, w: 140, h: 100, color: '#f8fafc' },
];

const FPATHS = [
    // Main courtyard loop
    [[110, 140], [450, 140]],
    [[450, 140], [450, 320]],
    [[450, 320], [110, 320]],
    [[110, 320], [110, 140]],
    // Connections from loop to amphitheater center
    [[300, 140], [300, 180]],
    [[300, 320], [300, 280]],
    [[450, 230], [370, 230]],
];

function Flat2D({ selected, onSelect }) {
    return (
        <svg viewBox="0 0 600 450" className="campus-svg">
            <rect width="600" height="450" fill="var(--bg)" />
            {[...Array(10)].map((_, i) => <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} stroke="var(--border)" strokeWidth="1" />)}
            {[...Array(12)].map((_, i) => <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="450" stroke="var(--border)" strokeWidth="1" />)}
            {FPATHS.map((p, i) => <line key={i} x1={p[0][0]} y1={p[0][1]} x2={p[1][0]} y2={p[1][1]} stroke="var(--bg-4)" strokeWidth="8" strokeLinecap="round" />)}
            {FLAT.map(b => {
                const full = BUILDINGS.find(x => x.id === b.id);
                const s = selected?.id === b.id;
                return <g key={b.id} onClick={() => full && onSelect(full)} style={{ cursor: 'pointer' }}>
                    <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="8" fill={s ? b.color : `${b.color}18`} stroke={b.color} strokeWidth={s ? 2.5 : 1.5} style={{ filter: s ? `drop-shadow(0 0 10px ${b.color}80)` : 'none', transition: 'all 0.2s' }} />
                    <text x={b.x + b.w / 2} y={b.y + b.h / 2 - 7} textAnchor="middle" fontSize="13" dominantBaseline="middle">{b.icon}</text>
                    <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 9} textAnchor="middle" fontSize="8" fill={s ? 'white' : 'var(--text-2)'} fontFamily="Inter,sans-serif" fontWeight="600">{b.label}</text>
                </g>;
            })}
            <g transform="translate(555,40)">
                <circle cx={0} cy={0} r={20} fill="var(--bg-2)" stroke="var(--border-strong)" strokeWidth="1" />
                <text textAnchor="middle" y="-6" fontSize="7" fill="var(--text)" fontFamily="Inter">N</text>
                <polygon points="0,-12 3,0 0,-2 -3,0" fill="#EF4444" />
                <polygon points="0,12 3,0 0,2 -3,0" fill="var(--text-3)" />
            </g>
        </svg>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────
export default function CampusMap() {
    const navigate = useNavigate();
    const [view, setView] = useState('3d');
    const [selected, setSelected] = useState(null);
    const [floor, setFloor] = useState(0);
    const [startNode, setStartNode] = useState('');
    const [endNode, setEndNode] = useState('');
    const [navigation, setNavigation] = useState(null);
    const [walking, setWalking] = useState(false);
    const [userPos, setUserPos] = useState(null);
    const [search, setSearch] = useState('');
    const [dbLoc, setDbLoc] = useState([]);

    const archPlan = selected ? ARCH_PLANS[selected.id] : null;

    useEffect(() => {
        getLocations().then(res => setDbLoc(res.data || [])).catch(() => { });
    }, []);

    const pick = (b) => {
        setSelected(b);
        setFloor(0);
        clearNav();
    };

    const clearNav = () => {
        setNavigation(null);
        setStartNode('');
        setEndNode('');
        setWalking(false);
        setUserPos(null);
    };

    const handleNavigate = () => {
        if (!startNode || !endNode) return;
        const graph = NAV_GRAPHS[selected.id];
        if (!graph) return;

        const path = findPath(graph, startNode, endNode);
        if (!path || path.length < 2) return;

        const instructions = generateInstructions(path);
        const dist = calculateDistance(path);

        setNavigation({
            path,
            instructions,
            distance: dist,
            time: Math.ceil(dist / 1.4 / 60) // 1.4 m/s walking speed
        });
        setUserPos(path[0]);
    };

    const launchAR = () => navigate(selected ? `/ar-navigation?dest=${selected.id}&label=${encodeURIComponent(selected.label)}` : '/ar-navigation');
    // const archPlan = selected ? (ARCH_PLANS[selected.id] || DFLT_PLAN) : DFLT_PLAN; // Moved up
    const filtered = BUILDINGS.filter(b => !search || b.label.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="map-page page">
            <div className="map-layout">
                <aside className="map-sidebar">
                    <h2>🗺️ Campus Map</h2>
                    <div className="map-view-toggle">
                        <button className={`view-btn ${view === 'fp' ? 'active' : ''}`} onClick={() => setView('fp')}>📐 Plans</button>
                        <button className={`view-btn ${view === '3d' ? 'active' : ''}`} onClick={() => setView('3d')}>🏙️ 3D</button>
                        <button className={`view-btn ${view === '2d' ? 'active' : ''}`} onClick={() => setView('2d')}>🗺️ 2D</button>
                    </div>

                    <input className="map-search-input" placeholder="Search buildings…" value={search} onChange={e => setSearch(e.target.value)} />

                    {selected ? (
                        <div className="map-sel-card card card-p-sm" style={{ borderLeft: `3px solid ${selected.color}` }}>
                            <div className="flex-between">
                                <div className="flex gap-8" style={{ alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.4rem' }}>{selected.icon}</span>
                                    <div>
                                        <div className="font-semibold text-sm">{selected.label}</div>
                                        <div className="text-xs text-3">{selected.floors} floor{selected.floors > 1 ? 's' : ''} · {archPlan?.area || 'N/A'}</div>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelected(null)}>✕</button>
                            </div>
                            <p className="text-xs text-2" style={{ marginTop: '4px' }}>{selected.desc}</p>
                            <div className="sel-actions">
                                <button className="btn btn-secondary btn-sm" onClick={() => setView('fp')}>📐 Floor Plan</button>
                                <button className="btn btn-primary btn-sm" onClick={launchAR}>🔮 AR Nav</button>
                            </div>
                        </div>
                    ) : (
                        <div className="map-no-sel card card-p-sm text-center">
                            <div style={{ fontSize: '1.5rem' }}>👆</div>
                            <p className="text-xs text-3">Click a building to explore its floor plan and AR navigate</p>
                        </div>
                    )}

                    {view === 'fp' && selected && archPlan?.floors?.length > 1 && (
                        <div className="fp-sidebar-floors">
                            <div className="loc-list-head">Floor</div>
                            {archPlan.floors.map((f, i) => (
                                <button key={i} className={`fp-sidebar-floor-btn ${floor === i ? 'active' : ''}`} onClick={() => setFloor(i)}>
                                    {i === 0 ? 'G' : i}F  ·  {f.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="loc-list-head">Buildings ({filtered.length})</div>
                    <div className="loc-list">
                        {filtered.map(b => (
                            <div key={b.id} className={`loc-list-row ${selected?.id === b.id ? 'active' : ''}`} onClick={() => pick(b)}>
                                <span>{b.icon} {b.label}</span><span className="tag">{b.floors}F</span>
                            </div>
                        ))}
                    </div>

                    {dbLoc.length > 0 && <>
                        <div className="loc-list-head">Rooms ({dbLoc.length})</div>
                        <div className="loc-list">
                            {dbLoc.filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6).map(l => (
                                <div key={l.id} className="loc-list-row"><span>📍 {l.name}</span><span className="tag">{l.type}</span></div>
                            ))}
                        </div>
                    </>}

                    {selected && (view === 'fp' || view === '2d' || view === '3d') && (
                        <div className="nav-controls card card-p">
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">🧭 Indoor Navigation</h3>
                            <div className="nav-field">
                                <label>From (Room):</label>
                                <select value={startNode} onChange={e => setStartNode(e.target.value)} className="input-field text-xs">
                                    <option value="">Select starting room...</option>
                                    {(NAV_GRAPHS[selected.id]?.nodes || []).map(n => (
                                        <option key={n.id} value={n.id}>{n.label || n.id} (Floor {n.floor})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="nav-field">
                                <label>To (Room):</label>
                                <select value={endNode} onChange={e => setEndNode(e.target.value)} className="input-field text-xs">
                                    <option value="">Select destination...</option>
                                    {(NAV_GRAPHS[selected.id]?.nodes || []).filter(n => n.type === 'room').map(n => (
                                        <option key={n.id} value={n.id}>{n.label || n.id} (Floor {n.floor})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button className="btn btn-primary flex-1 btn-sm" onClick={handleNavigate} disabled={!startNode || !endNode}>Start Navigation</button>
                                <button className="btn btn-secondary btn-sm" onClick={clearNav}>Clear</button>
                            </div>
                        </div>
                    )}
                </aside>

                <div className="map-container">
                    {view === 'fp' ? (
                        <div className="fp-full-view">
                            {!selected ? (
                                <div className="fp-no-sel">
                                    <div style={{ fontSize: '4rem' }}>👆</div>
                                    <h2>Architectural Floor Plans</h2>
                                    <p>Select a building from the sidebar or click below</p>
                                    <div className="fp-building-grid">
                                        {BUILDINGS.filter(b => ARCH_PLANS[b.id]).map(b => (
                                            <button key={b.id} className="fp-building-tile card card-p" onClick={() => pick(b)}>
                                                <span style={{ fontSize: '2rem' }}>{b.icon}</span>
                                                <span className="font-semibold text-sm">{b.label}</span>
                                                <span className="text-xs text-3">{ARCH_PLANS[b.id].floors.length} floors · {ARCH_PLANS[b.id].area}</span>
                                                <span className="badge badge-brand" style={{ fontSize: '0.63rem' }}>Plans Available</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="fp-viewer">
                                    <div className="fp-viewer-header">
                                        <div className="fp-legend-items">
                                            <div className="fp-legend-item2"><span className="fp-swatch" style={{ background: 'var(--brand)', opacity: .15 }} /><span>Room</span></div>
                                            <div className="fp-legend-item2"><svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke="var(--text)" strokeWidth="3.5" /></svg><span>Wall</span></div>
                                            <div className="fp-legend-item2"><svg width="22" height="8"><line x1="0" y1="2" x2="22" y2="2" stroke="#0EA5E9" strokeWidth="3.5" /><line x1="0" y1="6" x2="22" y2="6" stroke="#0EA5E9" strokeWidth="3.5" /></svg><span>Window</span></div>
                                            <div className="fp-legend-item2"><svg width="22" height="14"><line x1="0" y1="0" x2="12" y2="0" stroke="var(--text)" strokeWidth="1.5" /><path d="M0,0 A12,12 0 0,1 12,12" fill="none" stroke="var(--text)" strokeWidth="0.9" strokeDasharray="2,1" /></svg><span>Door</span></div>
                                            <div className="fp-legend-item2"><svg width="16" height="12"><rect width="16" height="12" fill="none" stroke="var(--text)" strokeWidth="1" /><line x1="0" y1="12" x2="16" y2="0" stroke="var(--text)" strokeWidth="1" /><line x1="0" y1="8" x2="8" y2="0" stroke="var(--text)" strokeWidth="0.8" /></svg><span>Stairs</span></div>
                                            <div className="fp-legend-item2"><svg width="12" height="12"><rect x="1" y="1" width="10" height="10" fill="var(--text)" /></svg><span>Column</span></div>
                                        </div>
                                        <button className="btn btn-primary btn-sm" onClick={launchAR}>🔮 AR Navigate to {selected.label}</button>
                                    </div>
                                    <div className="fp-scroll-wrap">
                                        <FloorPlanSVG plan={archPlan} fi={floor} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : view === '3d' ? (
                        <Map3D buildings={filtered} selected={selected} onSelect={b => { pick(b); }} />
                    ) : (
                        <Flat2D selected={selected} onSelect={pick} />
                    )}
                </div>
            </div>
        </div>
    );
}
