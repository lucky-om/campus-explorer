import React, { useState, useRef, useEffect } from 'react';
import { getLocations, logSearch } from '../services/api';
import './AIAssistant.css';

const KB = {
    staff: [
        { name: 'Dr. Rajesh Sharma', role: 'Principal', dept: 'Administration', phone: '9876543210', office: 'Main Block, Room 101' },
        { name: 'Prof. Meena Patel', role: 'HOD - Computer Engineering', dept: 'Computer Engineering', phone: '9876543211', office: 'CS Block, Room 201' },
        { name: 'Prof. Suresh Kumar', role: 'HOD - Information Technology', dept: 'IT', phone: '9876543212', office: 'IT Block, Room 301' },
        { name: 'Prof. Ramesh Gupta', role: 'Placement Officer', dept: 'T&P', phone: '9876543215', office: 'Main Block, Room 102' },
    ],
    placements: { total: 342, highest: '₹28 LPA (Google)', avg: '₹7.2 LPA', companies: ['Google', 'Infosys', 'TCS', 'Wipro', 'Accenture', 'HCL'] },
    admission: { cutoff: '94.5 percentile (CS)', fees: '₹1,10,000/year', contact: '9876543219' },
    events: [
        { title: 'TechFest 2024', date: 'March 15–17', venue: 'Auditorium', desc: 'Hackathon, robotics, competitive coding' },
        { title: 'Placement Drive – Infosys', date: 'March 20', venue: 'Seminar Hall', desc: 'For final year students' },
    ],
    emergency: { security: '9876500001', medical: '9876500002', ambulance: '108' },
};

function getReply(q, locations) {
    const lq = q.toLowerCase();
    if (/^(hi|hello|hey|good|namaste)/.test(lq)) return { type: 'text', text: '👋 Hi! I\'m your Smart Campus Copilot. Ask me about locations, staff, events, placements, or admissions!' };
    if (lq.includes('hod') || (lq.includes('head') && lq.includes('dept'))) {
        const m = KB.staff.filter(s => s.role.toLowerCase().includes('hod'));
        const p = lq.includes('it') || lq.includes('info') ? m.find(s => s.dept.includes('IT')) : m.find(s => s.dept.includes('Computer')) || m[0];
        return { type: 'profile', person: p || m[0] };
    }
    if (lq.includes('principal')) return { type: 'profile', person: KB.staff[0] };
    if (lq.includes('placement') || lq.includes('package') || lq.includes('salary') || lq.includes('job')) return { type: 'placement', data: KB.placements };
    if (lq.includes('event') || lq.includes('fest')) return { type: 'events', events: KB.events };
    if (lq.includes('admission') || lq.includes('cutoff') || lq.includes('fees')) return { type: 'admission', data: KB.admission };
    if (lq.includes('emergency') || lq.includes('security') || lq.includes('accident')) return { type: 'emergency', data: KB.emergency };
    const loc = locations.find(l => lq.includes(l.name.toLowerCase()) || l.name.toLowerCase().split(' ').some(w => lq.includes(w) && w.length > 3));
    if (loc) return { type: 'location', location: loc };
    return { type: 'text', text: `I didn't find info on that. Try: location names, "HOD", "Principal", "Placements", "Events", or "Admission".` };
}

const CHIPS = ['Where is Computer Lab?', 'Who is HOD of CS?', 'Placement stats?', 'Next event?', 'Admission fees?', 'Emergency contacts?'];

