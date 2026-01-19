import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import './Contact.css';

export default function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Enviando...');
        try {
            const res = await fetch('http://localhost:3000/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setStatus('¡Mensaje enviado correctamente!');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setStatus('Error al enviar el mensaje. Reintenta.');
            }
        } catch (e) {
            setStatus('Error de conexión.');
        }
    };

    return (
        <div className="container animate-fade-in page-padding">
            <h1 className="section-title">Contác<span className="red-text">tanos</span></h1>

            <div className="contact-layout">
                <div className="contact-info">
                    {/* ... (existing contact info items) ... */}
                    <div className="info-item">
                        <MapPin size={24} className="red-text" />
                        <div>
                            <h3>Ubicación</h3>
                            <p>Av. Siempre Viva 742</p>
                            <p>Springfield, CP 5500</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <Phone size={24} className="red-text" />
                        <div>
                            <h3>Teléfono</h3>
                            <p>+54 9 261 123 4567</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <Mail size={24} className="red-text" />
                        <div>
                            <h3>Email</h3>
                            <p>contacto@sportkombat.com</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <Clock size={24} className="red-text" />
                        <div>
                            <h3>Horarios</h3>
                            <p>Lunes a Viernes: 8:00 - 22:00</p>
                            <p>Sábados: 9:00 - 13:00</p>
                        </div>
                    </div>

                    <div className="map-placeholder">
                        [Mapa de Google Maps aquí]
                    </div>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <h3>Envíanos un mensaje</h3>
                    <div className="form-group">
                        <label>Nombre</label>
                        <input
                            type="text"
                            placeholder="Tu nombre"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Asunto</label>
                        <input
                            type="text"
                            placeholder="Consulta sobre clases..."
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Mensaje</label>
                        <textarea
                            rows="5"
                            placeholder="Escribe tu mensaje aquí..."
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                            required
                        ></textarea>
                    </div>
                    {status && <p className="status-message" style={{ marginBottom: '1rem', color: status.includes('¡') ? 'green' : 'red' }}>{status}</p>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Enviar Mensaje</button>
                </form>
            </div>
        </div>
    );
}
