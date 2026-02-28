import React, { useEffect, useRef, useState } from 'react';
import { getTours } from '../services/api';
import './VirtualTour.css';

export default function VirtualTour() {
    const [tours, setTours] = useState([]);
    const [selected, setSelected] = useState(null);
    const viewerRef = useRef(null);
    const pannellumRef = useRef(null);

    useEffect(() => {
        getTours().then(r => { setTours(r.data); if (r.data.length) setSelected(r.data[0]); }).catch(() => { });
    }, []);

    useEffect(() => {
        if (!selected) return;
        const init = () => {
            if (!window.pannellum || !viewerRef.current) return;
            try { if (pannellumRef.current) pannellumRef.current.destroy(); } catch { }
            const hotspots = JSON.parse(selected.hotspots || '[]').map((h, i) => ({ pitch: h.pitch || 0, yaw: h.yaw || 0, type: 'info', text: h.text, id: `hs${i}` }));
            pannellumRef.current = window.pannellum.viewer('panorama-viewer', {
                type: 'equirectangular',
                panorama: selected.panoramaUrl || 'https://pannellum.org/images/alma.jpg',
                autoLoad: true, autoRotate: -2, compass: true, hotSpots: hotspots, showControls: true, hfov: 100,
            });
        };
        if (!document.getElementById('pann-css')) {
            const l = document.createElement('link'); l.id = 'pann-css'; l.rel = 'stylesheet';
            l.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
            document.head.appendChild(l);
        }
        if (!window.pannellum) {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
            s.onload = init; document.head.appendChild(s);
        } else { init(); }
        return () => { try { pannellumRef.current?.destroy(); } catch { } };
    }, [selected]);

    const levels = ['campus', 'department', 'room'];
    const lvlLabel = { campus: '🏫 Campus', department: '🏢 Departments', room: '🚪 Rooms' };

    return (
        <div className="tour-page page">
            <div className="tour-layout">
                <aside className="tour-sidebar">
                    <div className="tour-sidebar-head">
                        <h2>360° Tour</h2>
                        <p>Explore campus spaces</p>
                    </div>
                    <div className="divider" />
                    {levels.map(lv => (
                        <div key={lv}>
                            <div className="level-group-head">{lvlLabel[lv]}</div>
                            {tours.filter(t => t.level === lv).map(t => (
                                <button key={t.id} className={`tour-item ${selected?.id === t.id ? 'active' : ''}`} onClick={() => setSelected(t)}>
                                    <span className="tour-item-dot" />
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    ))}
                </aside>
                <main className="tour-main">
                    {selected && (
                        <div className="tour-breadcrumb">
                            <span>Campus</span>
                            {selected.level !== 'campus' && <><span className="sep">›</span><span>{selected.level}</span></>}
                            <span className="sep">›</span>
                            <span className="crumb-active">{selected.name}</span>
                        </div>
                    )}
                    <div id="panorama-viewer" ref={viewerRef} />
                    {selected && (
                        <div className="tour-info">
                            <div className="tour-info-name">
                                <h3>{selected.name}</h3>
                                <span className="tag" style={{ marginTop: '2px' }}>{selected.level}</span>
                            </div>
                            <div className="tour-hotspots">
                                {JSON.parse(selected.hotspots || '[]').map((h, i) => <span key={i} className="hotspot-pill">{h.text}</span>)}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
