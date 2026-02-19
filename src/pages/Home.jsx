import { Link } from 'react-router-dom';
import { ChevronRight, Shield, Award, Users } from 'lucide-react';
import './Home.css';

export default function Home() {
    return (
        <div className="home-page animate-fade-in">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content container">
                    <h1 className="hero-title">
                        FORJA TU <span className="red-text">LEGADO</span>
                    </h1>
                    <p className="hero-subtitle">
                        El dojo de artes marciales más completo. MMA, Boxeo, Kickboxing, Karate y más.
                        Entrena con campeones.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/register" className="btn btn-primary">Empieza Ahora <ChevronRight size={20} /></Link>
                        <Link to="/modalities" className="btn btn-outline">Ver Clases</Link>
                    </div>
                </div>
                <div className="hero-overlay"></div>
                {/* Placeholder for background image */}
            </section>

            {/* Features / Why Us */}
            <section className="features container">
                <div className="feature-card">
                    <Shield size={48} className="red-text" />
                    <h3>Defensa Personal</h3>
                    <p>Aprende a protegerte con técnicas efectivas de combate urbano.</p>
                </div>
                <div className="feature-card">
                    <Award size={48} className="red-text" />
                    <h3>Profesionales</h3>
                    <p>Instructores certificados con trayectoria en competición.</p>
                </div>
                <div className="feature-card">
                    <Users size={48} className="red-text" />
                    <h3>Comunidad</h3>
                    <p>Únete a una familia de guerreros que se apoyan mutuamente.</p>
                </div>
            </section>

            {/* Modalities Preview */}
            <section className="section container">
                <h2 className="section-title">Nuestras <span className="red-text">Disciplinas</span></h2>
                <div className="grid-3">
                    {/* We would map this from API ideally, but hardcoded preview for now */}
                    {['MMA', 'Boxeo', 'Kickboxing'].map(mod => (
                        <div key={mod} className="card-preview">
                            <h3>{mod}</h3>
                            <Link to="/modalities">Ver más &rarr;</Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <h2>¿Listo para el siguiente nivel?</h2>
                    <p>Elige tu plan y comienza tu transformación hoy mismo.</p>
                    <Link to="/plans" className="btn btn-primary">Ver Planes y Precios</Link>
                </div>
            </section>
        </div>
    );
}
