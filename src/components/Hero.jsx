import React from 'react';
import { useAppContext } from '../context/AppContext';

export default function Hero() {
    const { branding } = useAppContext();
    return (
        <section
            className="mob-hero"
            style={branding.heroImage
                ? { backgroundImage: `url(${branding.heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : {}}
        >
            <div className="mob-hero-content">
                <div className="mob-hero-overline">BIENVENUE AU</div>
                <h2 className="mob-hero-name" style={{ fontFamily: branding.fontHeading }}>
                    {branding.name}
                </h2>
                <p className="mob-hero-tagline">{branding.tagline}</p>
            </div>
        </section>
    );
}
