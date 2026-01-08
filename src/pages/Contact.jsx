import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import './Contact.css';

export default function Contact() {
    return (
        <div className="container animate-fade-in page-padding">
            <h1 className="section-title">Contác<span className="red-text">tanos</span></h1>

            <div className="contact-layout">
                <div className="contact-info">
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

                    {/* Map placeholder */}
                    <div className="map-placeholder">
                        [Mapa de Google Maps aquí]
                    </div>
                </div>

                <form className="contact-form">
                    <h3>Envíanos un mensaje</h3>
                    <div className="form-group">
                        <label>Nombre</label>
                        <input type="text" placeholder="Tu nombre" />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="tu@email.com" />
                    </div>
                    <div className="form-group">
                        <label>Asunto</label>
                        <input type="text" placeholder="Consulta sobre clases..." />
                    </div>
                    <div className="form-group">
                        <label>Mensaje</label>
                        <textarea rows="5" placeholder="Escribe tu mensaje aquí..."></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Enviar Mensaje</button>
                </form>
            </div>
        </div>
    );
}
