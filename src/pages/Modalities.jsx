import { useState, useEffect } from 'react';
import './Modalities.css';

// Placeholder data until we connect to backend
const defaultModalities = [
    { id: 1, name: 'MMA', description: 'Combina lo mejor de todas las artes marciales en un sistema completo.', image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=600&q=80' },
    { id: 2, name: 'Boxeo', description: 'El noble arte. Mejora tu resistencia, velocidad y potencia.', image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=600&q=80' },
    { id: 3, name: 'Kickboxing', description: 'Golpes de puño y patadas en un entrenamiento explosivo.', image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=600&q=80' },
    { id: 4, name: 'Defensa Personal', description: 'Técnicas reales para situaciones de peligro urbano.', image: 'https://images.unsplash.com/photo-1615572359976-17b5db44f3b7?auto=format&fit=crop&w=600&q=80' },
    { id: 5, name: 'Full Contact', description: 'Combate pleno donde se permite el KO. Alta intensidad.', image: 'https://images.unsplash.com/photo-1517438476312-10d50545d97e?auto=format&fit=crop&w=600&q=80' },
    { id: 6, name: 'K1', description: 'Reglamento japonés que añade rodillazos al kickboxing.', image: 'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?auto=format&fit=crop&w=600&q=80' },
    { id: 7, name: 'Karate Shorinji Kenpo', description: 'Arte marcial tradicional de Okinawa. Disciplina y técnica.', image: 'https://images.unsplash.com/photo-1555597408-26bc8e548a46?auto=format&fit=crop&w=600&q=80' },
];

export default function Modalities() {
    const [modalities, setModalities] = useState(defaultModalities);

    // Ideally fetch from API here
    // useEffect(() => { fetch('/api/modalities').then(...) }, []);

    return (
        <div className="container animate-fade-in page-padding">
            <h1 className="section-title">Nuestras <span className="red-text">Disciplinas</span></h1>
            <p style={{ textAlign: 'center', marginBottom: '3rem', color: '#ccc' }}>
                Entrenamiento de alto nivel para todos los estilos y objetivos.
            </p>

            <div className="modalitie-grid">
                {modalities.map(mod => (
                    <div key={mod.id} className="modality-card">
                        <div className="modality-image" style={{ backgroundImage: `url(${mod.image})` }}></div>
                        <div className="modality-content">
                            <h3>{mod.name}</h3>
                            <p>{mod.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
