import React from 'react';
import { useAppContext } from '../context/AppContext';

export default function Hero() {
    const { branding } = useAppContext();
    return (
        <section className="hero" style={branding.heroImage ? { backgroundImage: `url(${branding.heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            <div className="hero-content">
                <div className="overline">BIENVENUE AU</div>
                <h2 style={{ fontFamily: branding.fontHeading }}>{branding.name}</h2>
                <p>{branding.tagline}</p>
            </div>
        </section>
    );
}
