import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import './AsiaTemplate.css';

export default function AsiaTemplate() {
    const { menu, branding, cart, cartCount, cartTotal, addToCart, updateQuantity, saveOrder } = useAppContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentCat, setCurrentCat] = useState('all');
    const [currentSort, setCurrentSort] = useState('pop');
    const [toastMsg, setToastMsg] = useState('');
    const [isToastVisible, setIsToastVisible] = useState(false);

    // Screens overlay states
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [isHearted, setIsHearted] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);

    useEffect(() => {
        // Load fonts if they don't exist
        if (!document.getElementById('asia-fonts')) {
            const link = document.createElement('link');
            link.id = 'asia-fonts';
            link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Patrick+Hand&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }, []);

    // Extract categories unique
    const catList = ['all', ...new Set(menu.map(i => i.category))];

    // Build the grid
    let filteredList = menu.filter(d => currentCat === 'all' || d.category === currentCat);
    if (searchQuery) {
        filteredList = filteredList.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // In our menu schema, `price` is there, `badge` might have "Nouveau" etc.
    if (currentSort === 'asc') filteredList.sort((a, b) => a.price - b.price);
    if (currentSort === 'desc') filteredList.sort((a, b) => b.price - a.price);
    if (currentSort === 'new') filteredList.sort((a, b) => (b.badge?.text === 'Nouveau' ? -1 : 1));
    if (currentSort === 'pop') filteredList.sort((a, b) => (b.badge?.type === 'red' ? -1 : 1)); // We use red "Best Seller" badge as pop

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
        setSelectedProduct(null); // Return to home
    };

    const handleCheckout = () => {
        if (cartCount === 0) return;
        saveOrder("Commande depuis Asia App");
        setCartOpen(false);
        showToast("🎉 Commande validée et envoyée en cuisine !");
    };

    return (
        <div className="asia-theme-wrapper" style={{
            '--asia-bg': branding.asiaBg || '#f6f1e7',
            '--asia-primary': branding.asiaAccent || '#d4574e',
            '--asia-dark': branding.asiaDark || '#2e4372',
            '--asia-text': branding.asiaText || '#2e3a52'
        }}>
            <div className="asia-phone">

                {/* ===== MENU SCREEN ===== */}
                <header className="asia-header">
                    <div className="asia-logo">
                        {branding.name ? branding.name.split(' ')[0] : 'Resto'}
                        <span>{branding.name ? branding.name.split(' ').slice(1).join(' ') : 'App'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div className="asia-avatar">
                            {branding.logoImage ? <img src={branding.logoImage} alt="" /> : (branding.logoEmoji || '🍜')}
                        </div>
                        <div className="asia-cart-btn" onClick={() => setCartOpen(true)}>
                            🛒<span className={`asia-cart-n ${cartCount > 0 ? 'bump' : ''}`} key={cartCount}>{cartCount}</span>
                        </div>
                    </div>
                </header>

                <div className="asia-search">
                    🔍 <input type="text" placeholder="Rechercher un plat..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>

                <nav className="asia-cats">
                    {catList.map(c => (
                        <button key={c} className={`asia-cat ${currentCat === c ? 'active' : ''}`} onClick={() => setCurrentCat(c)}>
                            <span className="ic">{c === 'all' ? '🍽️' : '🍲'}</span>
                            {c === 'all' ? 'Tout' : c}
                        </button>
                    ))}
                </nav>

                <div className="asia-sub">
                    <button className={currentSort === 'pop' ? 'active' : ''} onClick={() => setCurrentSort('pop')}>Populaire</button>
                    <button className={currentSort === 'new' ? 'active' : ''} onClick={() => setCurrentSort('new')}>Nouveau</button>
                    <button className={currentSort === 'asc' ? 'active' : ''} onClick={() => setCurrentSort('asc')}>Prix ↑</button>
                    <button className={currentSort === 'desc' ? 'active' : ''} onClick={() => setCurrentSort('desc')}>Prix ↓</button>
                </div>

                <h2 className="asia-section-title">— Notre Menu —</h2>

                <div className="asia-scroll">
                    <div className="asia-grid">
                        {filteredList.map((d, i) => {
                            const isNew = d.badge?.text === 'Nouveau';
                            const img = d.images?.[0] || 'https://via.placeholder.com/150';
                            return (
                                <div key={d.id} className="asia-dish" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => {
                                    setSelectedProduct(d); setQty(1); setIsHearted(false);
                                    setSelectedVariant(null); setSelectedExtras([]);
                                }}>
                                    <div className="asia-dish-img">
                                        {(isNew || d.badge) && <span className={`asia-status ${isNew ? 'new' : ''}`}>{d.badge.text}</span>}
                                        <span className="asia-dish-price">{d.price} DH</span>
                                        <img src={img} alt={d.name} loading="lazy" />
                                    </div>
                                    <div className="asia-dish-body">
                                        <div className="asia-dish-name">{d.name}</div>
                                        <div className="asia-dish-desc">{d.desc}</div>
                                        <div className="asia-dish-foot">
                                            <span className="asia-likes"><b>♥</b> {Math.floor(Math.random() * 300) + 50}</span>
                                            <span className="asia-arrow">→</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredList.length === 0 && <div className="asia-empty">😕 Aucun plat trouvé</div>}
                    </div>
                </div>

                {/* ===== PRODUCT SCREEN ===== */}
                <div className={`asia-screen ${selectedProduct ? 'open' : ''}`}>
                    {selectedProduct && (
                        <>
                            <div className="asia-p-top">
                                <button className="asia-back" onClick={() => setSelectedProduct(null)}>←</button>
                                <button className={`asia-heart ${isHearted ? 'pop' : ''}`} onClick={() => { setIsHearted(!isHearted); if (!isHearted) showToast('❤️ Ajouté aux favoris !'); }}>
                                    {isHearted ? '♥' : '♡'}
                                </button>
                            </div>
                            <div className="asia-p-img">
                                <img src={selectedProduct.images?.[0]} alt={selectedProduct.name} />
                            </div>
                            <h1 className="asia-p-name">{selectedProduct.name}</h1>
                            <div className="asia-p-stats">
                                <span>Plat</span><span className="cal">{selectedProduct.category}</span>
                                <span className="lk">♥ 428</span>
                            </div>
                            <p className="asia-p-desc">{selectedProduct.desc}</p>

                            {/* Variants Selection */}
                            {hasVariants && (
                                <div style={{ padding: '4px 26px' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--asia-dark)', marginTop: 8, marginBottom: 8, fontFamily: 'Patrick Hand' }}>Choisissez votre taille</h4>
                                    {selectedProduct.variants.map((v, i) => (
                                        <label key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.6)', borderRadius: 12, marginBottom: 8, cursor: 'pointer', border: selectedVariant?.name === v.name ? '2px solid var(--asia-primary)' : '2px solid transparent' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{v.name}</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--asia-primary)', display: 'flex', gap: 10, alignItems: 'center' }}>
                                                {v.price} DH
                                                <input type="radio" name="variant" checked={selectedVariant?.name === v.name} onChange={() => setSelectedVariant(v)} style={{ accentColor: 'var(--asia-primary)' }} />
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Extras Selection */}
                            {hasExtras && (
                                <div style={{ padding: '0 26px 20px', paddingBottom: 20 }}>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--asia-dark)', marginTop: 8, marginBottom: 8, fontFamily: 'Patrick Hand' }}>Ajouter des suppléments</h4>
                                    {selectedProduct.extras.filter(ex => ex.isAvailable !== false).map((ex, i) => {
                                        const checked = !!selectedExtras.find(e => e.name === ex.name);
                                        return (
                                            <label key={i} onClick={() => toggleExtra(ex)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.6)', borderRadius: 12, marginBottom: 8, cursor: 'pointer' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{ex.name}</span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--asia-dark)', display: 'flex', gap: 10, alignItems: 'center' }}>
                                                    +{ex.price} DH
                                                    <input type="checkbox" checked={checked} readOnly style={{ accentColor: 'var(--asia-primary)' }} />
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="asia-p-bottom">
                                <div className="asia-p-price">{unitPrice * qty} DH<small>+ livraison</small></div>
                                <div className="asia-p-actions">
                                    <div className="asia-qty">
                                        <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                                        <span>{qty}</span>
                                        <button onClick={() => setQty(qty + 1)}>+</button>
                                    </div>
                                    <button className="asia-order-btn" onClick={handleOrder} style={{ opacity: canAdd ? 1 : 0.6 }}>Commander</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ===== CART OVERLAY ===== */}
                <div className={`asia-cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)}>
                    <div className="asia-cart-panel" onClick={e => e.stopPropagation()}>
                        <div className="asia-cart-head">
                            <h2>Panier</h2>
                            <button className="asia-cart-close" onClick={() => setCartOpen(false)}>✕</button>
                        </div>
                        <div className="asia-scroll" style={{ padding: '0 0 20px', flex: 1 }}>
                            {cart.length === 0 ? (
                                <div className="asia-cart-empty">Votre panier est vide... 🛒</div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.cartId} className="asia-cart-item">
                                        <img src={item.images?.[0] || 'https://via.placeholder.com/60'} className="asia-cart-item-img" alt="" />
                                        <div className="asia-cart-item-info">
                                            <div className="asia-cart-item-name">{item.name}</div>
                                            <div className="asia-cart-item-price">{item.price} DH</div>
                                        </div>
                                        <div className="asia-cart-controls">
                                            <button onClick={() => updateQuantity(item.cartId, -1)}>−</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.cartId, 1)}>+</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {cart.length > 0 && (
                            <>
                                <div className="asia-cart-total">
                                    <span>Total:</span>
                                    <span>{cartTotal} DH</span>
                                </div>
                                <button className="asia-cart-checkout" onClick={handleCheckout}>
                                    Valider la commande
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className={`asia-toast ${isToastVisible ? 'show' : ''}`}>{toastMsg}</div>

                {/* ===== FLOATING CART BAR ===== */}
                {!cartOpen && !selectedProduct && (
                    <div className="asia-floating-cart" onClick={() => setCartOpen(true)}>
                        <div className="asi-fc-left">
                            <div className="asi-fc-count">{cartCount}</div>
                            <span>{cartCount === 0 ? 'Le Panier est vide' : 'Voir le Panier'}</span>
                        </div>
                        <div className="asi-fc-right">
                            {cartCount > 0 ? `${cartTotal} DH` : '0 DH'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
