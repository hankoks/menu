import React, { useState } from 'react';
import { categories } from '../data';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const [activeCat, setActiveCat] = useState('Tout');
    const { menu, branding } = useAppContext();
    const navigate = useNavigate();

    const categoriesPresent = [...new Set(menu.map(item => item.category))];

    const visibleCats = [
        { name: 'Tout', icon: '🍽️' },
        ...categories.filter(c => categoriesPresent.includes(c.name))
    ];

    const filteredItems = activeCat === 'Tout'
        ? menu
        : menu.filter(i => i.category === activeCat);

    return (
        <div className="mag-page">
            {/* ===== STICKY CATEGORY PILLS ===== */}
            <div className="mag-cats">
                {visibleCats.map(c => (
                    <button
                        key={c.name}
                        className={`mag-pill ${activeCat === c.name ? 'active' : ''}`}
                        onClick={() => setActiveCat(c.name)}
                    >
                        {c.name.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* ===== MAGAZINE GRID ===== */}
            <div className="mag-grid">
                {filteredItems.map(item => {
                    const hasVariants = item.hasVariants && item.variants?.length > 0;
                    const displayPrice = hasVariants
                        ? `${Math.min(...item.variants.map(v => v.price))} DH`
                        : `${item.price} DH`;

                    const hasImage = item.images?.length > 0;
                    const bgStyle = hasImage
                        ? {}
                        : { background: `linear-gradient(135deg, ${item.colors[0]}, ${item.colors[1]})` };

                    return (
                        <div
                            className="mag-card"
                            key={item.id}
                            onClick={() => navigate(`/product/${item.id}`)}
                        >
                            {/* Full image */}
                            <div className="mag-card-img" style={bgStyle}>
                                {hasImage ? (
                                    <img src={item.images[0]} alt={item.name} />
                                ) : (
                                    <div className="mag-card-emoji">{item.icon || '🍽️'}</div>
                                )}

                                {/* Dark gradient overlay with name + price */}
                                <div className="mag-card-overlay">
                                    <div className="mag-card-row">
                                        <span className="mag-card-name">{item.name}</span>
                                        <span className="mag-card-dots"></span>
                                        <span className="mag-card-price">{displayPrice}</span>
                                    </div>
                                </div>

                                {/* Badge */}
                                {item.badge && (
                                    <span className={`badge ${item.badge.type}`} style={{ zIndex: 4 }}>
                                        {item.badge.text}
                                    </span>
                                )}
                            </div>

                            {/* Description below the image */}
                            <div className="mag-card-desc">
                                <p>{item.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
