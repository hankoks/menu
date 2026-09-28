import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Heart, ShoppingCart, Plus, Minus, Star, Check } from 'lucide-react';

export default function ProductDetail() {
    const { id } = useParams();
    const { menu, addToCart } = useAppContext();
    const navigate = useNavigate();

    const product = menu.find(p => String(p.id) === String(id));
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [liked, setLiked] = useState(false);
    const [added, setAdded] = useState(false);
    const [imgIdx, setImgIdx] = useState(0); // For image slider

    if (!product) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
                <h3>Produit introuvable</h3>
                <button onClick={() => navigate('/')} className="pd2-cta-btn" style={{ maxWidth: 200, margin: '20px auto' }}>
                    Retour au Menu
                </button>
            </div>
        );
    }

    const hasVariants = product.hasVariants && product.variants?.length > 0;
    const hasExtras = product.extras?.length > 0;
    const hasImages = product.images?.length > 0;

    const basePrice = hasVariants
        ? (selectedVariant ? selectedVariant.price : Math.min(...product.variants.map(v => v.price)))
        : product.price;

    const extrasTotal = selectedExtras.reduce((sum, ex) => sum + Number(ex.price), 0);
    const unitPrice = basePrice + extrasTotal;
    const totalPrice = unitPrice * quantity;
    const canAdd = !hasVariants || selectedVariant;

    const toggleExtra = (extra) => {
        const exists = selectedExtras.find(e => e.name === extra.name);
        if (exists) {
            setSelectedExtras(selectedExtras.filter(e => e.name !== extra.name));
        } else {
            setSelectedExtras([...selectedExtras, extra]);
        }
    };

    const handleAddToCart = () => {
        if (!canAdd) return;
        const cartItem = {
            ...product,
            price: unitPrice,
            ...(hasVariants && selectedVariant ? { variantName: selectedVariant.name } : {}),
            selectedExtras: selectedExtras.length > 0 ? [...selectedExtras] : undefined,
        };
        for (let i = 0; i < quantity; i++) addToCart(cartItem);
        setAdded(true);
        setTimeout(() => { setAdded(false); navigate(-1); }, 1200);
    };

    return (
        <div className="pd2-page">
            {/* HERO WITH SLIDER */}
            <div className="pd2-hero" style={{ background: hasImages ? '#e0dcd3' : `linear-gradient(145deg, ${product.colors[0]}, ${product.colors[1]})` }}>
                <div className="pd2-hero-controls">
                    <button className="pd2-ctrl-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <button className={`pd2-ctrl-btn heart ${liked ? 'liked' : ''}`} onClick={() => setLiked(!liked)}>
                        <Heart size={20} fill={liked ? '#e53e3e' : 'none'} color={liked ? '#e53e3e' : '#333'} />
                    </button>
                </div>

                {hasImages ? (
                    <>
                        <img src={product.images[imgIdx]} alt={product.name} className="pd2-hero-img" />
                        {product.images.length > 1 && (
                            <div className="pd2-slider-dots">
                                {product.images.map((_, i) => (
                                    <button
                                        key={i}
                                        className={`pd2-dot ${i === imgIdx ? 'active' : ''}`}
                                        onClick={() => setImgIdx(i)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="pd2-hero-emoji">{product.icon || '🍽️'}</div>
                )}

                {product.badge && <span className={`pd2-badge ${product.badge.type}`}>{product.badge.text}</span>}
            </div>

            {/* CONTENT SHEET */}
            <div className="pd2-sheet">
                <div className="pd2-top-row">
                    <div style={{ flex: 1 }}>
                        <span className="pd2-cat">{product.category}</span>
                        <h1 className="pd2-name">{product.name}</h1>
                        <div className="pd2-rating">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < 4 ? 'var(--gold)' : 'none'} color="var(--gold)" />
                            ))}
                            <span>4.8 (128 avis)</span>
                        </div>
                    </div>
                    <div className="pd2-qty">
                        <button className="pd2-qty-btn minus" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                            <Minus size={16} />
                        </button>
                        <span className="pd2-qty-num">{quantity}</span>
                        <button className="pd2-qty-btn plus" onClick={() => setQuantity(q => q + 1)}>
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                <div className="pd2-price">
                    {hasVariants && !selectedVariant ? `Dès ${basePrice} DH` : `${unitPrice} DH`}
                </div>

                <div className="pd2-section">
                    <h4 className="pd2-section-title">À propos</h4>
                    <p className="pd2-desc">{product.desc}</p>
                </div>

                {hasVariants && (
                    <div className="pd2-section">
                        <h4 className="pd2-section-title">Choisissez votre taille</h4>
                        <div className="pd2-extras">
                            {product.variants.map((v, i) => (
                                <label key={i} className={`pd2-extra-row ${selectedVariant?.name === v.name ? 'selected' : ''}`}>
                                    <span className="pd2-extra-name">{v.name}</span>
                                    <span className="pd2-extra-right">
                                        <span className="pd2-extra-price">{v.price} DH</span>
                                        <input
                                            type="radio"
                                            name="variant"
                                            checked={selectedVariant?.name === v.name}
                                            onChange={() => setSelectedVariant(v)}
                                            className="pd2-radio"
                                        />
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {hasExtras && (
                    <div className="pd2-section">
                        <h4 className="pd2-section-title">Ajouter des suppléments</h4>
                        <div className="pd2-extras">
                            {product.extras.filter(ex => ex.isAvailable !== false).map((ex, i) => {
                                const checked = !!selectedExtras.find(e => e.name === ex.name);
                                return (
                                    <label
                                        key={i}
                                        className={`pd2-extra-row ${checked ? 'selected' : ''}`}
                                        onClick={() => toggleExtra(ex)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span className="pd2-extra-name">{ex.name}</span>
                                        <span className="pd2-extra-right">
                                            <span className="pd2-extra-price">+{ex.price} DH</span>
                                            <span className={`pd2-checkbox ${checked ? 'checked' : ''}`}>
                                                {checked && <Check size={13} strokeWidth={3} />}
                                            </span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}
                <div style={{ height: 100 }} />
            </div>

            {/* FIXED BOTTOM BAR */}
            <div className="pd2-bottom-bar">
                <div className="pd2-total">
                    <span className="pd2-total-label">Total</span>
                    <span className="pd2-total-price">{totalPrice} DH</span>
                </div>
                <button
                    className={`pd2-cta-btn ${!canAdd ? 'disabled' : ''} ${added ? 'success' : ''}`}
                    onClick={handleAddToCart}
                    disabled={!canAdd}
                >
                    {added
                        ? '✓ Ajouté !'
                        : hasVariants && !selectedVariant
                            ? 'Choisir une taille'
                            : <><ShoppingCart size={18} /> Ajouter au panier</>
                    }
                </button>
            </div>
        </div>
    );
}
