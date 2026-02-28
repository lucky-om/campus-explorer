import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getLiveEvents, getLocations } from '../services/api';
import './Landing.css';

const features = [
    { icon: '🔮', title: 'AR Navigation', desc: 'Point camera. Follow arrows. Reach your destination.', path: '/ar-navigation', color: '#5B4FE9' },
    { icon: '🌐', title: '360° Virtual Tour', desc: 'Immersive panoramic tour of labs, library, and departments.', path: '/virtual-tour', color: '#0EA5E9' },
    { icon: '🤖', title: 'AI Campus Copilot', desc: 'Ask anything — directions, staff, events, placement stats.', path: '/ai-assistant', color: '#10B981' },
    { icon: '🗺️', title: 'Interactive Map', desc: 'Click any building on our smart SVG campus map.', path: '/campus-map', color: '#F59E0B' },
    { icon: '🚨', title: 'Emergency Mode', desc: 'One-tap security calls, nearest exit, flashlight.', path: '/emergency', color: '#EF4444' },
    { icon: '👥', title: 'Visitor Tour', desc: 'Guided 8-stop campus walkthrough for students & parents.', path: '/visitor-tour', color: '#8B5CF6' },
];

const stats = [
    { val: '25+', lbl: 'Acres Campus' },
    { val: '2800+', lbl: 'Students' },
    { val: '24', lbl: 'Labs' },
    { val: '180+', lbl: 'Faculty' },
];

export default function Landing() {
    const navigate = useNavigate();
    const [liveEvents, setLiveEvents] = useState([]);
    const [locationCount, setLocationCount] = useState(0);

    useEffect(() => {
        getLiveEvents().then(r => setLiveEvents(r.data)).catch(() => { });
        getLocations().then(r => setLocationCount(r.data.length)).catch(() => { });
    }, []);

    return (
        <div className="landing page">
            {/* Live event banner */}
            {liveEvents.length > 0 && (
                <div className="live-banner">
                    <span className="live-dot" />
                    <span>Live: <strong>{liveEvents[0].title}</strong> at {liveEvents[0].location}</span>
                    <Link to="/campus-map">View on Map →</Link>
                </div>
            )}

            {/* Hero */}
            <section className="hero-section">
                <div className="hero-bg">
                    <div className="hero-blob blob-1" />
                    <div className="hero-blob blob-2" />
                    <div className="hero-grid-bg" />
                </div>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '80px' }}>
                    <div className="hero-content anim-fade-up">
                        <div className="hero-kicker">🏆 Computer Engineering Hackathon</div>
                        <h1 className="hero-title">
                            Smart Campus <span className="gradient-text">Explorer</span>
                        </h1>
                        <p className="hero-desc">
                            Navigate campus with AR arrows, explore via 360° tours, get instant AI help, and never get lost again.
                        </p>
                        <div className="hero-cta">
                            <button className="btn btn-primary btn-lg" onClick={() => navigate('/ar-navigation')}>
                                🔮 Start AR Navigation
                            </button>
                            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/visitor-tour')}>
                                Take a Tour
                            </button>
                        </div>
                        <div className="hero-qr-hint">
                            <span>📱</span>
                            <span>Scan QR at campus gate to launch instantly</span>
                        </div>
                    </div>
                    <div className="hero-visual hide-mobile">
                        <div className="phone">
                            <div className="phone-screen">
                                <div className="phone-scanlines" />
                                <div className="phone-arrow">▶</div>
                                <div className="phone-label">Computer Lab → 120m</div>
                                <div className="phone-dist">Follow the arrow</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <div className="stats-row">
                <div className="stats-grid">
                    {[...stats, { val: `${locationCount}+`, lbl: 'Mapped Locations' }].map((s, i) => (
                        <div key={i} className="stat-item">
                            <div className="stat-val">{s.val}</div>
                            <div className="stat-lbl">{s.lbl}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features */}
            <section className="features-section">
                <div className="container section">
                    <div className="section-head">
                        <h2>Everything on <span className="gradient-text">One Platform</span></h2>
                        <p>From AR navigation to AI assistance — the most complete campus experience built.</p>
                    </div>
                    <div className="features-grid">
                        {features.map((f, i) => (
                            <Link
                                to={f.path} key={i}
                                className="feat-card card"
                                style={{ '--feat-clr': f.color }}
                            >
                                <div className="feat-icon-box" style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                                    {f.icon}
                                </div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                                <span className="feat-arrow" style={{ color: f.color }}>→</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modes */}
            <section className="modes-section">
                <div className="container section">
                    <div className="section-head text-center" style={{ margin: '0 auto 48px', maxWidth: '500px' }}>
                        <h2>Choose Your <span className="gradient-text">Experience</span></h2>
                    </div>
                    <div className="modes-grid" style={{ maxWidth: '860px', margin: '0 auto' }}>
                        <div className="mode-card" onClick={() => navigate('/campus-map')}>
                            <div className="mode-icon">🎓</div>
                            <h3>Student Mode</h3>
                            <p>Quick access to labs, classes, and campus services</p>
                            <button className="btn btn-secondary btn-sm">Explore →</button>
                        </div>
                        <div className="mode-card mode-card-featured" onClick={() => navigate('/visitor-tour')}>
                            <div className="mode-rec">Recommended</div>
                            <div className="mode-icon">👨‍👩‍👧‍👦</div>
                            <h3>Visitor Mode</h3>
                            <p>Guided tour for new students, parents & guests</p>
                            <button className="btn btn-primary btn-sm">Start Tour →</button>
                        </div>
                        <div className="mode-card" onClick={() => navigate('/admin')}>
                            <div className="mode-icon">⚙️</div>
                            <h3>Admin Mode</h3>
                            <p>Manage locations, events, and campus data</p>
                            <button className="btn btn-secondary btn-sm">Login →</button>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                🎓 SmartCampus Explorer · Computer Engineering Hackathon 2026
            </footer>
        </div>
    );
}
