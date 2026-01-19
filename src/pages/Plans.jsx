import { useState } from 'react';
import { Check, X, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Plans.css';

// Feature rows for comparison table
const featuresList = [
    { name: 'Contenido', aspirante: '2 PDFs básicos + Galería', novato: 'Biblioteca completa PDFs/Fotos', luchador: 'Todo + Videoteca Técnica', maestro: 'Todo + Masterclasses exclusivas' },
    { name: 'Mentoría', aspirante: 'Avisos generales', novato: 'Muro de comunidad', luchador: 'Mensajes 1-a-1 Coach', maestro: 'Feedback video + Prioridad' },
    { name: 'En vivo', aspirante: 'No disponible', novato: '1 Zoom grupal/mes', luchador: '4 Sesiones técnicas/mes', maestro: 'Ilimitado + Grabaciones' },
    { name: 'WhatsApp', aspirante: 'No disponible', novato: 'Grupo avisos (lectura)', luchador: 'Soporte técnico', maestro: 'Atención 24/7' },
    { name: 'Personalización', aspirante: 'No disponible', novato: 'No disponible', luchador: 'Rutina mensual ajustada', maestro: 'Plan Diario' },
    { name: 'Extra', aspirante: '-', novato: '-', luchador: '-', maestro: '2 personas x 1 precio' }
];

const plansData = [
    { id: 0, name: 'Aspirante', priceMonthly: 0, priceAnnual: 0, highlight: false },
    { id: 1, name: 'Novato', priceMonthly: 8000, priceAnnual: 8000 * 12 * 0.9, highlight: false }, // 10% off heuristic or just calc
    { id: 2, name: 'Luchador', priceMonthly: 15000, priceAnnual: 15000 * 12 * 0.8, highlight: true }, // 20% off requested
    { id: 3, name: 'Maestro', priceMonthly: 30000, priceAnnual: 30000 * 12 * 0.9, highlight: false }
];

export default function Plans() {
    const { user } = useAuth();
    const [isAnnual, setIsAnnual] = useState(false);

    const formatPrice = (price) => {
        if (price === 0) return 'Gratis';
        return `$${price.toLocaleString()}`;
    };

    return (
        <div className="container animate-fade-in page-padding">
            <h1 className="section-title">Elige tu <span className="red-text">Camino</span></h1>

            {/* Billing Toggle */}
            <div className="billing-toggle-container">
                <span className={!isAnnual ? 'active' : ''}>Mensual</span>
                <div className="toggle-switch" onClick={() => setIsAnnual(!isAnnual)}>
                    <div className={`switch-handle ${isAnnual ? 'annual' : ''}`}></div>
                </div>
                <span className={isAnnual ? 'active' : ''}>Anual <small className="discount-tag">Ahorra hasta 20%</small></span>
            </div>

            {/* Responsive Table/Grid Replacement */}
            {/* For Mobile: Card View is better. For Desktop: Table is better. 
                Given the complexity, a grid of cards with detailed lists is often safer for responsive than a table.
                However, a comparison table was implied by "Beneficio Beneficio...". 
                Let's do a hybrid: Cards that list these features. */}

            <div className="plans-grid">
                {plansData.map(plan => {
                    const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
                    const index = plan.id; // 0 to 3 matching feature indices logic simpler if manual or mapped

                    // Helper to get text for this plan from featureList
                    const getFeatureText = (row) => {
                        if (plan.id === 0) return row.aspirante;
                        if (plan.id === 1) return row.novato;
                        if (plan.id === 2) return row.luchador;
                        if (plan.id === 3) return row.maestro;
                    };

                    return (
                        <div key={plan.id} className={`plan-card ${plan.highlight ? 'highlight' : ''}`}>
                            {plan.highlight && isAnnual && <div className="popular-badge">20% OFF</div>}
                            {plan.highlight && !isAnnual && <div className="popular-badge">Recomendado</div>}

                            <h3>{plan.name}</h3>
                            <div className="price">
                                {formatPrice(price)}
                                <span style={{ display: 'block', fontSize: '1rem' }}>{isAnnual ? '/año' : '/mes'}</span>
                            </div>

                            <ul className="plan-details-list">
                                {featuresList.map((f, i) => (
                                    <li key={i}>
                                        <div className="feature-label">{f.name}</div>
                                        <div className="feature-value">
                                            {getFeatureText(f) === 'No disponible' || getFeatureText(f) === '-'
                                                ? <span style={{ color: '#666' }}>{getFeatureText(f)}</span>
                                                : <span style={{ color: 'white' }}>{getFeatureText(f)}</span>
                                            }
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`btn ${plan.highlight ? 'btn-primary' : 'btn-outline'}`}
                                style={{ width: '100%', marginTop: 'auto' }}
                                onClick={async () => {
                                    if (user?.role === 'admin' || user?.role === 'coach') {
                                        alert('Los administradores y coaches no necesitan suscribirse a planes.');
                                        return;
                                    }
                                    if (!user) {
                                        window.location.href = '/register';
                                        return;
                                    }

                                    if (plan.id === 0) {
                                        window.location.href = '/dashboard';
                                        return;
                                    }

                                    // Create payment preference
                                    try {
                                        const res = await fetch('http://localhost:3000/api/payment/create_preference', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is in localStorage
                                            },
                                            body: JSON.stringify({
                                                planId: plan.id,
                                                title: `Plan ${plan.name}`,
                                                price: isAnnual ? plan.priceAnnual : plan.priceMonthly,
                                                isAnnual: isAnnual
                                            })
                                        });
                                        const data = await res.json();
                                        if (data.init_point) {
                                            window.location.href = data.init_point;
                                        } else {
                                            alert('Error al generar el link de pago.');
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        alert('Error de conexión.');
                                    }
                                }}
                                disabled={user?.role === 'admin' || user?.role === 'coach'}
                            >
                                {user?.role === 'admin' || user?.role === 'coach' ? 'No disponible' : (plan.id === 0 ? 'Registrarse Gratis' : 'Suscribirse')}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="disclaimer-presencial" style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem', background: '#111', borderRadius: '8px', border: '1px solid #333' }}>
                <Info className="red-text" style={{ marginBottom: '0.5rem' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Clases Presenciales</h3>
                <p>El costo de las clases presenciales es de <strong>$25.000 pesos mensuales</strong>.</p>
                <p style={{ fontSize: '0.9rem', color: '#888' }}>Este valor es independiente de la suscripción digital.</p>
            </div>
        </div>
    );
}
