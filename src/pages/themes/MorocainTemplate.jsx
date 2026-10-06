import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import './MorocainTemplate.css';
import '@fontsource/amiri';

export default function MorocainTemplate() {
    const { menu, branding, cart, cartCount, cartTotal, addToCart, updateQuantity, saveOrder } = useAppContext();

    const [currentCat, setCurrentCat] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [qty, setQty] = useState(1);
    const [cartOpen, setCartOpen] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [isToastVisible, setIsToastVisible] = useState(false);

    // Load Google Fonts once
    useEffect(() => {
        if (!document.getElementById('mc-fonts')) {
            const link = document.createElement('link');
            link.id = 'mc-fonts';
            link.href = 'https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }, []);

    // IntersectionObserver for scroll-reveal
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.mc-item').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [currentCat, menu]);

    const showToast = (msg) => {
        setToastMsg(msg);
        setIsToastVisible(true);
        setTimeout(() => setIsToastVisible(false), 2200);
    };

    const openProduct = (product) => {
        setSelectedProduct(product);
        setSelectedVariant(null);
        setSelectedExtras([]);
        setQty(1);
    };

    const toggleExtra = (extra) => {
        const exists = selectedExtras.find(e => e.name === extra.name);
        if (exists) setSelectedExtras(selectedExtras.filter(e => e.name !== extra.name));
        else setSelectedExtras([...selectedExtras, extra]);
    };

    const hasVariants = selectedProduct?.hasVariants && selectedProduct?.variants?.length > 0;
    const hasExtras = selectedProduct?.extras?.length > 0;
    const basePrice = hasVariants
        ? (selectedVariant ? selectedVariant.price : Math.min(...(selectedProduct?.variants?.map(v => v.price) || [0])))
        : (selectedProduct?.price || 0);
    const extrasPrice = selectedExtras.reduce((s, ex) => s + Number(ex.price), 0);
    const unitPrice = basePrice + extrasPrice;
    const canAdd = !hasVariants || selectedVariant;

    const handleAddToCart = () => {
        if (!selectedProduct) return;
        if (!canAdd) { showToast('Choisissez une taille d\'abord.'); return; }
        const cartItem = {
            ...selectedProduct,
            price: unitPrice,
            ...(hasVariants && selectedVariant ? { variantName: selectedVariant.name } : {}),
            selectedExtras: selectedExtras.length > 0 ? [...selectedExtras] : undefined,
        };
        for (let i = 0; i < qty; i++) addToCart(cartItem);
        showToast(`${qty}x ${selectedProduct.name} ajoute`);
        setSelectedProduct(null);
    };

    const handleCheckout = () => {
        saveOrder('Commande Marocain');
        setCartOpen(false);
        showToast('Commande validee !');
    };

    const catList = ['all', ...new Set(menu.map(i => i.category).filter(Boolean))];
    const filteredMenu = menu.filter(d => currentCat === 'all' || d.category === currentCat);
    const categoriesInView = currentCat === 'all'
        ? [...new Set(menu.map(i => i.category).filter(Boolean))]
        : [currentCat];

    const cssVars = {
        '--mc-terra': branding.mcTerra || '#d4af37',
        '--mc-ink': branding.mcInk || '#132e18',
        '--mc-cream': branding.mcCream || '#f5f0e6',
        '--mc-paper': branding.mcPaper || '#ffffff',
        '--mc-muted': branding.bcMuted || '#8a7f70',
        '--mc-olive': branding.bcOlive || '#6b7250',
        '--mc-gold': branding.bcGold || '#b98a3c',
        '--mc-terra-soft': 'rgba(212, 175, 55, .12)',
    };

    return (
        <div className="mc-root" style={cssVars}>

            {/* HERO */}
            <section className="mc-hero">
                <div className="mc-hero-media">
                    <img
                        src={branding.heroImage || 'https://images.unsplash.com/photo-1541363654512-5cb0ef7df590?auto=format&fit=crop&w=600&q=80'}
                        alt="Hero"
                        loading="lazy"
                    />
                </div>
                <div className="mc-hero-content">
                    <div className="mc-hero-subtitle">{branding.subtitle || 'Restaurant'}</div>
                    <h1 className="mc-hero-title">{branding.name || 'Le Riad'}</h1>
                    <p className="mc-hero-desc">{branding.tagline || 'Une evasion culinaire marocaine authentique.'}</p>
                </div>
            </section>

            {/* STICKY CATEGORY TABS */}
            <nav className="mc-tabs">
                {catList.map(c => (
                    <button key={c} className={`mc-tab ${currentCat === c ? 'active' : ''}`} onClick={() => setCurrentCat(c)}>
                        {c === 'all' ? 'Tout' : c}
                    </button>
                ))}
            </nav>

            {/* MENU GRID */}
            <main className="mc-menu" id="mc-menu">
                {categoriesInView.map((cat, catIdx) => {
                    const items = filteredMenu.filter(d => d.category === cat);
                    if (!items.length) return null;
                    const num = String(catIdx + 1).padStart(2, '0');
                    return (
                        <div key={cat}>
                            <div className="mc-section-head">
                                <span className="mc-sec-num">{num}</span>
                                <h2 className="mc-sec-title">{cat}</h2>
                                <span className="mc-sec-line" />
                                <span className="mc-sec-note">{items.length} plat{items.length > 1 ? 's' : ''}</span>
                            </div>
                            <div className="mc-items">
                                {items.map((d) => {
                                    const img = d.images?.[0] || `https://placehold.co/90x90/f5f0e6/8a7f70?text=${encodeURIComponent(d.name[0])}`;
                                    const isNew = d.badge?.text === 'Nouveau';
                                    return (
                                        <div key={d.id} className="mc-item" onClick={() => openProduct(d)}>
                                            <div className="mc-it-img">
                                                <img src={img} alt={d.name} loading="lazy" />
                                            </div>
                                            <div className="mc-it-body">
                                                <div className="mc-it-top">
                                                    <span className="mc-it-name">{d.name}</span>
                                                    <span className="mc-it-dots" />
                                                </div>
                                                <p className="mc-it-desc">{d.desc}</p>
                                                {(d.badge || d.extras?.length) && (
                                                    <div className="mc-it-tags">
                                                        {d.badge && <span className={`mc-it-tag ${isNew ? 'new' : ''}`}>{d.badge.text}</span>}
                                                        {d.extras?.length > 0 && <span className="mc-it-tag">+ Supplements</span>}
                                                        {d.hasVariants && <span className="mc-it-tag">Plusieurs tailles</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="mc-it-price">{d.price} DH</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
                {filteredMenu.length === 0 && <div className="mc-empty">Aucun plat trouve pour cette categorie.</div>}
            </main>

            {/* FOOTER */}
            <footer className="mc-footer">
                <div className="mc-footer-logo">{branding.name || 'Le Riad'}</div>
                <p>{branding.tagline || ''}</p>
                <p style={{ marginTop: 8 }}>Ouvert tous les jours - 12h -- 23h</p>
            </footer>

            {/* PRODUCT OVERLAY */}
            {selectedProduct && (
                <div className="mc-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setSelectedProduct(null); }}>
                    <div className="mc-sheet">
                        <div className="mc-sheet-img">
                            <img
                                src={selectedProduct.images?.[0] || `https://placehold.co/480x300/f5f0e6/8a7f70?text=${encodeURIComponent(selectedProduct.name)}`}
                                alt={selectedProduct.name}
                            />
                            <button className="mc-sheet-close" onClick={() => setSelectedProduct(null)}>x</button>
                        </div>
                        <div className="mc-sheet-head">
                            <h2 className="mc-sheet-title">{selectedProduct.name}</h2>
                            <div className="mc-sheet-price">{unitPrice * qty} DH</div>
                            <p className="mc-sheet-desc">{selectedProduct.desc}</p>
                        </div>
                        <div className="mc-sheet-scroll">
                            {/* Variants */}
                            {hasVariants && (
                                <>
                                    <p style={{ fontWeight: 600, marginBottom: 10 }}>Choisissez votre taille</p>
                                    {selectedProduct.variants.map((v, i) => (
                                        <div key={i} className={`mc-var-btn ${selectedVariant?.name === v.name ? 'active' : ''}`} onClick={() => setSelectedVariant(v)}>
                                            <span>{v.name}</span>
                                            <span>{v.price} DH</span>
                                        </div>
                                    ))}
                                </>
                            )}
                            {/* Extras */}
                            {hasExtras && (
                                <>
                                    <p style={{ fontWeight: 600, margin: '16px 0 10px' }}>Supplements</p>
                                    {selectedProduct.extras.filter(ex => ex.isAvailable !== false).map((ex, i) => {
                                        const checked = !!selectedExtras.find(e => e.name === ex.name);
                                        return (
                                            <div key={i} className={`mc-var-btn ${checked ? 'active' : ''}`} onClick={() => toggleExtra(ex)}>
                                                <span>{ex.name}</span>
                                                <span>+{ex.price} DH</span>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                        {/* Add bar */}
                        <div className="mc-add-bar">
                            <div className="mc-qty-ctrl">
                                <button className="mc-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                                <span className="mc-qty-num">{qty}</span>
                                <button className="mc-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
                            </div>
                            <button
                                className="mc-add-submit"
                                onClick={handleAddToCart}
                                disabled={!canAdd}
                                style={{ opacity: canAdd ? 1 : 0.5, cursor: canAdd ? 'pointer' : 'not-allowed' }}
                            >
                                <span>{canAdd ? 'Ajouter au panier' : 'Choisir une taille'}</span>
                                <span>{unitPrice * qty} DH</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CART FLOAT BUTTON */}
            {cartCount > 0 && !cartOpen && (
                <button className="mc-cart-float" onClick={() => setCartOpen(true)}>
                    <div className="mc-cart-badge">{cartCount}</div>
                    <span>Voir le Panier</span>
                    <span>{cartTotal} DH</span>
                </button>
            )}

            {/* CART OVERLAY */}
            {cartOpen && (
                <div className="mc-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setCartOpen(false); }}>
                    <div className="mc-sheet">
                        <div className="mc-sheet-head" style={{ paddingTop: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 className="mc-sheet-title">Panier</h2>
                                <button className="mc-sheet-close" onClick={() => setCartOpen(false)} style={{ position: 'static', boxShadow: 'none', background: '#eee' }}>x</button>
                            </div>
                        </div>
                        <div className="mc-sheet-scroll">
                            {cart.length === 0 ? (
                                <p style={{ color: 'var(--mc-muted)', textAlign: 'center', padding: '30px 0' }}>Votre panier est vide</p>
                            ) : (
                                cart.map(item => (
                                    <div key={item.cartId} className="mc-cart-item" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #e5e0d8' }}>
                                        <img src={item.images?.[0] || `https://placehold.co/56x56/f5f0e6/8a7f70?text=${encodeURIComponent(item.name[0])}`} alt={item.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600 }}>{item.name}{item.variantName ? ` (${item.variantName})` : ''}</div>
                                            <div style={{ color: 'var(--mc-terra)', fontWeight: 600 }}>{item.price} DH</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <button onClick={() => updateQuantity(item.cartId, -1)} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>-</button>
                                            <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.cartId, 1)} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>+</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {cart.length > 0 && (
                            <div className="mc-add-bar">
                                <div style={{ fontSize: '1rem', fontWeight: 600 }}>Total: {cartTotal} DH</div>
                                <button className="mc-add-submit" onClick={handleCheckout}>
                                    <span>Valider la commande</span>
                                    <span>{cartTotal} DH</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TOAST */}
            <div className={`mc-toast ${isToastVisible ? 'show' : ''}`}>{toastMsg}</div>
        </div>
    );
}
