import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import './Header.css'; // We'll add some specific header styles

export default function Header() {
    const { user, logout, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="logo">
                    SPORT <span className="red-text">KOMBAT</span> CENTER
                </Link>

                <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </div>

                <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
                    <li><Link to="/" onClick={() => setIsOpen(false)}>Inicio</Link></li>
                    <li><Link to="/modalities" onClick={() => setIsOpen(false)}>Modalidades</Link></li>
                    <li><Link to="/plans" onClick={() => setIsOpen(false)}>Planes</Link></li>
                    <li><Link to="/schedules" onClick={() => setIsOpen(false)}>Horarios</Link></li>
                    <li><Link to="/gallery" onClick={() => setIsOpen(false)}>Galería</Link></li>
                    <li><Link to="/testimonials" onClick={() => setIsOpen(false)}>Testimonios</Link></li>
                    <li><Link to="/contact" onClick={() => setIsOpen(false)}>Contacto</Link></li>

                    {isAuthenticated ? (
                        <>
                            <li>
                                <Link to="/dashboard" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                                    <User size={18} style={{ marginRight: '8px' }} /> Panel
                                </Link>
                            </li>
                            <li>
                                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem' }}>
                                    <LogOut size={18} />
                                </button>
                            </li>
                        </>
                    ) : (
                        <li>
                            <Link to="/login" className="btn btn-primary" onClick={() => setIsOpen(false)}>Ingresar</Link>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}
