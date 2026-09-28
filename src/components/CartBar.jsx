import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function CartBar() {
    const { cartCount, cartTotal } = useAppContext();
    const location = useLocation();

    if (cartCount === 0) return null;
    if (location.pathname.startsWith('/cart') || location.pathname.startsWith('/order')) return null;

    return (
        <div className="cart-bar" style={{ gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1, minWidth: 0 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 24, lineHeight: 1 }}>🛒</span>
                    <span className="cart-count" style={{ position: 'absolute', top: -8, right: -12, border: '2px solid var(--dark2)', background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 800 }}>
                        {cartCount}
                    </span>
                </div>
                <div className="cart-total" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cartTotal.toLocaleString('fr-FR')} DH
                </div>
            </div>
            <Link to="/cart" className="cart-btn" style={{ flexShrink: 0 }}>
                Panier <span aria-hidden="true">→</span>
            </Link>
        </div>
    );
}
