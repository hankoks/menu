import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import './BorcelleTemplate.css';

export default function BorcelleTemplate() {
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
        document.querySelectorAll('.bc-item').forEach(el => observer.observe(el));
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
        saveOrder('Commande Borcelle');
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
        '--bc-terra': branding.bcTerra || '#c2603e',
        '--bc-ink': branding.bcInk || '#2b2118',
        '--bc-cream': branding.bcCream || '#faf4ec',
        '--bc-paper': branding.bcPaper || '#f3ead9',
        '--bc-muted': branding.bcMuted || '#8a7f70',
        '--bc-olive': branding.bcOlive || '#6b7250',
        '--bc-gold': branding.bcGold || '#b98a3c',
        '--bc-terra-soft': 'rgba(194, 96, 62, .12)',
    };

    const [namePart1, ...nameParts] = (branding.name || 'Le Jardin').split(' ');
    const namePart2 = nameParts.join(' ');

    return (
        <div className="bc-root" style={cssVars}>

            {/* ========== HERO ========== */}
            <section className="bc-hero">
                <div className="bc-circle bc-c1" />
                <div className="bc-circle bc-c2" />
                <div className="bc-circle bc-c3" />

                <div className="bc-hero-kicker">Carte · {new Date().getFullYear()}</div>
                <h1 className="bc-hero-title">{namePart1}{namePart2 ? <><br /><em>{namePart2}</em></> : ''}</h1>
                <p className="bc-hero-sub">{branding.tagline || 'Une cuisine d\'inspiration, préparée chaque jour avec des produits frais.'}</p>
                <div className="bc-scroll-cue">Défiler</div>
            </section>

            {/* ========== STICKY CATEGORY TABS ========== */}
            <nav className="bc-tabs">
                {catList.map(c => (
                    <button key={c} className={`bc-tab ${currentCat === c ? 'active' : ''}`} onClick={() => setCurrentCat(c)}>
                        {c === 'all' ? 'Tout' : c}
                    </button>
                ))}
            </nav>

            {/* ========== MENU EDITORIAL GRID ========== */}
            <main className="bc-menu" id="bc-menu">
                {categoriesInView.map((cat, catIdx) => {
                    const items = filteredMenu.filter(d => d.category === cat);
                    if (!items.length) return null;
                    const num = String(catIdx + 1).padStart(2, '0');
                    return (
                        <div key={cat}>
                            <div className="bc-section-head">
                                <span className="bc-sec-num">{num}</span>
                                <h2 className="bc-sec-title">{cat}</h2>
                                <span className="bc-sec-line" />
                                <span className="bc-sec-note">{items.length} plat{items.length > 1 ? 's' : ''}</span>
                            </div>
                            <div className="bc-items">
                                {items.map((d, i) => {
                                    const img = d.images?.[0] || `https://placehold.co/64x64/f3ead9/8a7f70?text=${encodeURIComponent(d.name[0])}`;
                                    const isNew = d.badge?.text === 'Nouveau';
                                    return (
                                        <div
                                            key={d.id}
                                            className="bc-item"
                                            onClick={() => openProduct(d)}
                                        >
                                            <div className="bc-it-img">
                                                <img src={img} alt={d.name} loading="lazy" />
                                            </div>
                                            <div className="bc-it-body">
                                                <div className="bc-it-top">
                                                    <span className="bc-it-name">{d.name}</span>
                                                    <span className="bc-it-dots" />
                                                </div>
                                                <p className="bc-it-desc">{d.desc}</p>
                                                {(d.badge || d.extras?.length) && (
                                                    <div className="bc-it-tags">
                                                        {d.badge && <span className={`bc-it-tag ${isNew ? 'new' : ''}`}>{d.badge.text}</span>}
                                                        {d.extras?.length > 0 && <span className="bc-it-tag">+ Suppléments</span>}
                                                        {d.hasVariants && <span className="bc-it-tag">Plusieurs tailles</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="bc-it-price">{d.price} DH</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
                {filteredMenu.length === 0 && <div className="bc-empty">😕 Aucun plat trouvé pour cette catégorie.</div>}
            </main>

            {/* ========== FOOTER ========== */}
            <footer className="bc-footer">
                <div className="bc-footer-logo">
                    {namePart1}<span>{namePart2 ? ` ${namePart2}` : ''}</span>
                </div>
                <p>{branding.tagline || ''}</p>
                <p style={{ marginTop: 8 }}>Ouvert tous les jours · 12h — 23h</p>
            </footer>

            {/* ========== PRODUCT OVERLAY ========== */}
            <div className={`bc-overlay ${selectedProduct ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setSelectedProduct(null); }}>
                <div className="bc-sheet">
                    <button className="bc-close" onClick={() => setSelectedProduct(null)}>✕</button>
                    {selectedProduct && (
                        <>
                            <img className="bc-sheet-img" src={selectedProduct.images?.[0] || `https://placehold.co/480x230/f3ead9/8a7f70?text=${encodeURIComponent(selectedProduct.name)}`} alt={selectedProduct.name} />
                            <h2 className="bc-sheet-name">{selectedProduct.name}</h2>
                            <div className="bc-sheet-meta">
                                <span>{selectedProduct.category}</span>
                                <span>·</span>
                                <span>♥ <b>{Math.floor(Math.random() * 300 + 80)}</b></span>
                            </div>
                            <p className="bc-sheet-desc">{selectedProduct.desc}</p>

                            {/* Variants */}
                            {hasVariants && (
                                <>
                                    <span className="bc-variants-title">Choisissez votre taille</span>
                                    {selectedProduct.variants.map((v, i) => (
                                        <div key={i} className={`bc-variant-row ${selectedVariant?.name === v.name ? 'selected' : ''}`} onClick={() => setSelectedVariant(v)}>
                                            <span>{v.name}</span>
                                            <span className="bc-variant-price">{v.price} DH</span>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* Extras */}
                            {hasExtras && (
                                <>
                                    <span className="bc-extras-title">Suppléments</span>
                                    {selectedProduct.extras.filter(ex => ex.isAvailable !== false).map((ex, i) => {
                                        const checked = !!selectedExtras.find(e => e.name === ex.name);
                                        return (
                                            <div key={i} className={`bc-extra-row ${checked ? 'selected' : ''}`} onClick={() => toggleExtra(ex)}>
                                                <span>{ex.name}</span>
                                                <span className="bc-extra-price">+{ex.price} DH</span>
                                            </div>
                                        );
                                    })}
                                </>
                            )}

                            <div className="bc-sheet-foot">
                                <div className="bc-qty">
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                                    <span>{qty}</span>
                                    <button onClick={() => setQty(q => q + 1)}>+</button>
                                </div>
                                <button className="bc-add-btn" onClick={handleAddToCart} disabled={!canAdd}>
                                    {canAdd ? `Ajouter · ${unitPrice * qty} DH` : 'Choisir une taille'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ========== CART BAR (fixed) ========== */}
            {!cartOpen && (
                <div className="bc-cart-bar" onClick={() => setCartOpen(true)}>
                    <div className="bc-cart-bar-left">
                        <div className="bc-cart-count">{cartCount}</div>
                        <span className="bc-cart-bar-label">{cartCount === 0 ? 'Panier vide' : 'Voir le Panier'}</span>
                    </div>
                    <span className="bc-cart-total">{cartTotal > 0 ? `${cartTotal} DH` : '—'}</span>
                </div>
            )}

            {/* ========== CART PANEL ========== */}
            <div className={`bc-cart-overlay ${cartOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setCartOpen(false); }}>
                <div className="bc-cart-panel">
                    <div className="bc-cart-head">
                        <h2>Panier</h2>
                        <button className="bc-cart-close" onClick={() => setCartOpen(false)}>✕</button>
                    </div>
                    {cart.length === 0 ? (
                        <p style={{ color: 'var(--bc-muted)', textAlign: 'center', padding: '30px 0', fontWeight: 300 }}>Votre panier est vide 🛒</p>
                    ) : (
                        <>
                            {cart.map(item => (
                                <div key={item.cartId} className="bc-cart-item">
                                    <img src={item.images?.[0] || `https://placehold.co/56x56/f3ead9/8a7f70?text=${encodeURIComponent(item.name[0])}`} alt={item.name} />
                                    <div>
                                        <div className="bc-cart-item-name">{item.name}{item.variantName ? ` (${item.variantName})` : ''}</div>
                                        <div className="bc-cart-item-price">{item.price} DH</div>
                                    </div>
                                    <div className="bc-cart-controls">
                                        <button onClick={() => updateQuantity(item.cartId, -1)}>−</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.cartId, 1)}>+</button>
                                    </div>
                                </div>
                            ))}
                            <div className="bc-cart-summary">
                                <div>
                                    <div style={{ fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--bc-muted)' }}>Total</div>
                                    <div className="bc-cart-summary-total">{cartTotal} DH</div>
                                </div>
                                <button className="bc-checkout-btn" onClick={handleCheckout}>Valider</button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ========== TOAST ========== */}
            <div className={`bc-toast ${isToastVisible ? 'show' : ''}`}>{toastMsg}</div>
        </div>
    );
}
