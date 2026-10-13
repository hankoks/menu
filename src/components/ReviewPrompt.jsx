import React, { useEffect, useState } from 'react';
import './ReviewPrompt.css';

/**
 * ReviewPrompt – shown after a successful order.
 * Props:
 *   restaurantName  {string}  – name to display
 *   googleMapsUrl   {string}  – the restaurant's Google Maps link
 *   onClose         {fn}      – callback to dismiss the overlay
 */
export default function ReviewPrompt({ restaurantName, googleMapsUrl, onClose }) {
    const [stars, setStars] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [sent, setSent] = useState(false);

    // Prevent body scroll while open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleStarClick = (n) => {
        setStars(n);
        if (n >= 4 && googleMapsUrl) {
            // High rating → open Google Maps immediately then close
            setTimeout(() => {
                window.open(googleMapsUrl, '_blank', 'noopener');
                setSent(true);
                setTimeout(onClose, 1800);
            }, 350);
        } else {
            // Low rating → just thank & close (no redirect)
            setSent(true);
            setTimeout(onClose, 1800);
        }
    };

    return (
        <div className="rp-backdrop" onClick={onClose}>
            <div className="rp-card" onClick={e => e.stopPropagation()}>

                {/* Confetti circles */}
                <div className="rp-confetti">
                    {[...Array(6)].map((_, i) => <span key={i} className={`rp-dot rp-dot-${i + 1}`} />)}
                </div>

                <div className="rp-emoji">🎉</div>
                <h2 className="rp-title">Merci pour votre commande !</h2>
                <p className="rp-sub">
                    Vous avez apprécié votre expérience chez <strong>{restaurantName || 'nous'}</strong> ?<br />
                    Laissez-nous une étoile, ça compte énormément 🙏
                </p>

                {!sent ? (
                    <>
                        <div className="rp-stars">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button
                                    key={n}
                                    className={`rp-star ${n <= (hovered || stars) ? 'lit' : ''}`}
                                    onMouseEnter={() => setHovered(n)}
                                    onMouseLeave={() => setHovered(0)}
                                    onClick={() => handleStarClick(n)}
                                    aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <p className="rp-hint">
                            {hovered >= 4 || stars >= 4
                                ? '🗺️ Vous serez redirigé vers Google Maps'
                                : 'Cliquez sur une étoile pour noter'}
                        </p>
                        {googleMapsUrl && (
                            <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rp-maps-btn"
                            >
                                <span>📍</span> Nous noter sur Google Maps
                            </a>
                        )}
                        <button className="rp-skip" onClick={onClose}>Plus tard</button>
                    </>
                ) : (
                    <div className="rp-thanks">
                        <div className="rp-check">✓</div>
                        <p>Merci beaucoup ! À bientôt 💛</p>
                    </div>
                )}
            </div>
        </div>
    );
}
