import { useAuth } from '../context/AuthContext';
import StudentDashboard from './dashboard/StudentDashboard';
import CoachDashboard from './dashboard/CoachDashboard';
import AdminDashboard from './dashboard/AdminDashboard';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) navigate('/login');
    }, [user, loading, navigate]);

    if (loading || !user) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Cargando perfil...</div>;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
            <h1 className="section-title">Bienvenido, <span className="red-text">{user.name}</span></h1>

            {(user.role === 'student' || user.role === 'coach') && (
                <div style={{ marginBottom: '3rem' }}>
                    <h2 className="section-title" style={{ fontSize: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                        {user.role === 'coach' ? 'Mi Entrenamiento (Vista Alumno)' : 'Mi Panel de Alumno'}
                    </h2>
                    <StudentDashboard user={user} />
                </div>
            )}

            {(user.role === 'coach' || user.role === 'admin') && <CoachDashboard user={user} isAdmin={user.role === 'admin'} />}
            {user.role === 'admin' && <AdminDashboard />}
            {/* Admin sees both Coach View (to manage students/content) and Admin specific tools */}
        </div>
    );
}
