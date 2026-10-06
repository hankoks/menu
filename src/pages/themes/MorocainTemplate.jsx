import React, { useState, useEffect, useRef } from 'react';
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
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 700);

    const itemsRef = useRef([]);

    // Load Google Fonts once
    useEffect(() => {
        if (!document.getElementById('borcelle-fonts')) {
            const link = document.createElement('link');
            link.id = 'borcelle-fonts';
            link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Jost:wght@300;400;500&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }, []);

    // Mobile detection — update on resize
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 700);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
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

    // Helpers
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
        if (!canAdd) { showToast('⚠️ Choisissez une taille d\'abord.'); return; }
        const cartItem = {
            ...selectedProduct,
            price: unitPrice,
            ...(hasVariants && selectedVariant ? { variantName: selectedVariant.name } : {}),
            selectedExtras: selectedExtras.length > 0 ? [...selectedExtras] : undefined,
        };
        for (let i = 0; i < qty; i++) addToCart(cartItem);
        showToast(`✓ ${qty}× ${selectedProduct.name} ajouté`);
        setSelectedProduct(null);
    };

    const handleCheckout = () => {
        saveOrder('Commande Marocain');
        setCartOpen(false);
        showToast('🎉 Commande validée !');
    };

    // Build category list from real menu
    const catList = ['all', ...new Set(menu.map(i => i.category).filter(Boolean))];

    // Filter + group items by category
    const filteredMenu = menu.filter(d => currentCat === 'all' || d.category === currentCat);

    // Group items by category for editorial section display
    const categoriesInView = currentCat === 'all'
        ? [...new Set(menu.map(i => i.category).filter(Boolean))]
        : [currentCat];

    // Branding CSS vars
    const cssVars = {
        '--mc-terra': branding.mcTerra || '#d4af37',
        '--mc-ink': branding.mcInk || '#132e18',
        '--mc-cream': branding.mcCream || '#f5f0e6',
        '--mc-paper': branding.mcPaper || '#ffffff',
        '--mc-muted': branding.bcMuted || '#8a7f70',
        '--mc-olive': branding.bcOlive || '#6b7250',
        '--mc-gold': branding.bcGold || '#b98a3c',
        '--mc-terra-soft': 'rgba(194, 96, 62, .12)',
    };

    const [namePart1, ...nameParts] = (branding.name || 'Le Jardin').split(' ');
    const namePart2 = nameParts.join(' ');

    return (
        <div className="mc-root" style={cssVars}>

            {/* ========== HERO ========== */}
            <section className="mc-hero">
                <div className="mc-circle mc-c1" />
                <div className="mc-circle mc-c2" />
                <div className="mc-circle mc-c3" />

                <div className="mc-hero-kicker">Carte · {new Date().getFullYear()}</div>
                <h1 className="mc-hero-title">{namePart1}{namePart2 ? <><br /><em>{namePart2}</em></> : ''}</h1>
                <p className="mc-hero-sub">{branding.tagline || 'Une cuisine d\'inspiration, préparée chaque jour avec des produits frais.'}</p>
                <div className="mc-scroll-cue">Défiler</div>
            </section>

            {/* ========== STICKY CATEGORY TABS ========== */}
            <nav className="mc-tabs">
                {catList.map(c => (
                    <button key={c} className={`mc-tab ${currentCat === c ? 'active' : ''}`} onClick={() => setCurrentCat(c)}>
                        {c === 'all' ? 'Tout' : c}
                    </button>
                ))}
            </nav>

            {/* ========== MENU EDITORIAL GRID ========== */}
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
                                {items.map((d, i) => {
                                    const img = d.images?.[0] || `https://placehold.co/64x64/f3ead9/8a7f70?text=${encodeURIComponent(d.name[0])}`;
                                    const isNew = d.badge?.text === 'Nouveau';
                                    return (
                                        <div
                                            key={d.id}
                                            className="mc-item"
                                            onClick={() => openProduct(d)}
                                        >
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
                                                        {d.extras?.length > 0 && <span className="mc-it-tag">+ Suppléments</span>}
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
                {filteredMenu.length === 0 && <div className="mc-empty">😕 Aucun plat trouvé pour cette catégorie.</div>}
            </main>

            {/* ========== FOOTER ========== */}
            <footer className="mc-footer">
                <div className="mc-footer-logo">
                    {namePart1}<span>{namePart2 ? ` ${namePart2}` : ''}</span>
                </div>
                <p>{branding.tagline || ''}</p>
                <p style={{ marginTop: 8 }}>Ouvert tous les jours · 12h — 23h</p>
            </footer>

            {/* ========== PRODUCT OVERLAY ========== */}
            <div className={`mc-overlay ${selectedProduct ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setSelectedProduct(null); }}>
                <div className="mc-sheet">
                    <button className="mc-close" onClick={() => setSelectedProduct(null)}>✕</button>
                    {selectedProduct && (
                        <>
                            <img className="mc-sheet-img" src={selectedProduct.images?.[0] || `https://placehold.co/480x230/f3ead9/8a7f70?text=${encodeURIComponent(selectedProduct.name)}`} alt={selectedProduct.name} />
                            <h2 className="mc-sheet-name">{selectedProduct.name}</h2>
                            <div className="mc-sheet-meta">
                                <span>{selectedProduct.category}</span>
                                <span>·</span>
                                <span>♥ <b>{Math.floor(Math.random() * 300 + 80)}</b></span>
                            </div>
                            <p className="mc-sheet-desc">{selectedProduct.desc}</p>

                            {/* Variants */}
                            {hasVariants && (
                                <>
                                    <span className="mc-variants-title">Choisissez votre taille</span>
                                    {selectedProduct.variants.map((v, i) => (
                                        <div key={i} className={`mc-variant-row ${selectedVariant?.name === v.name ? 'selected' : ''}`} onClick={() => setSelectedVariant(v)}>
                                            <span>{v.name}</span>
                                            <span className="mc-variant-price">{v.price} DH</span>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* Extras */}
                            {hasExtras && (
                                <>
                                    <span className="mc-extras-title">Suppléments</span>
                                    {selectedProduct.extras.filter(ex => ex.isAvailable !== false).map((ex, i) => {
                                        const checked = !!selectedExtras.find(e => e.name === ex.name);
                                        return (
                                            <div key={i} className={`mc-extra-row ${checked ? 'selected' : ''}`} onClick={() => toggleExtra(ex)}>
                                                <span>{ex.name}</span>
                                                <span className="mc-extra-price">+{ex.price} DH</span>
                                            </div>
                                        );
                                    })}
                                </>
                            )}

                            <div className="mc-sheet-foot">
                                <div className="mc-qty">
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                                    <span>{qty}</span>
                                    <button onClick={() => setQty(q => q + 1)}>+</button>
                                </div>
                                <button className="mc-add-btn" onClick={handleAddToCart} disabled={!canAdd}>
                                    {canAdd ? `Ajouter · ${unitPrice * qty} DH` : 'Choisir une taille'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ========== CART BAR (fixed) ========== */}
            {!cartOpen && (
                <div className="mc-cart-bar" onClick={() => setCartOpen(true)}>
                    <div className="mc-cart-bar-left">
                        <div className="mc-cart-count">{cartCount}</div>
                        <span className="mc-cart-bar-label">{cartCount === 0 ? 'Panier vide' : 'Voir le Panier'}</span>
                    </div>
                    <span className="mc-cart-total">{cartTotal > 0 ? `${cartTotal} DH` : '—'}</span>
                </div>
            )}

            {/* ========== CART PANEL ========== */}
            <div className={`mc-cart-overlay ${cartOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setCartOpen(false); }}>
                <div className="mc-cart-panel">
                    <div className="mc-cart-head">
                        <h2>Panier</h2>
                        <button className="mc-cart-close" onClick={() => setCartOpen(false)}>✕</button>
                    </div>
                    {cart.length === 0 ? (
                        <p style={{ color: 'var(--mc-muted)', textAlign: 'center', padding: '30px 0', fontWeight: 300 }}>Votre panier est vide 🛒</p>
                    ) : (
                        <>
                            {cart.map(item => (
                                <div key={item.cartId} className="mc-cart-item">
                                    <img src={item.images?.[0] || `https://placehold.co/56x56/f3ead9/8a7f70?text=${encodeURIComponent(item.name[0])}`} alt={item.name} />
                                    <div>
                                        <div className="mc-cart-item-name">{item.name}{item.variantName ? ` (${item.variantName})` : ''}</div>
                                        <div className="mc-cart-item-price">{item.price} DH</div>
                                    </div>
                                    <div className="mc-cart-controls">
                                        <button onClick={() => updateQuantity(item.cartId, -1)}>−</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.cartId, 1)}>+</button>
                                    </div>
                                </div>
                            ))}
                            <div className="mc-cart-summary">
                                <div>
                                    <div style={{ fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--mc-muted)' }}>Total</div>
                                    <div className="mc-cart-summary-total">{cartTotal} DH</div>
                                </div>
                                <button className="mc-checkout-btn" onClick={handleCheckout}>Valider</button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ========== TOAST ========== */}
            <div className={`mc-toast ${isToastVisible ? 'show' : ''}`}>{toastMsg}</div>
        </div>
    );
}
