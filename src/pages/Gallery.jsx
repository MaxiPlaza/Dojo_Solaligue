import { useState } from 'react';
import { Play } from 'lucide-react';
import './Gallery.css';

export default function Gallery() {
    const [activeTab, setActiveTab] = useState('photos');

    // Placeholder data - In real app, could be fetched or hardcoded if static
    const photos = [
        'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1615572359976-17b5db44f3b7?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?auto=format&fit=crop&w=600&q=80',
    ];

    const videos = [
        { title: 'highlight Reel 2024', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }, // Placeholder YT
        { title: 'Clase de Boxeo', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    ];

    return (
        <div className="container animate-fade-in page-padding">
            <h1 className="section-title">Galería <span className="red-text">Multimedia</span></h1>

            <div className="gallery-tabs">
                <button
                    className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('photos')}
                >
                    Fotos
                </button>
                <button
                    className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('videos')}
                >
                    Videos
                </button>
            </div>

            <div className="gallery-content">
                {activeTab === 'photos' ? (
                    <div className="photos-grid">
                        {photos.map((src, i) => (
                            <div key={i} className="photo-item">
                                <img src={src} alt={`Gallery ${i}`} loading="lazy" />
                                <div className="photo-overlay"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="videos-grid">
                        {videos.map((vid, i) => (
                            <div key={i} className="video-card">
                                <div className="video-wrapper">
                                    <iframe
                                        src={vid.url}
                                        title={vid.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                                <h3>{vid.title}</h3>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
