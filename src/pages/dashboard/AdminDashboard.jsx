import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trash2, UserPlus, FileText, Edit, Layout } from 'lucide-react';

export default function AdminDashboard() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('coaches');

    // Data State
    const [coaches, setCoaches] = useState([]);
    const [students, setStudents] = useState([]);
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(false);

    // Forms State
    const [newCoach, setNewCoach] = useState({ name: '', email: '', password: '', phone: '' });
    const [editingContent, setEditingContent] = useState(null);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // Coaches
            const resCoaches = await fetch('http://localhost:3000/api/users/coaches', { headers: { Authorization: `Bearer ${token}` } });
            const dataCoaches = await resCoaches.json();
            setCoaches(dataCoaches);

            // Fetch All Users to filter Students
            const resAll = await fetch('http://localhost:3000/api/users', { headers: { Authorization: `Bearer ${token}` } });
            const dataAll = await resAll.json();
            setStudents(dataAll.filter(u => u.role === 'student'));

            // Content
            const resContent = await fetch('http://localhost:3000/api/content', { headers: { Authorization: `Bearer ${token}` } });
            const dataContent = await resContent.json();
            setContent(dataContent);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    // Handlers
    const handleCreateCoach = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/users/create_coach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newCoach)
            });
            if (res.ok) {
                alert('Coach creado');
                setNewCoach({ name: '', email: '', password: '', phone: '' });
                fetchData();
            } else {
                const err = await res.json();
                alert('Error: ' + err.error);
            }
        } catch (e) { alert(e.message); }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
        try {
            const res = await fetch(`http://localhost:3000/api/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchData();
            else alert('No se pudo eliminar');
        } catch (e) { console.error(e); }
    };

    const handleDeleteContent = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar este contenido?')) return;
        try {
            const res = await fetch(`http://localhost:3000/api/content/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchData();
            else alert('No se pudo eliminar');
        } catch (e) { console.error(e); }
    };

    const handleUpdateContentSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:3000/api/content/${editingContent.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(editingContent)
            });
            if (res.ok) {
                alert('Contenido actualizado');
                setEditingContent(null);
                fetchData();
            } else alert('Error al actualizar');
        } catch (e) { console.error(e); }
    };

    const getPlanName = (level) => {
        const plans = ['Gratuito', 'Novato', 'Luchador', 'Maestro'];
        return plans[level] || 'Desconocido';
    };

    return (
        <div className="dash-section" style={{ marginTop: '2rem', borderTop: '1px solid #333', paddingTop: '2rem' }}>
            <h2 style={{ width: '100%', textAlign: 'center' }}>Panel de Administrador</h2>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button className={`btn ${activeTab === 'coaches' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('coaches')}>Coaches</button>
                <button className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('students')}>Alumnos</button>
                <button className={`btn ${activeTab === 'content' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('content')}>Contenido</button>
                <button className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('reports')}>Reportes</button>
            </div>

            {activeTab === 'coaches' && (
                <div>
                    <h3>Gestión de Coaches</h3>
                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem', marginBottom: '2rem' }}>
                        {coaches.filter(c => c.role === 'coach').map(c => (
                            <div key={c.id} style={{ background: '#1a1a1a', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px' }}>
                                <div>
                                    <strong>{c.name}</strong> ({c.email})
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Tel: {c.phone}</div>
                                </div>
                                <button className="btn btn-outline" style={{ borderColor: 'red', color: 'red' }} onClick={() => handleDeleteUser(c.id)}>
                                    <Trash2 size={16} /> Eliminar
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ border: '1px solid #333', padding: '1.5rem', borderRadius: '8px', background: '#111' }}>
                        <h4><UserPlus size={18} className="red-text" /> Agregar Nuevo Coach</h4>
                        <form onSubmit={handleCreateCoach} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                            <input placeholder="Nombre Completo" value={newCoach.name} onChange={e => setNewCoach({ ...newCoach, name: e.target.value })} required style={{ padding: '0.8rem', background: '#222', border: 'none', color: 'white' }} />
                            <input placeholder="Email" type="email" value={newCoach.email} onChange={e => setNewCoach({ ...newCoach, email: e.target.value })} required style={{ padding: '0.8rem', background: '#222', border: 'none', color: 'white' }} />
                            <input placeholder="Teléfono" value={newCoach.phone} onChange={e => setNewCoach({ ...newCoach, phone: e.target.value })} style={{ padding: '0.8rem', background: '#222', border: 'none', color: 'white' }} />
                            <input placeholder="Contraseña" type="password" value={newCoach.password} onChange={e => setNewCoach({ ...newCoach, password: e.target.value })} required style={{ padding: '0.8rem', background: '#222', border: 'none', color: 'white' }} />
                            <button className="btn btn-primary">Crear Coach</button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'students' && (
                <div>
                    <h3>Gestión de Alumnos</h3>
                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem', marginBottom: '2rem' }}>
                        {students.map(s => (
                            <div key={s.id} style={{ background: '#1a1a1a', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px' }}>
                                <div>
                                    <strong>{s.name}</strong> ({s.email})
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Plan: {getPlanName(s.plan_id)} | Tel: {s.phone}</div>
                                </div>
                                <button className="btn btn-outline" style={{ borderColor: 'red', color: 'red' }} onClick={() => handleDeleteUser(s.id)}>
                                    <Trash2 size={16} /> Eliminar
                                </button>
                            </div>
                        ))}
                        {students.length === 0 && <p style={{ color: '#555' }}>No hay alumnos registrados.</p>}
                    </div>
                </div>
            )}

            {activeTab === 'content' && (
                <div>
                    <h3><Layout className="red-text" size={20} /> Gestión de Contenido</h3>
                    {editingContent && (
                        <div style={{ background: '#111', padding: '1rem', border: '1px solid #c00', marginBottom: '2rem', borderRadius: '8px' }}>
                            <h4>Editar: {editingContent.title}</h4>
                            <form onSubmit={handleUpdateContentSubmit} style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
                                <input value={editingContent.title} onChange={e => setEditingContent({ ...editingContent, title: e.target.value })} required style={{ padding: '0.5rem', background: '#222', color: 'white' }} />
                                <textarea value={editingContent.description} onChange={e => setEditingContent({ ...editingContent, description: e.target.value })} style={{ padding: '0.5rem', background: '#222', color: 'white' }} />
                                <select value={editingContent.plan_min_level} onChange={e => setEditingContent({ ...editingContent, plan_min_level: e.target.value })} style={{ padding: '0.5rem', background: '#222', color: 'white' }}>
                                    <option value="0">Gratuito</option>
                                    <option value="1">Novato</option>
                                    <option value="2">Luchador</option>
                                    <option value="3">Maestro</option>
                                </select>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="btn btn-primary">Guardar</button>
                                    <button type="button" className="btn btn-outline" onClick={() => setEditingContent(null)}>Cancelar</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {['video', 'pdf', 'image', 'meeting'].map(type => (
                        <div key={type} style={{ marginBottom: '2rem' }}>
                            <h4 style={{ textTransform: 'uppercase', color: '#888', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>{type}s</h4>
                            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                {content.filter(c => c.type === type).map(c => (
                                    <div key={c.id} style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong>{c.title}</strong>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{c.description}</div>
                                            <div style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}><span className="red-text">Plan:</span> {getPlanName(c.plan_min_level)}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => setEditingContent(c)}><Edit size={14} /></button>
                                            <button className="btn btn-outline" style={{ padding: '0.5rem', borderColor: 'red', color: 'red' }} onClick={() => handleDeleteContent(c.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                                {content.filter(c => c.type === type).length === 0 && <p style={{ color: '#555' }}>No hay {type}s.</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'reports' && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <FileText size={48} className="red-text" style={{ marginBottom: '1rem' }} />
                    <h3>Reportes del Sistema</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '2rem' }}>
                        <div>
                            <h4 style={{ fontSize: '3rem', color: 'white' }}>{coaches.length}</h4>
                            <p style={{ color: '#888' }}>Usuarios Totales</p>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '3rem', color: 'white' }}>{content.length}</h4>
                            <p style={{ color: '#888' }}>Contenidos Totales</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
