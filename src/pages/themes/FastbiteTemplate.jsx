import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import './FastbiteTemplate.css';

export default function FastbiteTemplate() {
    const { menu, branding, cart, cartCount, cartTotal, addToCart, updateQuantity, saveOrder } = useAppContext();
    const [currentCat, setCurrentCat] = useState('all');
    const [toastMsg, setToastMsg] = useState('');
    const [isToastVisible, setIsToastVisible] = useState(false);

    // Overlay states
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);

    useEffect(() => {
        // Load fonts if they don't exist
        if (!document.getElementById('fastbite-fonts')) {
            const link = document.createElement('link');
            link.id = 'fastbite-fonts';
            link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rubik:wght@300;400;500;600;700&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }, []);

    // Filter categories
    const catList = ['all', ...new Set(menu.map(i => i.category))];
    const filteredList = menu.filter(d => currentCat === 'all' || d.category === currentCat);

    // Identify featured items for the top scrolling "Combo" showcase (e.g. ones with red badges or "Nouveau")
    const featuredItems = menu.filter(item => item.badge?.type === 'red' || item.badge?.text === 'Nouveau' || item.badge?.text?.toLowerCase().includes('combo'));

    const showToast = (msg) => {
        setToastMsg(msg);
        setIsToastVisible(true);
        setTimeout(() => setIsToastVisible(false), 2200);
    };

    const toggleExtra = (extra) => {
        const exists = selectedExtras.find(e => e.name === extra.name);
        if (exists) {
            setSelectedExtras(selectedExtras.filter(e => e.name !== extra.name));
        } else {
            setSelectedExtras([...selectedExtras, extra]);
        }
    };

    const hasVariants = selectedProduct?.hasVariants && selectedProduct?.variants?.length > 0;
    const hasExtras = selectedProduct?.extras?.length > 0;
    const basePrice = hasVariants
        ? (selectedVariant ? selectedVariant.price : Math.min(...selectedProduct.variants.map(v => v.price)))
        : (selectedProduct?.price || 0);
    const extrasPrice = selectedExtras.reduce((s, ex) => s + Number(ex.price), 0);
    const unitPrice = basePrice + extrasPrice;
    const canAdd = !hasVariants || selectedVariant;

    const quickAdd = (e, product) => {
        e.stopPropagation();
        if (product.hasVariants) {
            setSelectedProduct(product);
            setQty(1);
            setSelectedVariant(null);
            setSelectedExtras([]);
            return;
        }
        addToCart({ ...product, quantity: 1 });
        showToast('✅ ' + product.name + ' ajouté !');
    };

    const handleOrder = () => {
        if (!selectedProduct) return;
        if (!canAdd) {
            showToast('⚠️ Vous devez choisir une taille.');
            return;
        }
        const cartItem = {
            ...selectedProduct,
            price: unitPrice,
            ...(hasVariants && selectedVariant ? { variantName: selectedVariant.name } : {}),
            selectedExtras: selectedExtras.length > 0 ? [...selectedExtras] : undefined,
        };
        for (let i = 0; i < qty; i++) {
            addToCart(cartItem);
        }
        showToast(`✅ ${qty}× ${selectedProduct.name} ajouté(s) !`);
        setSelectedProduct(null);
    };

    const handleCheckout = () => {
        if (cartCount === 0) return;
        saveOrder("Commande de Fastbite");
        setCartOpen(false);
        showToast("🚀 Commande validée et envoyée en cuisine !");
    };

    const logoParts = (branding.name || 'FAST BITE').split(' ');
    const firstWord = logoParts[0];
    const restWords = logoParts.slice(1).join(' ');

    return (
        <div className="fb-root" style={{
            '--fb-red': branding.fbRed || '#e8362d',
            '--fb-yellow': branding.fbYellow || '#ffc91f',
            '--fb-dark': branding.fbDark || '#17161a',
            '--fb-card': branding.fbCard || '#232227',
        }}>
            {/* Speed Elements */}
            <div className="fb-speed fb-s1"></div>
            <div className="fb-speed fb-s2"></div>
            <div className="fb-speed fb-s3"></div>

            {/* Header */}
            <header className="fb-header">
                <div className="fb-logo">
                    <span className="fb-zap">{branding.logoEmoji || '⚡'}</span> {firstWord} <em>{restWords}</em>
                </div>
                <div className="fb-header-right">
                    <div className="fb-promo-pill">🔥 -20% SUR LES COMBOS</div>
                    <button className="fb-cart-fab" onClick={() => setCartOpen(true)}>
                        🛒<span className="fb-cart-count">{cartCount}</span>
                    </button>
                </div>
            </header>

            {/* Hero */}
            <section className="fb-hero">
                <div className="fb-hero-tag">OUVERT 7J/7 · PRÉPARÉ À LA COMMANDE</div>
                <h1>GROSSE <span className="fb-stroke">FAIM?</span><br /><span className="fb-red-text">ON ASSURE.</span></h1>
                <p>{branding.tagline || 'Burgers smashés, buckets croustillants et combos généreux. Livré chaud.'}</p>
            </section>

            {/* Marquee */}
            <div className="fb-marquee">
                <span className="fb-marquee-track">
                    🍔 SMASH BURGER <b>·</b> 🍗 BUCKET 8 PIÈCES <b>·</b> 🍟 FRITES MAISON <b>·</b> 🥤 MILKSHAKE <b>·</b> 🌮 TACOS XL <b>·</b> 🍔 SMASH BURGER <b>·</b> 🍗 BUCKET 8 PIÈCES <b>·</b>
                </span>
            </div>

            {/* Categories */}
            <nav className="fb-cats">
                {catList.map(c => (
                    <button key={c} className={`fb-cat ${currentCat === c ? 'active' : ''}`} onClick={() => setCurrentCat(c)}>
                        <span className="ic">{c === 'all' ? '🔥' : (c.toLowerCase().includes('burger') ? '🍔' : '🍽️')}</span>
                        {c === 'all' ? 'Tout' : c}
                    </button>
                ))}
            </nav>

            {/* Featured Combos (Only in "all" view if featured items exist) */}
            {currentCat === 'all' && featuredItems.length > 0 && (
                <>
                    <section className="fb-section">
                        <div className="fb-sec-head">
                            <h2 className="fb-sec-title"><small>MEILLEURES VENTES</small>COMBOS 🔥</h2>
                            <span className="fb-sec-badge">-20%</span>
                        </div>
                    </section>
                    <div className="fb-combos">
                        {featuredItems.map((c) => (
                            <div key={c.id} className="fb-combo" onClick={() => { setSelectedProduct(c); setQty(1); setSelectedVariant(null); setSelectedExtras([]); }}>
                                <div className="fb-combo-img">
                                    <span className="fb-combo-tag">{c.badge?.text || 'POPULAIRE'}</span>
                                    {c.images && c.images.length > 0 ? (
                                        <img src={c.images[0]} alt={c.name} />
                                    ) : (
                                        <span className="fb-combo-emoji">{c.icon || '🔥'}</span>
                                    )}
                                </div>
                                <div className="fb-combo-body">
                                    <div className="fb-combo-name">{c.name}</div>
                                    <p className="fb-combo-desc">{c.desc}</p>
                                    <div className="fb-combo-foot">
                                        <span className="fb-combo-price">{c.price} DH</span>
                                        <button className="fb-mini-add" onClick={(e) => quickAdd(e, c)}>+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Standard Grid */}
            <section className="fb-section">
                <div className="fb-sec-head">
                    <h2 className="fb-sec-title"><small>À LA CARTE</small>LA CARTE</h2>
                </div>
                <div className="fb-grid">
                    {filteredList.map((d, i) => (
                        <div key={d.id} className="fb-product" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => {
                            setSelectedProduct(d); setQty(1); setSelectedVariant(null); setSelectedExtras([]);
                        }}>
                            <div className="fb-p-img">
                                {d.images && d.images.length > 0 ? (
                                    <img src={d.images[0]} alt={d.name} loading="lazy" />
                                ) : (
                                    <span className="fb-p-emoji">{d.icon || '🍔'}</span>
                                )}
                                <div className="fb-p-tags">
                                    {d.category.toLowerCase().includes('épicé') && <span className="fb-p-tag hot">🌶️ épicé</span>}
                                    {d.badge && <span className="fb-p-tag">{d.badge.text}</span>}
                                </div>
                            </div>
                            <div className="fb-p-body">
                                <div className="fb-p-name">{d.name}</div>
                                <p className="fb-p-desc">{d.desc}</p>
                                <div className="fb-p-foot">
                                    <span className="fb-p-price">
                                        {d.hasVariants ? `${Math.min(...d.variants.map(v => v.price))} DH` : `${d.price} DH`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredList.length === 0 && <div style={{ color: 'var(--fb-muted)', padding: '20px' }}>😕 Aucun plat trouvé</div>}
                </div>
            </section>

            {/* Footer */}
            <footer className="fb-footer">
                <div className="fb-logo" style={{ justifyContent: 'center' }}>
                    <span className="fb-zap">{branding.logoEmoji || '⚡'}</span> {firstWord} <em>{restWords}</em>
                </div>
                <p>Ouvert et prêt à servir</p>
            </footer>

            {/* Sticky Order Bar */}
            {!cartOpen && !selectedProduct && (
                <div className={`fb-order-bar ${cartCount > 0 ? 'show' : ''}`} onClick={() => setCartOpen(true)}>
                    <div className="fb-ob-info">
                        <span id="obCount">{cartCount} article{cartCount > 1 ? 's' : ''}</span>
                        <small id="obTotal">{cartTotal.toFixed(2)} DH</small>
                    </div>
                    <button className="fb-ob-btn" onClick={(e) => { e.stopPropagation(); setCartOpen(true); }}>COMMANDER →</button>
                </div>
            )}

            {/* Product Sheet (Overlay) */}
            <div className={`fb-overlay ${selectedProduct ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setSelectedProduct(null); }}>
                {selectedProduct && (
                    <div className="fb-sheet">
                        <div className="fb-grab" onClick={() => setSelectedProduct(null)}></div>
                        {selectedProduct.images && selectedProduct.images.length > 0 && (
                            <img className="fb-sheet-img" src={selectedProduct.images[0]} alt={selectedProduct.name} />
                        )}
                        <h2 className="fb-sheet-name">{selectedProduct.name}</h2>
                        <div className="fb-sheet-meta">
                            <span className="fb-chip">{selectedProduct.category}</span>
                            {selectedProduct.badge && <span className="fb-chip hot">{selectedProduct.badge.text}</span>}
                        </div>
                        <p className="fb-sheet-desc">{selectedProduct.desc}</p>

                        {/* Variants */}
                        {hasVariants && (
                            <>
                                <span className="fb-variants-title">Choisissez votre taille</span>
                                {selectedProduct.variants.map((v, i) => (
                                    <div key={i} className={`fb-extra ${selectedVariant?.name === v.name ? 'selected' : ''}`} onClick={() => setSelectedVariant(v)}>
                                        <label>
                                            <input type="radio" checked={selectedVariant?.name === v.name} readOnly /> {v.name}
                                        </label>
                                        <b>{v.price} DH</b>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Extras */}
                        {hasExtras && (
                            <div className="fb-extras">
                                <h4>+ EXTRAS</h4>
                                {selectedProduct.extras.filter(ex => ex.isAvailable !== false).map((ex, i) => {
                                    const checked = !!selectedExtras.find(e => e.name === ex.name);
                                    return (
                                        <div key={i} className={`fb-extra ${checked ? 'selected' : ''}`} onClick={() => toggleExtra(ex)}>
                                            <label>
                                                <input type="checkbox" checked={checked} readOnly /> {ex.name}
                                            </label>
                                            <b>+{ex.price} DH</b>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="fb-sheet-foot">
                            <div className="fb-qty">
                                <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                                <span>{qty}</span>
                                <button onClick={() => setQty(qty + 1)}>+</button>
                            </div>
                            <button className="fb-big-add" onClick={handleOrder} disabled={!canAdd}>
                                AJOUTER · {unitPrice * qty} DH
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Cart Overlay */}
            <div className={`fb-overlay ${cartOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setCartOpen(false); }}>
                <div className="fb-cart-panel" onClick={e => e.stopPropagation()}>
                    <div className="fb-cart-head">
                        <h2>PANIER</h2>
                        <button className="fb-cart-close" onClick={() => setCartOpen(false)}>✕</button>
                    </div>
                    {cart.length === 0 ? (
                        <div className="fb-empty-state">
                            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🛒</div>
                            Votre panier est affreusement vide...
                        </div>
                    ) : (
                        <>
                            <div className="fb-cart-items">
                                {cart.map(item => (
                                    <div key={item.cartId} className="fb-cart-item">
                                        {item.images && item.images.length > 0 ? (
                                            <img src={item.images[0]} className="fb-cart-item-img" alt="" />
                                        ) : (
                                            <div className="fb-cart-item-img">{item.icon || '🍔'}</div>
                                        )}
                                        <div className="fb-cart-item-info">
                                            <div className="fb-cart-item-name">{item.name}</div>
                                            {(item.variantName || (item.selectedExtras && item.selectedExtras.length > 0)) && (
                                                <div className="fb-cart-item-variant">
                                                    {item.variantName && <span>{item.variantName} </span>}
                                                    {item.selectedExtras && item.selectedExtras.length > 0 && (
                                                        <span>( + {item.selectedExtras.map(e => e.name).join(', ')} )</span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="fb-cart-item-price">{item.price} DH</div>
                                        </div>
                                        <div className="fb-cart-controls">
                                            <button onClick={() => updateQuantity(item.cartId, -1)}>−</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.cartId, 1)}>+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="fb-cart-summary">
                                <div className="fb-cart-total-row">
                                    <span>TOTAL</span>
                                    <span className="fb-cart-total-price">{cartTotal} DH</span>
                                </div>
                                <button className="fb-cart-checkout" onClick={handleCheckout}>
                                    VALIDER LA COMMANDE →
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Toast Notifications */}
            <div className={`fb-toast ${isToastVisible ? 'show' : ''}`}>{toastMsg}</div>
        </div>
    );
}
