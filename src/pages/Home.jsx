import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { categories } from '../data';
import { useState } from 'react';

export default function Home() {
    const [activeCat, setActiveCat] = useState('Tout');
    const { menu, addToCart } = useAppContext();
    const navigate = useNavigate();

    const categoriesPresent = [...new Set(menu.map(item => item.category))];
    const visibleCats = [
        { name: 'Tout', icon: '🍽️' },
        ...categories.filter(c => categoriesPresent.includes(c.name))
    ];

    const filteredItems = activeCat === 'Tout'
        ? menu
        : menu.filter(i => i.category === activeCat);

    const handleAdd = (e, item) => {
        e.stopPropagation();
        const hasVariants = item.hasVariants && item.variants?.length > 0;
        if (hasVariants) {
            navigate(`/product/${item.id}`);
        } else {
            addToCart({ ...item, price: item.price });
        }
    };

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
                        <span className="mag-pill-icon">{c.icon}</span>
                        <span>{c.name.toUpperCase()}</span>
                    </button>
                ))}
            </div>

            {/* ===== FOOD GRID ===== */}
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
                            {/* Image */}
                            <div className="mag-card-img" style={bgStyle}>
                                {hasImage ? (
                                    <img src={item.images[0]} alt={item.name} loading="lazy" />
                                ) : (
                                    <div className="mag-card-emoji">{item.icon || '🍽️'}</div>
                                )}

                                {/* Badge */}
                                {item.badge && (
                                    <span className={`badge ${item.badge.type}`}>
                                        {item.badge.text}
                                    </span>
                                )}

                                {/* Dark gradient overlay */}
                                <div className="mag-card-overlay">
                                    <span className="mag-card-name">{item.name}</span>
                                    <div className="mag-card-footer">
                                        <span className="mag-card-price">{displayPrice}</span>
                                        <button
                                            className="mag-add-btn"
                                            onClick={(e) => handleAdd(e, item)}
                                            aria-label={`Ajouter ${item.name}`}
                                        >
                                            {hasVariants ? '→' : '+'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
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
