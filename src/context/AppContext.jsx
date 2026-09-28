import React, { createContext, useContext, useState, useEffect } from 'react';
import { menuData as initialMenu } from '../data';
import { pushOrderToSupabase, updateOrderStatusInDB } from '../config/supabaseHelper';

const AppContext = createContext();

const DEFAULT_BRANDING = {
  template: 'asia',
  name: 'Le Jardin',
  tagline: 'Une expérience culinaire unique, entre tradition et modernité.',
  logoEmoji: '🍴',
  logoImage: '',
  subtitle: 'RESTAURANT',
  accentColor: '#c9a86a',
  accentDark: '#b08f52',
  darkBg: '#1a1f24',
  darkBg2: '#11151a',
  bodyBg: '#f3efe7',
  heroImage: '',
  fontBody: "'Segoe UI', Georgia, serif",
  fontHeading: "Georgia, serif",
  // Asia App specific colors
  asiaAccent: '#d4574e',
  asiaDark: '#2e4372',
  asiaBg: '#f6f1e7',
  asiaText: '#2e3a52',
  // Borcelle Editorial specific colors
  bcTerra: '#c2603e',
  bcInk: '#2b2118',
  bcCream: '#faf4ec',
  bcPaper: '#f3ead9',
  bcMuted: '#8a7f70',
};

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [language, setLanguage] = useState('FR');
  const [table, setTable] = useState(() => {
    const urlParams = window.location ? new URLSearchParams(window.location.search) : null;
    const tableParam = urlParams?.get('table');
    if (tableParam) {
      localStorage.setItem('lj_table', tableParam);
      return tableParam;
    }
    return localStorage.getItem('lj_table') || 'À emporter';
  });
  const [branding, setBrandingState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lj_branding'));
      return saved ? { ...DEFAULT_BRANDING, ...saved } : DEFAULT_BRANDING;
    } catch { return DEFAULT_BRANDING; }
  });

  const setBranding = (updated) => {
    const next = { ...branding, ...updated };
    setBrandingState(next);
    localStorage.setItem('lj_branding', JSON.stringify(next));
  };

  // Inject CSS custom properties whenever branding changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--gold', branding.accentColor);
    root.style.setProperty('--gold-dark', branding.accentDark);
    root.style.setProperty('--dark', branding.darkBg);
    root.style.setProperty('--dark2', branding.darkBg2);
    root.style.setProperty('--font-heading', branding.fontHeading);
    document.body.style.background = branding.bodyBg;
    document.body.style.fontFamily = branding.fontBody;
  }, [branding]);


  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lj_orders')) || []; }
    catch { return []; }
  });
  const [menu, setMenu] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lj_menu'));
      if (!saved) return initialMenu;
      // Merge: keep saved items, add any new items from initialMenu not yet in saved
      const savedIds = new Set(saved.map(i => i.id));
      const newItems = initialMenu.filter(i => !savedIds.has(i.id));
      return [...saved, ...newItems];
    } catch { return initialMenu; }
  });

  // Persist menu & orders to localStorage on every change
  useEffect(() => { localStorage.setItem('lj_menu', JSON.stringify(menu)); }, [menu]);
  useEffect(() => { localStorage.setItem('lj_orders', JSON.stringify(orders)); }, [orders]);

  const getCartId = (item) => item.variantName ? `${item.id}-${item.variantName}` : item.id;

  const addToCart = (product) => {
    const cartId = getCartId(product);
    setCart((prev) => {
      const existing = prev.find((item) => getCartId(item) === cartId);
      if (existing) {
        return prev.map((item) =>
          getCartId(item) === cartId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, cartId }]; // Save cartId for easy use in Cart.jsx
    });
  };

  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => getCartId(item) !== cartId));
  };

  const clearCart = () => setCart([]);

  const updateQuantity = (cartId, amount) => {
    setCart((prev) =>
      prev.map((item) => {
        if (getCartId(item) === cartId) {
          const newQuantity = item.quantity + amount;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
        }
        return item;
      })
    );
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const saveOrder = async (note = '') => {
    if (cart.length === 0) return null;
    const orderId = Date.now();
    const serviceFee = cartTotal * 0.10;
    const grandTotal = cartTotal + serviceFee;

    const newOrder = {
      id: orderId,
      table,
      items: [...cart],
      subtotal: cartTotal,
      serviceFee,
      total: grandTotal,
      status: 'pending',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      note
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Await Supabase sync — log any error visibly
    try {
      const dbId = await pushOrderToSupabase(cart, { cartTotal, serviceFee, grandTotal }, table, note, orderId);
      if (!dbId) {
        alert('Erreur DB: La commande n\'a pas pu être envoyée au serveur. Vérifiez la console.');
      }
    } catch (err) {
      alert('Erreur critique lors de l\'envoi de la commande: ' + err.message);
    }

    return orderId;
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    // Background sync to Supabase
    updateOrderStatusInDB(orderId, status);
  };

  // Menu CRUD
  const addMenuItem = (item) => {
    const newItem = { ...item, id: Date.now() };
    setMenu((prev) => [...prev, newItem]);
  };

  const updateMenuItem = (updatedItem) => {
    setMenu((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };

  const deleteMenuItem = (id) => {
    setMenu((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        cart, addToCart, removeFromCart, clearCart, updateQuantity,
        cartTotal, cartCount,
        language, setLanguage,
        table, setTable,
        orders, saveOrder, updateOrderStatus,
        menu, addMenuItem, updateMenuItem, deleteMenuItem,
        branding, setBranding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
