import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Video, FileText, Calendar } from 'lucide-react';

export default function StudentDashboard({ user }) {
    const { token } = useAuth();
    const [content, setContent] = useState([]);
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        // Fetch Content
        fetch('http://localhost:3000/api/content', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setContent(data))
            .catch(console.error);

        // Fetch Mentorship Notes (Explicitly ask for received notes)
        fetch('http://localhost:3000/api/mentorship?view=received', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setNotes(data))
            .catch(console.error);

    }, [token]);

    return (
        <div className="dashboard-grid">
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
                                <a href={item.url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
                                    Ver Contenido
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dash-section">
                <h2><Calendar className="red-text" /> Mentoría</h2>
                <div className="notes-list">
                    {notes.length === 0 ? <p>No tienes mensajes de tu coach.</p> : null}
                    {notes.map(note => (
                        <div key={note.id} className="note-card">
                            <small>{new Date(note.created_at).toLocaleDateString()} - Coach {note.coach_name}</small>
                            <p>{note.message}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
