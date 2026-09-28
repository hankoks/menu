import React, { useState } from 'react';

export default function Contact() {
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <main>
            <div className="page-container">
                <h2>Contactez-nous</h2>

                {sent ? (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#f6ffed', borderRadius: '12px', border: '1px solid #b7eb8f' }}>
                        <h3 style={{ color: '#52c41a' }}>Message Envoyé !</h3>
                        <p style={{ marginTop: '10px' }}>Nous vous répondrons dans les plus brefs délais.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nom complet</label>
                            <input type="text" placeholder="Entrez votre nom" required />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" placeholder="Entrez votre email" required />
                        </div>
                        <div className="form-group">
                            <label>Message</label>
                            <textarea rows="5" placeholder="Comment pouvons-nous vous aider ?" required></textarea>
                        </div>
                        <button type="submit" className="submit-btn" style={{ width: '100%' }}>
                            Envoyer le Message
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}
