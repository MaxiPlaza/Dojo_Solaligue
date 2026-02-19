import { Star, Quote } from 'lucide-react';
import './Testimonials.css';

const testimonials = [
    { id: 1, name: 'Juan Pérez', role: 'Alumno MMA', text: 'Entrar a Sport Kombat Center cambió mi vida. Perdí 10kg y gané una disciplina que aplico en mi trabajo.', stars: 5 },
    { id: 2, name: 'María Gonzalez', role: 'Alumna Kickboxing', text: 'Los coaches son increíbles, muy atentos. El ambiente es súper familiar y respetuoso.', stars: 5 },
    { id: 3, name: 'Carlos Gomez', role: 'Plan Maestro', text: 'La plataforma online es un plus gigante. Poder ver las clases grabadas y los PDFs me ayuda a repasar en casa.', stars: 5 },
    { id: 4, name: 'Ana Rodriguez', role: 'Defensa Personal', text: 'Me siento mucho más segura en la calle. Técnicas reales y efectivas.', stars: 4 },
];

export default function Testimonials() {
    return (
        <div className="container animate-fade-in page-padding">
            <h1 className="section-title">Lo que dicen <span className="red-text">Nuestros Alumnos</span></h1>

            <div className="testimonials-grid">
                {testimonials.map(t => (
                    <div key={t.id} className="testimonial-card">
                        <Quote size={40} className="quote-icon" />
                        <p className="testimonial-text">"{t.text}"</p>
                        <div className="testimonial-author">
                            <div className="stars">
                                {[...Array(t.stars)].map((_, i) => <Star key={i} size={16} fill="#D20404" stroke="none" />)}
                            </div>
                            <h4>{t.name}</h4>
                            <span className="role">{t.role}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
