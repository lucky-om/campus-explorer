import React, { useEffect, useState } from 'react';
import { adminLogin, getLocations, addLocation, deleteLocation, getEvents, addEvent, updateEvent, deleteEvent, getTours, deleteTour, getAnalytics } from '../services/api';
import useStore from '../store/useStore';
import './AdminDashboard.css';

const TABS = ['Locations', 'Events', 'Tours', 'Analytics'];

export default function AdminDashboard() {
    const { isAdmin, setToken, logout } = useStore();
    const [loginForm, setLoginForm] = useState({ username: 'admin', password: '' });
    const [loginErr, setLoginErr] = useState('');
    const [tab, setTab] = useState('Locations');
    const [locations, setLocations] = useState([]);
    const [events, setEvents] = useState([]);
    const [tours, setTours] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [locForm, setLocForm] = useState({ name: '', type: 'lab', floor: '1', building: '', description: '', lat: '', lng: '' });
    const [evtForm, setEvtForm] = useState({ title: '', location: '', startTime: '', endTime: '', isLive: false, description: '' });
    const [loading, setLoading] = useState(false);
    const [flash, setFlash] = useState('');

    useEffect(() => { if (isAdmin) loadAll(); }, [isAdmin]);

    const loadAll = () => {
        getLocations().then(r => setLocations(r.data)).catch(() => { });
        getEvents().then(r => setEvents(r.data)).catch(() => { });
        getTours().then(r => setTours(r.data)).catch(() => { });
        getAnalytics().then(r => setAnalytics(r.data)).catch(() => { });
    };
    const msg = (m) => { setFlash(m); setTimeout(() => setFlash(''), 3000); };

    const doLogin = async (e) => {
        e.preventDefault(); setLoginErr(''); setLoading(true);
        try { const r = await adminLogin(loginForm.username, loginForm.password); setToken(r.data.token); }
        catch { setLoginErr('Invalid username or password'); }
        setLoading(false);
    };
    const addLoc = async (e) => { e.preventDefault(); try { await addLocation(locForm); loadAll(); msg('Location added!'); setLocForm({ name: '', type: 'lab', floor: '1', building: '', description: '', lat: '', lng: '' }); } catch { } };
    const addEvt = async (e) => { e.preventDefault(); try { await addEvent(evtForm); loadAll(); msg('Event added!'); setEvtForm({ title: '', location: '', startTime: '', endTime: '', isLive: false, description: '' }); } catch { } };
    const toggleLive = async (ev) => { try { await updateEvent(ev.id, { ...ev, isLive: !ev.isLive }); loadAll(); } catch { } };

    if (!isAdmin) return (
        <div className="admin-page page">
            <div className="admin-login">
                <div className="login-card card card-p-lg">
                    <div className="login-icon">⚙️</div>
                    <h1>Admin Login</h1>
                    <p>Manage campus data and settings</p>
                    {loginErr && <div className="alert alert-error">{loginErr}</div>}
                    <form onSubmit={doLogin} className="login-form">
                        <div className="form-group"><label className="form-label">Username</label><input value={loginForm.username} onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))} required /></div>
                        <div className="form-group"><label className="form-label">Password</label><input type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} placeholder="Default: admin123" required /></div>
                        <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>{loading ? 'Logging in…' : '🔐 Login'}</button>
                    </form>
                    <p className="login-hint">Default credentials: admin / admin123</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="admin-page page">
            <div className="admin-wrap">
                <div className="admin-top-bar card card-p">
                    <div><h1>⚙️ Admin Dashboard</h1><p>Manage campus data and analytics</p></div>
                    <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
                </div>
                {flash && <div className="alert alert-success">{flash}</div>}
                <div className="admin-tabs">
                    {TABS.map(t => <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
                </div>

                {tab === 'Locations' && (
                    <div className="admin-section">
                        <div className="two-col">
                            <div className="form-card card">
                                <h3>Add Location</h3>
                                <form onSubmit={addLoc} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div className="form-group"><label className="form-label">Name</label><input value={locForm.name} onChange={e => setLocForm(f => ({ ...f, name: e.target.value }))} required /></div>
                                    <div className="form-group"><label className="form-label">Type</label>
                                        <select value={locForm.type} onChange={e => setLocForm(f => ({ ...f, type: e.target.value }))}>
                                            <option value="lab">Lab</option><option value="office">Office</option><option value="facility">Facility</option><option value="parking">Parking</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label className="form-label">Building</label><input value={locForm.building} onChange={e => setLocForm(f => ({ ...f, building: e.target.value }))} required /></div>
                                        <div className="form-group"><label className="form-label">Floor</label><input type="number" value={locForm.floor} onChange={e => setLocForm(f => ({ ...f, floor: e.target.value }))} /></div>
                                    </div>
                                    <div className="form-group"><label className="form-label">Description</label><input value={locForm.description} onChange={e => setLocForm(f => ({ ...f, description: e.target.value }))} /></div>
                                    <button className="btn btn-primary w-full" type="submit">+ Add Location</button>
                                </form>
                            </div>
                            <div>
                                <div className="admin-list-head" style={{ marginBottom: '10px' }}>All Locations ({locations.length})</div>
                                <div className="admin-list">
                                    {locations.map(l => (
                                        <div key={l.id} className="admin-list-item card card-p-sm">
                                            <div><div className="list-item-name">{l.name}</div><div className="list-item-meta"><span className="tag">{l.type}</span> {l.building} · Floor {l.floor}</div></div>
                                            <div className="list-item-actions">
                                                <a href={`http://localhost:5000/api/qr/${l.id}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">📱 QR</a>
                                                <button className="btn btn-danger btn-sm" onClick={async () => { if (confirm('Delete?')) { await deleteLocation(l.id); loadAll(); } }}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'Events' && (
                    <div className="admin-section">
                        <div className="two-col">
                            <div className="form-card card">
                                <h3>Add Event</h3>
                                <form onSubmit={addEvt} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div className="form-group"><label className="form-label">Title</label><input value={evtForm.title} onChange={e => setEvtForm(f => ({ ...f, title: e.target.value }))} required /></div>
                                    <div className="form-group"><label className="form-label">Venue</label><input value={evtForm.location} onChange={e => setEvtForm(f => ({ ...f, location: e.target.value }))} required /></div>
                                    <div className="form-row">
                                        <div className="form-group"><label className="form-label">Start</label><input type="datetime-local" value={evtForm.startTime} onChange={e => setEvtForm(f => ({ ...f, startTime: e.target.value }))} required /></div>
                                        <div className="form-group"><label className="form-label">End</label><input type="datetime-local" value={evtForm.endTime} onChange={e => setEvtForm(f => ({ ...f, endTime: e.target.value }))} required /></div>
                                    </div>
                                    <div className="form-group"><label className="form-label">Description</label><input value={evtForm.description} onChange={e => setEvtForm(f => ({ ...f, description: e.target.value }))} /></div>
                                    <label className="checkbox-row"><input type="checkbox" checked={evtForm.isLive} onChange={e => setEvtForm(f => ({ ...f, isLive: e.target.checked }))} /> Mark as Live Now</label>
                                    <button className="btn btn-primary w-full" type="submit">+ Add Event</button>
                                </form>
                            </div>
                            <div>
                                <div className="admin-list-head" style={{ marginBottom: '10px' }}>All Events ({events.length})</div>
                                <div className="admin-list">
                                    {events.map(e => (
                                        <div key={e.id} className="admin-list-item card card-p-sm">
                                            <div><div className="list-item-name">{e.title} {e.isLive && <span className="badge badge-live">LIVE</span>}</div><div className="list-item-meta">📍 {e.location} · {new Date(e.startTime).toLocaleDateString()}</div></div>
                                            <div className="list-item-actions">
                                                <button className={`btn btn-sm ${e.isLive ? 'btn-danger' : 'btn-ghost'}`} onClick={() => toggleLive(e)}>{e.isLive ? 'End' : 'Go Live'}</button>
                                                <button className="btn btn-danger btn-sm" onClick={async () => { if (confirm('Delete?')) { await deleteEvent(e.id); loadAll(); } }}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'Tours' && (
                    <div className="admin-section">
                        <div className="admin-list-head" style={{ marginBottom: '10px' }}>Tour Spaces ({tours.length})</div>
                        <div className="admin-list">
                            {tours.map(t => (
                                <div key={t.id} className="admin-list-item card card-p-sm">
                                    <div><div className="list-item-name">{t.name}</div><div className="list-item-meta"><span className="tag">{t.level}</span> · {JSON.parse(t.hotspots || '[]').length} hotspots</div></div>
                                    <button className="btn btn-danger btn-sm" onClick={async () => { if (confirm('Delete?')) { await deleteTour(t.id); loadAll(); } }}>Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'Analytics' && analytics && (
                    <div className="analytics-grid">
                        <div className="analytics-card card">
                            <h3>📊 Top Search Queries</h3>
                            <div className="analytics-total">Total: {analytics.totalSearches} searches</div>
                            <div className="bar-chart">
                                {analytics.topQueries.length === 0 ? <p className="text-sm text-3">No searches yet. Use the AI Assistant.</p>
                                    : analytics.topQueries.map((q, i) => (
                                        <div key={i} className="bar-row">
                                            <div className="bar-lbl">{q.query}</div>
                                            <div className="bar-track"><div className="bar-fill" style={{ width: `${(q.count / (analytics.topQueries[0]?.count || 1)) * 100}%` }} /></div>
                                            <div className="bar-cnt">{q.count}</div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="analytics-card card">
                            <h3>📍 Top Locations</h3>
                            <div className="bar-chart">
                                {analytics.topLocations.length === 0 ? <p className="text-sm text-3">No data yet.</p>
                                    : analytics.topLocations.map((l, i) => (
                                        <div key={i} className="bar-row">
                                            <div className="bar-lbl">{l.name}</div>
                                            <div className="bar-track"><div className="bar-fill bar-fill-2" style={{ width: `${(l.count / (analytics.topLocations[0]?.count || 1)) * 100}%` }} /></div>
                                            <div className="bar-cnt">{l.count}</div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
