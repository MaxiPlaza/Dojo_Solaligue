import { Facebook, Instagram, Twitter } from 'lucide-react';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-section">
                    <h3>Sport <span className="red-text">Kombat</span> Center</h3>
                    <p>Forjando campeones dentro y fuera del dojo.</p>
                </div>

                <div className="footer-section">
                    <h4>Contacto</h4>
                    <p>Calle Falsa 123, Ciudad</p>
                    <p>+54 9 11 1234 5678</p>
                    <p>info@sportkombat.com</p>
                </div>

                <div className="footer-section social">
                    <h4>Síguenos</h4>
                    <div className="social-icons">
                        <Facebook />
                        <Instagram />
                        <Twitter />
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 Sport Kombat Center. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}
