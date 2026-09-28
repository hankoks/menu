import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Header() {
    const { language, setLanguage, table, branding } = useAppContext();

    return (
        <header>
            <Link to="/" className="logo">
                {branding.logoImage ? (
                    <img src={branding.logoImage} alt="Logo" style={{ height: 44, width: 'auto', maxHeight: 44, objectFit: 'contain' }} />
                ) : (
                    <div className="logo-badge">{branding.logoEmoji}</div>
                )}
                <div className="logo-text">
                    <h1 style={{ fontFamily: branding.fontHeading }}>{branding.name}</h1>
                    <span>{branding.subtitle}</span>
                </div>
            </Link>

            <nav>
                <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Menu</NavLink>
                <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>À propos</NavLink>
                <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink>
            </nav>

            <div className="header-right">
                <div className="langs">
                    <span className={language === 'FR' ? 'on' : ''} onClick={() => setLanguage('FR')}>FR</span>
                    <span className={language === 'AR' ? 'on' : ''} onClick={() => setLanguage('AR')}>AR</span>
                    <span className={language === 'EN' ? 'on' : ''} onClick={() => setLanguage('EN')}>EN</span>
                </div>
                <Search className="search-icon" size={18} />
                <button className="table-btn">🪑 Table {table}</button>
            </div>
        </header>
    );
}