export default function AIAssistant() {
    const [messages, setMessages] = useState([{ id: 0, role: 'bot', type: 'text', text: '👋 Hi! I\'m Smart Campus Copilot. Ask me anything about this campus!' }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState([]);
    const chatRef = useRef(null);

    useEffect(() => { getLocations().then(r => setLocations(r.data)).catch(() => { }); }, []);
    useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

    const send = (text) => {
        if (!text?.trim()) return;
        setMessages(m => [...m, { id: Date.now(), role: 'user', type: 'text', text: text.trim() }]);
        setInput(''); setLoading(true);
        logSearch(text.trim()).catch(() => { });
        setTimeout(() => {
            const res = getReply(text.trim(), locations);
            setMessages(m => [...m, { id: Date.now() + 1, role: 'bot', ...res }]);
            setLoading(false);
        }, 500 + Math.random() * 400);
    };

    const voice = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { alert('Voice not supported'); return; }
        const sr = new SR(); sr.onresult = e => send(e.results[0][0].transcript); sr.start();
    };

    const BotMsg = ({ msg }) => (
        <div className="chat-row">
            <div className="chat-avatar">🤖</div>
            <div className="bubble bot">
                {msg.type === 'text' && <p>{msg.text}</p>}
                {msg.type === 'profile' && msg.person && (
                    <div className="resp-card">
                        <div className="resp-profile">
                            <div className="resp-profile-icon">👤</div>
                            <div>
                                <div className="resp-profile-name">{msg.person.name}</div>
                                <div className="resp-profile-role">{msg.person.role}</div>
                                <div className="resp-profile-detail">🏢 {msg.person.office}</div>
                                <div className="resp-profile-detail">📞 {msg.person.phone}</div>
                            </div>
                        </div>
                    </div>
                )}
                {msg.type === 'placement' && (
                    <div className="resp-card">
                        <div className="resp-card-title">📊 Placement Stats 2024–25</div>
                        <div className="resp-stat-grid">
                            <div><div className="resp-stat-val" style={{ color: 'var(--brand)' }}>{msg.data.total}</div><div className="resp-stat-lbl">Placed</div></div>
                            <div><div className="resp-stat-val" style={{ color: 'var(--success)' }}>{msg.data.highest}</div><div className="resp-stat-lbl">Highest</div></div>
                            <div><div className="resp-stat-val" style={{ color: 'var(--accent)' }}>{msg.data.avg}</div><div className="resp-stat-lbl">Average</div></div>
                        </div>
                        <div className="resp-companies">Top Recruiters: {msg.data.companies.join(', ')}</div>
                    </div>
                )}
                {msg.type === 'events' && (
                    <div className="resp-card">
                        <div className="resp-card-title">📅 Upcoming Events</div>
                        {msg.events.map((e, i) => (
                            <div key={i} className="resp-event">
                                <div className="resp-event-title">{e.title}</div>
                                <div className="resp-event-meta">{e.date} • {e.venue}</div>
                                <div className="resp-event-desc">{e.desc}</div>
                            </div>
                        ))}
                    </div>
                )}
                {msg.type === 'location' && (
                    <div className="resp-card">
                        <div className="resp-card-title">📍 {msg.location.name}</div>
                        <div className="resp-loc-tag">🏢 {msg.location.building} — Floor {msg.location.floor}</div>
                        {msg.location.description && <div className="resp-loc-tag" style={{ marginTop: '4px' }}>{msg.location.description}</div>}
                        <a href="/campus-map" className="btn btn-primary btn-sm" style={{ width: 'fit-content', marginTop: '8px' }}>View on Map →</a>
                    </div>
                )}
                {msg.type === 'emergency' && (
                    <div className="resp-card">
                        <div className="resp-card-title">🚨 Emergency Contacts</div>
                        <div className="resp-emrg-row">🔒 Security: <a href={`tel:${msg.data.security}`}>{msg.data.security}</a></div>
                        <div className="resp-emrg-row">🏥 Medical: <a href={`tel:${msg.data.medical}`}>{msg.data.medical}</a></div>
                        <div className="resp-emrg-row">🚑 Ambulance: <a href={`tel:${msg.data.ambulance}`}>{msg.data.ambulance}</a></div>
                        <a href="/emergency" className="btn btn-danger btn-sm" style={{ width: 'fit-content', marginTop: '8px' }}>Emergency Mode →</a>
                    </div>
                )}
                {msg.type === 'admission' && (
                    <div className="resp-card">
                        <div className="resp-card-title">🎓 Admission Info</div>
                        <div className="resp-adm-row">📊 CET Cutoff: {msg.data.cutoff}</div>
                        <div className="resp-adm-row">💰 Annual Fees: {msg.data.fees}</div>
                        <div className="resp-adm-row">📞 Contact: {msg.data.contact}</div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="ai-page page">
            <div className="ai-wrap">
                <div className="ai-header-card card card-p">
                    <div className="ai-avatar-box">🤖</div>
                    <div className="ai-header-text">
                        <h1>Smart Campus Copilot</h1>
                        <p>AI-powered campus guide · Ask anything</p>
                    </div>
                    <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Online</span>
                </div>
                <div className="ai-chat" ref={chatRef}>
                    {messages.map(msg => msg.role === 'bot'
                        ? <BotMsg key={msg.id} msg={msg} />
                        : <div key={msg.id} className="chat-row user"><div className="bubble user"><p>{msg.text}</p></div></div>
                    )}
                    {loading && (
                        <div className="chat-row">
                            <div className="chat-avatar">🤖</div>
                            <div className="bubble bot"><div className="typing-dots"><span /><span /><span /></div></div>
                        </div>
                    )}
                </div>
                <div className="ai-suggestions">
                    {CHIPS.map((c, i) => <button key={i} className="sugg-chip" onClick={() => send(c)}>{c}</button>)}
                </div>
                <div className="ai-input-row card">
                    <input className="ai-text-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)} placeholder="Ask about locations, staff, events, placements..." />
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={voice} title="Voice input">🎤</button>
                    <button className="btn btn-primary btn-sm" onClick={() => send(input)} disabled={!input.trim()}>Send</button>
                </div>
            </div>
        </div>
    );
}
