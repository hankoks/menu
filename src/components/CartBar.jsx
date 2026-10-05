import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function CartBar() {
    const { cartCount, cartTotal } = useAppContext();
    const location = useLocation();

    if (cartCount === 0) return null;
    if (location.pathname.startsWith('/cart') || location.pathname.startsWith('/order')) return null;

    return (
        <Link to="/cart" className="cart-bar" aria-label="Voir le panier">
            <div className="cart-bar-left">
                <div className="cart-bar-icon">
                    <span>🛒</span>
                    <span className="cart-count">{cartCount}</span>
                </div>
                <span className="cart-bar-label">Voir le panier</span>
            </div>
            <div className="cart-bar-total">
                {cartTotal.toLocaleString('fr-FR')} DH →
            </div>
        </Link>
    );
}
