import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        plan_id: 0 // Default to Gratuito
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al registrarse');
            }

            // Auto login or redirect to login? Redirect to login for now
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container animate-fade-in auth-container">
            <div className="auth-card">
                <h1 className="section-title">Crear <span className="red-text">Cuenta</span></h1>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre Completo</label>
                        <input type="text" name="name" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Teléfono</label>
                        <input type="tel" name="phone" onChange={handleChange} />
                    </div>



                    <div className="form-group">
                        <label>Contraseña</label>
                        <input type="password" name="password" onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Registrarse</button>
                </form>

                <p className="auth-footer">
                    ¿Ya tienes cuenta? <Link to="/login" className="red-text">Inicia Sesión</Link>
                </p>
            </div>
        </div>
    );
}
