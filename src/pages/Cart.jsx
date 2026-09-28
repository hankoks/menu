import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
    const { cart, cartTotal, updateQuantity, removeFromCart, clearCart, saveOrder } = useAppContext();
    const navigate = useNavigate();
    const [note, setNote] = useState('');
    const [noteOpen, setNoteOpen] = useState(false);

    const service = cartTotal * 0.10;
    const grand = cartTotal + service;

    const handleOrder = async () => {
        const orderId = await saveOrder(note);
        if (orderId) navigate(`/order/${orderId}`);
    };

    return (
        <main style={{ maxWidth: '980px', margin: '0 auto', padding: '28px 20px', paddingBottom: 40 }}>

            {/* ===== PAGE HEADER ===== */}
            <div className="page-head">
                <div className="left">
                    <button className="back-btn" onClick={() => navigate(-1)}>←</button>
                    <div>
                        <h2>🛒 Mon panier</h2>
                        <p>Vérifiez votre commande avant de passer à la caisse.</p>
                    </div>
                </div>
                {cart.length > 0 && (
                    <button className="clear-btn" onClick={clearCart}>
                        🗑 Vider le panier
                    </button>
                )}
            </div>

            {/* ===== EMPTY STATE ===== */}
            {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card)', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
                    <h4 style={{ fontFamily: 'Georgia,serif', fontSize: 22, marginBottom: 10 }}>Votre panier est vide</h4>
                    <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Ajoutez quelques plats délicieux !</p>
                    <button className="btn-gold" style={{ margin: '0 auto' }} onClick={() => navigate('/')}>
                        Retour au Menu
                    </button>
                </div>
            ) : (
                <>
                    {/* ===== CART ITEMS ===== */}
                    <div id="cart-items">
                        {cart.map(item => (
                            <div className="item" key={item.cartId}>
                                {/* Item image */}
                                <div
                                    className="item-img"
                                    style={{
                                        background: item.images?.length > 0
                                            ? '#f5f2ec'
                                            : `linear-gradient(135deg, ${item.colors[0]}, ${item.colors[1]})`,
                                        overflow: 'hidden'
                                    }}
                                >
                                    {item.images?.length > 0 ? (
                                        <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        item.icon || '🍽️'
                                    )}
                                </div>

                                {/* Item info */}
                                <div className="item-info">
                                    <h4>
                                        <span>
                                            {item.name}
                                            {item.variantName && (
                                                <span style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: 400, marginLeft: 6 }}>
                                                    ({item.variantName})
                                                </span>
                                            )}
                                        </span>
                                        <button className="remove-x" onClick={() => removeFromCart(item.cartId)}>✕</button>
                                    </h4>

                                    {item.selectedExtras?.length > 0 && (
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                                            {item.selectedExtras.map((ex, i) => (
                                                <span key={i} style={{ fontSize: 11, background: '#f3efe7', color: '#888', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>
                                                    + {ex.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <p>{item.desc}</p>

                                    <div className="item-bottom">
                                        <span className="item-price">{item.price} DH</span>
                                        <div className="qty">
                                            <button onClick={() => updateQuantity(item.cartId, -1)}>−</button>
                                            <span className="q">{item.quantity}</span>
                                            <button className="plus" onClick={() => updateQuantity(item.cartId, 1)}>+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ===== NOTE CARD (matches panier.html) ===== */}
                    <div className="note-card" onClick={() => setNoteOpen(!noteOpen)}>
                        <span className="ic">🍴</span>
                        <div className="txt">
                            <h5>Ajouter une note</h5>
                            <p>{note || 'Ex : Sans oignon, bien cuit, etc...'}</p>
                        </div>
                        <span className="arrow">{noteOpen ? '↑' : '›'}</span>
                    </div>

                    {noteOpen && (
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="ex: Sans oignons, pas trop cuit..."
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '1px solid #e0d8c6',
                                background: '#fff',
                                minHeight: '80px',
                                fontSize: 14,
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                marginBottom: 20,
                                boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                                display: 'block'
                            }}
                        />
                    )}

                    {/* ===== TOTALS (matches panier.html) ===== */}
                    <div className="totals">
                        <div className="row">
                            <span>Sous-total</span>
                            <span>{cartTotal.toLocaleString('fr-FR')} DH</span>
                        </div>
                        <div className="row">
                            <span>Frais de service (10%)</span>
                            <span>{service.toLocaleString('fr-FR')} DH</span>
                        </div>
                        <div className="divider"></div>
                        <div className="row grand">
                            <span>Total</span>
                            <span>{grand.toLocaleString('fr-FR')} DH</span>
                        </div>
                    </div>

                    {/* ===== ACTIONS (matches panier.html) ===== */}
                    <div className="actions">
                        <button className="btn-outline" onClick={() => navigate('/')}>← Continuer le menu</button>
                        <button className="btn-gold" onClick={handleOrder}>📋 Passer la commande →</button>
                    </div>
                </>
            )}
        </main>
    );
}
