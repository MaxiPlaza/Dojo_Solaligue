import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trash2, UserPlus, FileText } from 'lucide-react';

export default function AdminDashboard() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('coaches');

    // Data State
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(false);

    // Forms State
    const [newCoach, setNewCoach] = useState({ name: '', email: '', password: '', phone: '' });

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // Coaches
            const resCoaches = await fetch('http://localhost:3000/api/users/coaches', { headers: { Authorization: `Bearer ${token}` } });
            const dataCoaches = await resCoaches.json();
            setCoaches(dataCoaches);
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
            if (res.ok) {
                fetchData();
            } else {
                alert('No se pudo eliminar');
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="dash-section" style={{ marginTop: '2rem', borderTop: '1px solid #333', paddingTop: '2rem' }}>
            <h2 style={{ width: '100%', textAlign: 'center' }}>Panel de Administrador</h2>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button className={`btn ${activeTab === 'coaches' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('coaches')}>Coaches</button>
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

            {activeTab === 'reports' && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <FileText size={48} className="red-text" style={{ marginBottom: '1rem' }} />
                    <h3>Reportes del Sistema</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '2rem' }}>
                        <div>
                            <h4 style={{ fontSize: '3rem', color: 'white' }}>{coaches.length}</h4>
                            <p style={{ color: '#888' }}>Usuarios Totales</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
