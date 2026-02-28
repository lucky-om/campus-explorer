import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getLocations, logSearch } from '../services/api';
import './ARNavigation.css';

const DESTS = [
    { id: 'cs-lab', label: 'Computer Lab', emoji: '💻', angle: 0, dist: 120 },
    { id: 'library', label: 'Library', emoji: '📚', angle: 45, dist: 85 },
    { id: 'canteen', label: 'Canteen', emoji: '🍽️', angle: 120, dist: 200 },
    { id: 'auditorium', label: 'Auditorium', emoji: '🎭', angle: 270, dist: 150 },
    { id: 'parking', label: 'Parking', emoji: '🅿️', angle: 200, dist: 250 },
    { id: 'washroom', label: 'Washroom', emoji: '🚻', angle: 30, dist: 40 },
];

export default function ARNavigation() {
    const [searchParams] = useSearchParams();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [camError, setCamError] = useState('');
    const [selected, setSelected] = useState(null);
    const [distance, setDistance] = useState(null);
    const [locations, setLocations] = useState([]);
    const angleRef = useRef(0);
    const distRef = useRef(0);

    useEffect(() => {
        getLocations().then(r => setLocations(r.data)).catch(() => { });
    }, []);

    const pick = (id, label, angle, dist) => {
        setSelected({ id, label, angle, dist });
        angleRef.current = angle;
        distRef.current = dist;
        setDistance(dist);
        logSearch(label).catch(() => { });
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setCameraActive(true);
            drawAR();
        } catch { setCamError('Camera access denied. Allow camera to use AR Navigation.'); }
    };

    const drawAR = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        let t = 0;
        const frame = () => {
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2, cy = canvas.height / 2;
            if (distRef.current > 5) { distRef.current -= 0.07; setDistance(Math.round(distRef.current)); }
            // Scanlines
            ctx.strokeStyle = 'rgba(14,165,233,0.05)';
            ctx.lineWidth = 1;
            for (let i = 0; i < canvas.height; i += 14) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }
            // Arrow
            const rad = ((angleRef.current - 90) * Math.PI) / 180;
            const bounce = Math.sin(t * 0.06) * 10;
            const ax = cx + Math.cos(rad) * (130 + bounce);
            const ay = cy + Math.sin(rad) * (130 + bounce);
            // Glow rings
            for (let r = 32; r >= 12; r -= 8) {
                ctx.beginPath(); ctx.arc(ax, ay, r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(91,79,233,${(32 - r) / 400})`; ctx.fill();
            }
            // Arrow shape
            ctx.save(); ctx.translate(ax, ay); ctx.rotate(rad + Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, -22); ctx.lineTo(12, 8); ctx.lineTo(5, 4); ctx.lineTo(5, 22); ctx.lineTo(-5, 22); ctx.lineTo(-5, 4); ctx.lineTo(-12, 8);
            ctx.closePath();
            ctx.fillStyle = '#fff'; ctx.shadowBlur = 18; ctx.shadowColor = '#5B4FE9'; ctx.fill(); ctx.restore();
            // Trail arrows
            [1, 2].forEach(i => {
                ctx.save(); ctx.globalAlpha = 0.3 / i;
                const ax2 = cx + Math.cos(rad) * (80 - i * 28 + bounce * 0.5);
                const ay2 = cy + Math.sin(rad) * (80 - i * 28 + bounce * 0.5);
                ctx.translate(ax2, ay2); ctx.rotate(rad + Math.PI / 2);
                ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(8, 5); ctx.lineTo(-8, 5); ctx.closePath();
                ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
            });
            // Label
            if (selected) {
                const lx = cx + Math.cos(rad) * 168, ly = cy + Math.sin(rad) * 168;
                ctx.save();
                const tw = ctx.measureText(selected.label).width;
                ctx.font = 'bold 13px Inter, sans-serif';
                ctx.fillStyle = 'rgba(0,0,0,0.65)';
                roundRect(ctx, lx - tw / 2 - 10, ly - 14, tw + 20, 28, 7); ctx.fill();
                ctx.strokeStyle = 'rgba(91,79,233,0.6)'; ctx.lineWidth = 1; ctx.stroke();
                ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(selected.label, lx, ly); ctx.restore();
            }
            // Crosshair
            ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
            [[cx - 22, cy, cx - 10, cy], [cx + 10, cy, cx + 22, cy], [cx, cy - 22, cx, cy - 10], [cx, cy + 10, cx, cy + 22]].forEach(([x1, y1, x2, y2]) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); });
            t++; animRef.current = requestAnimationFrame(frame);
        };
        frame();
    };

    const roundRect = (ctx, x, y, w, h, r) => {
        ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
    };

    useEffect(() => () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }, []);

    if (!cameraActive) return (
        <div className="ar-page page">
            <div className="ar-start">
                <div className="ar-start-card card card-p-lg">
                    <div className="ar-icon">🔮</div>
                    <h1>AR Navigation</h1>
                    <p>Select your destination, then tap below to enable the camera and follow the AR arrows.</p>
                    {camError && <div className="alert alert-error">{camError}</div>}
                    <div className="ar-dest-grid">
                        {DESTS.map(d => (
                            <button key={d.id} className={`ar-dest-btn ${selected?.id === d.id ? 'selected' : ''}`}
                                onClick={() => pick(d.id, d.label, d.angle, d.dist)}>
                                <span className="dest-emoji">{d.emoji}</span>
                                <span>{d.label}</span>
                                {selected?.id === d.id && <span className="dest-dist">{d.dist}m</span>}
                            </button>
                        ))}
                    </div>
                    <button className="btn btn-primary btn-lg w-full" onClick={startCamera}>📷 Enable Camera & Start AR</button>
                    <p className="ar-hint">Works best on mobile with rear camera</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="ar-page">
            <video ref={videoRef} className="ar-video" autoPlay playsInline muted />
            <canvas ref={canvasRef} className="ar-canvas" />
            <div className="ar-hud">
                <div className="ar-hud-info">
                    {selected && (
                        <div className="ar-info-card">
                            <div className="ar-dest-name">📍 {selected.label}</div>
                            <div className="ar-dest-km">{distance}m</div>
                            <div className="ar-dist-bar"><div className="ar-dist-progress" style={{ width: `${Math.max(5, 100 - (distance / selected.dist) * 100)}%` }} /></div>
                        </div>
                    )}
                </div>
                <div className="ar-controls-wrap">
                    {DESTS.map(d => (
                        <button key={d.id} className={`ar-ctrl ${selected?.id === d.id ? 'active' : ''}`}
                            onClick={() => pick(d.id, d.label, d.angle, d.dist)}>
                            {d.emoji} {d.label}
                        </button>
                    ))}
                </div>
            </div>
            {distance <= 10 && (
                <div className="ar-arrived">
                    <div className="ar-arrived-inner">
                        <div style={{ fontSize: '3rem' }}>🎯</div>
                        <h2>Arrived!</h2>
                        <p>You've reached <strong style={{ color: '#fff' }}>{selected?.label}</strong></p>
                    </div>
                </div>
            )}
        </div>
    );
}
