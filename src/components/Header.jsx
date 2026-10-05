import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Header() {
    const { language, setLanguage, table, branding } = useAppContext();
    const [langOpen, setLangOpen] = useState(false);

    return (
        <header className="site-header">
            {/* ── Left: Table chip ── */}
            <div className="sh-left">
                <span className="sh-table">🪑 {table}</span>
            </div>

            {/* ── Center: Logo ── */}
            <Link to="/" className="sh-logo">
                {branding.logoImage ? (
                    <img src={branding.logoImage} alt="Logo" className="sh-logo-img" />
                ) : (
                    <div className="sh-logo-badge">{branding.logoEmoji}</div>
                )}
                <div className="sh-logo-text">
                    <h1 style={{ fontFamily: branding.fontHeading }}>{branding.name}</h1>
                    <span>{branding.subtitle}</span>
                </div>
            </Link>

            {/* ── Right: Language ── */}
            <div className="sh-right">
                <div className="sh-langs">
                    {['FR', 'AR', 'EN'].map(l => (
                        <button
                            key={l}
                            className={`sh-lang-btn${language === l ? ' on' : ''}`}
                            onClick={() => setLanguage(l)}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
}
