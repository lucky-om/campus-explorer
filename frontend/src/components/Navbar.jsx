import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import './Navbar.css';

const navLinks = [
    { path: '/ar-navigation', label: 'AR Nav', icon: '🔮' },
    { path: '/virtual-tour', label: '360° Tour', icon: '🌐' },
    { path: '/ai-assistant', label: 'AI Copilot', icon: '🤖' },
    { path: '/campus-map', label: 'Map', icon: '🗺️' },
    { path: '/emergency', label: 'Emergency', icon: '🚨' },
];

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAdmin, logout } = useStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Theme state — persisted in localStorage, applied to <html>
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('campus_theme');
        return saved || 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('campus_theme', theme);
    }, [theme]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    return (
        <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-inner">
                {/* Brand */}
                <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
                    <span className="brand-logo">🎓</span>
                    <span className="brand-name">SmartCampus</span>
                </Link>

                {/* Desktop links */}
                <div className="navbar-links">
                    {navLinks.map(l => (
                        <Link
                            key={l.path}
                            to={l.path}
                            className={`nav-link ${location.pathname === l.path ? 'active' : ''}`}
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>

                {/* Right actions */}
                <div className="navbar-actions">
                    {/* Theme toggle */}
                    <button
                        className="btn btn-icon btn-ghost theme-toggle"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>

                    {isAdmin ? (
                        <>
                            <Link
                                to="/admin"
                                className={`btn btn-ghost btn-sm ${location.pathname === '/admin' ? 'active' : ''}`}
                            >
                                Admin
                            </Link>
                            <button className="btn btn-secondary btn-sm" onClick={() => { logout(); navigate('/'); }}>Logout</button>
                        </>
                    ) : (
                        <Link to="/admin" className="btn btn-primary btn-sm">Admin</Link>
                    )}

                    {/* Hamburger */}
                    <button
                        className={`hamburger ${menuOpen ? 'open' : ''}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menu"
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="mobile-menu">
                    {navLinks.map(l => (
                        <Link
                            key={l.path}
                            to={l.path}
                            className={`mobile-link ${location.pathname === l.path ? 'active' : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            <span>{l.icon}</span>{l.label}
                        </Link>
                    ))}
                    <div className="divider" />
                    <Link to="/visitor-tour" className="mobile-link" onClick={() => setMenuOpen(false)}>
                        <span>👥</span>Visitor Tour
                    </Link>
                    {isAdmin
                        ? <Link to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}><span>⚙️</span>Dashboard</Link>
                        : <Link to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}><span>🔐</span>Admin Login</Link>
                    }
                </div>
            )}
        </nav>
    );
}
