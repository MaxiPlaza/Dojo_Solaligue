import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Send, Upload } from 'lucide-react';

export default function CoachDashboard({ user, isAdmin }) {
    const { token } = useAuth();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [message, setMessage] = useState('');

    // Content Upload State
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState('video');
    const [planLevel, setPlanLevel] = useState('1');
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3000/api/users/students', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setStudents(data))
            .catch(console.error);
    }, [token]);

    const handleSendNote = async (e) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:3000/api/mentorship', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ student_id: selectedStudent || null, message })
            });
            alert('Mensaje enviado');
            setMessage('');
        } catch (err) { console.error(err); }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', desc);
        formData.append('type', type);
        formData.append('plan_min_level', planLevel);
        if (file) formData.append('file', file);
        else formData.append('url', 'http://example.com'); // Fallback logic needed in backend or generic link

        try {
            const res = await fetch('http://localhost:3000/api/content', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                alert('Contenido subido');
                setTitle('');
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
            {/* Student List & Mentorship */}
            <div className="dash-section">
                <h2><Users className="red-text" /> Mis Alumnos ({students.length})</h2>
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem', border: '1px solid #333', padding: '1rem' }}>
                    {students.map(s => (
                        <div key={s.id} style={{ padding: '0.5rem', borderBottom: '1px solid #222' }}>
                            <strong>{s.name}</strong> - {s.email}
                        </div>
                    ))}
                </div>

                <h3>Enviar Mensaje / Tarea</h3>
                <form onSubmit={handleSendNote}>
                    <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}>
                        <option value="">-- Todos mis alumnos (Broadcast) --</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Escribe un mensaje, rutina o consejo..." style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} rows="3"></textarea>
                    <button className="btn btn-primary"><Send size={16} style={{ marginRight: '5px' }} /> Enviar</button>
                </form>
            </div>

            {/* Upload Content */}
            <div className="dash-section">
                <h2><Upload className="red-text" /> Subir Contenido</h2>
                <form onSubmit={handleUpload}>
                    <div className="form-group">
                        <input type="text" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                        <textarea placeholder="Descripción" value={desc} onChange={e => setDesc(e.target.value)} style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                        <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%' }}>
                            <option value="video">Video</option>
                            <option value="pdf">PDF</option>
                            <option value="image">Imagen</option>
                            <option value="meeting">Reunión / Zoom</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Plan Mínimo:</label>
                        <select value={planLevel} onChange={e => setPlanLevel(e.target.value)} style={{ width: '100%' }}>
                            <option value="0">Gratuito</option>
                            <option value="1">Novato</option>
                            <option value="2">Luchador</option>
                            <option value="3">Maestro</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Archivo (PDF/Img) o Link si es Video:</label>
                        <input type="file" onChange={e => setFile(e.target.files[0])} />
                    </div>
                    <button className="btn btn-primary">Subir</button>
                </form>
            </div>
        </div>
    );
}
