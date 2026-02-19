import './Schedules.css';

export default function Schedules() {
    return (
        <div className="container animate-fade-in page-padding">
            <h1 className="section-title">Horarios y <span className="red-text">Sedes</span></h1>

            <div className="schedules-layout">
                {/* Main Dojo */}
                <div className="dojo-section">
                    <h2>Dojo Central - Sport Kombat Center</h2>
                    <p className="address">Av. Siempre Viva 742, Springfield</p>
                    <p className="coach-lead">Director: Master Sensei Kombat</p>

                    <div className="schedule-table-container">
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th>Hora</th>
                                    <th>Lunes</th>
                                    <th>Martes</th>
                                    <th>Miércoles</th>
                                    <th>Jueves</th>
                                    <th>Viernes</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>09:00 - 10:30</td>
                                    <td>Funcional</td>
                                    <td>Boxeo</td>
                                    <td>Funcional</td>
                                    <td>Boxeo</td>
                                    <td>Funcional</td>
                                </tr>
                                <tr>
                                    <td>18:00 - 19:30</td>
                                    <td>MMA</td>
                                    <td>Kickboxing</td>
                                    <td>MMA</td>
                                    <td>Kickboxing</td>
                                    <td>Sparring</td>
                                </tr>
                                <tr>
                                    <td>19:30 - 21:00</td>
                                    <td>K1</td>
                                    <td>Defensa P.</td>
                                    <td>K1</td>
                                    <td>Full Contact</td>
                                    <td>K1</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* NOTE: Special Karate Section as requested */}
                <div className="karate-section">
                    <div className="karate-header">
                        <h2>🥋 Karate Okinawense Shorinji Kenpo</h2>
                        <span className="badge">Horario Exclusivo</span>
                    </div>
                    <p>Esta disciplina tradicional cuenta con un espacio y dedicación exclusiva para mantener la pureza del arte.</p>

                    <div className="schedule-list">
                        <div className="schedule-item">
                            <span className="day">Martes y Jueves</span>
                            <span className="time">21:00 - 22:30</span>
                            <span className="instructor">Sensei Miyagi</span>
                        </div>
                        <div className="schedule-item">
                            <span className="day">Sábado</span>
                            <span className="time">10:00 - 12:00</span>
                            <span className="instructor">Clase Especial de Katas</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
