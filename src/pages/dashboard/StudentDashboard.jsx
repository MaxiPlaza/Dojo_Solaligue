import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Video, FileText, Calendar, Users } from 'lucide-react';

export default function StudentDashboard({ user }) {
    const { token } = useAuth();
    const [content, setContent] = useState([]);
    const [notes, setNotes] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [assignedCoach, setAssignedCoach] = useState(null);
    const [availableCoaches, setAvailableCoaches] = useState([]);
    const [coachMsg, setCoachMsg] = useState('');

    useEffect(() => {
        // Check for payment success redirect
        const params = new URLSearchParams(window.location.search);
        if (params.get('status') === 'success') {
            const plan_id = params.get('plan_id');
            const is_annual = params.get('is_annual');

            fetch('http://localhost:3000/api/payment/confirm_payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ plan_id, is_annual })
            })
                .then(res => res.json())
                .then(() => {
                    setSuccessMsg('¡Suscripción actualizada con éxito! Ya puedes ver tu nuevo contenido.');
                    // Remove params from URL
                    window.history.replaceState({}, document.title, "/dashboard");
                })
                .catch(console.error);
        }

        // Fetch Content
        fetch('http://localhost:3000/api/content', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setContent(data))
            .catch(console.error);

        // Fetch Mentorship Notes
        fetch('http://localhost:3000/api/mentorship/notes?view=received', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setNotes(data))
            .catch(console.error);

        // Fetch Assigned Coach
        fetch('http://localhost:3000/api/mentorship/my_coach', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setAssignedCoach(data))
            .catch(console.error);

        // Fetch Available Coaches (if plan includes mentorship)
        if (user.plan_id >= 2) {
            fetch('http://localhost:3000/api/mentorship/coaches', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setAvailableCoaches(data))
                .catch(console.error);
        }

    }, [token, user.plan_id]);

    const getFullUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        return `http://localhost:3000${url}`;
    };

    const [friendEmail, setFriendEmail] = useState('');
    const [inviteMsg, setInviteMsg] = useState('');

    const handleInviteFriend = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/users/link_friend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ friendEmail })
            });
            const data = await res.json();
            if (res.ok) {
                setInviteMsg('¡Amigo invitado con éxito!');
                setFriendEmail('');
            } else {
                setInviteMsg(`Error: ${data.error}`);
            }
        } catch (e) {
            setInviteMsg('Error de conexión.');
        }
    };

    const handleAssignCoach = async (coachId) => {
        try {
            const res = await fetch('http://localhost:3000/api/mentorship/assign_coach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ coachId })
            });
            const data = await res.json();
            if (res.ok) {
                setCoachMsg('¡Coach asignado con éxito!');
                // Refresh coach
                const resCoach = await fetch('http://localhost:3000/api/mentorship/my_coach', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const coachData = await resCoach.json();
                setAssignedCoach(coachData);
            } else {
                setCoachMsg(`Error: ${data.error}`);
            }
        } catch (e) {
            setCoachMsg('Error al asignar coach.');
        }
    };

    return (
        <div className="dashboard-grid">
            {successMsg && (
                <div style={{ gridColumn: '1 / -1', background: '#1a4a1a', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #2a6a2a', textAlign: 'center' }}>
                    {successMsg}
                </div>
            )}

            {user.plan_id === 3 && user.role === 'student' && (
                <div className="dash-section" style={{ gridColumn: '1 / -1', marginBottom: '1.5rem', background: 'linear-gradient(45deg, #1a1a1a, #2a1a1a)', border: '1px solid #c00' }}>
                    <h3><Users className="red-text" /> Beneficio 2x1: Invita a un Amigo</h3>
                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Como miembro del Plan Maestro, puedes darle acceso gratuito a un amigo (debe estar registrado primero).</p>
                    <form onSubmit={handleInviteFriend} style={{ display: 'flex', gap: '0.5rem', maxWidth: '500px' }}>
                        <input
                            type="email"
                            placeholder="Email de tu amigo"
                            value={friendEmail}
                            onChange={e => setFriendEmail(e.target.value)}
                            required
                            style={{ flex: 1, padding: '0.5rem', background: '#000', border: '1px solid #333', color: 'white' }}
                        />
                        <button className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Vincular</button>
                    </form>
                    {inviteMsg && <p style={{ marginTop: '0.5rem', color: inviteMsg.includes('éxito') ? '#0f0' : '#f00' }}>{inviteMsg}</p>}
                </div>
            )}
            <div className="dash-section">
                <h2><FileText className="red-text" /> Mi Entrenamiento ({user.plan_id === 0 ? 'Plan Aspirante / Gratuito' : user.plan_id === 1 ? 'Plan Novato' : user.plan_id === 2 ? 'Plan Luchador' : 'Plan Maestro'})</h2>
                <div className="content-list">
                    {content.length === 0 ? <p>No hay contenido asignado a tu plan aún.</p> : null}
                    {content.map(item => (
                        <div key={item.id} className="content-item">
                            <div className="content-icon">
                                {item.type === 'video' ? <Video /> : <FileText />}
                            </div>
                            <div className="content-info">
                                <h4>{item.title}</h4>
                                <p>{item.description}</p>
                                <a href={getFullUrl(item.url)} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
                                    {item.type === 'image' || item.type === 'pdf' ? 'Abrir Archivo' : 'Ver Contenido'}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dash-section">
                <h2><Calendar className="red-text" /> Mentoría 1 a 1</h2>

                {user.plan_id < 2 ? (
                    <p style={{ color: '#888' }}>Tu plan actual no incluye mentoría personalizada. Sube a un plan superior para elegir un mentor.</p>
                ) : (
                    <div>
                        {assignedCoach ? (
                            <div style={{ background: '#111', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                                <p><strong>Tu Coach:</strong> {assignedCoach.name}</p>
                                <p style={{ fontSize: '0.8rem', color: '#888' }}>Email: {assignedCoach.email}</p>
                                {assignedCoach.phone && <p style={{ fontSize: '0.8rem', color: '#888' }}>Tel: {assignedCoach.phone}</p>}
                                <p style={{ marginTop: '0.5rem', color: '#c00', fontSize: '0.85rem' }}>Escríbele para coordinar tus clases.</p>
                            </div>
                        ) : (
                            <div>
                                <p style={{ marginBottom: '1rem' }}>Aún no has elegido un mentor. Selecciona uno de la lista:</p>
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    {availableCoaches.map(c => (
                                        <div key={c.id} style={{ background: '#111', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px' }}>
                                            <span>{c.name}</span>
                                            <button className="btn btn-primary" style={{ padding: '0.2rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleAssignCoach(c.id)}>Elegir</button>
                                        </div>
                                    ))}
                                    {availableCoaches.length === 0 && <p>No hay coaches disponibles en este momento.</p>}
                                </div>
                                {coachMsg && <p style={{ marginTop: '0.5rem', color: coachMsg.includes('éxito') ? '#0f0' : '#f00' }}>{coachMsg}</p>}
                            </div>
                        )}

                        <div className="notes-list" style={{ marginTop: '1.5rem', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                            <h4>Mensajes del Coach</h4>
                            {notes.length === 0 ? <p style={{ fontSize: '0.9rem', color: '#555' }}>No tienes mensajes aún.</p> : null}
                            {notes.map(note => (
                                <div key={note.id} className="note-card">
                                    <small>{new Date(note.created_at).toLocaleDateString()} - {note.coach_name}</small>
                                    <p>{note.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
