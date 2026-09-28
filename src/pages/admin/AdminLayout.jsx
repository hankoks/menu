import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, ClipboardList, LogOut, ChevronRight, Menu, X, Globe, QrCode, Settings, Smartphone, Tablet, Eye, EyeOff, RefreshCw, Users, Grid } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';
import NotificationBell from '../../components/NotificationBell';

const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', emoji: '📊' },
    { to: '/admin/menu', icon: UtensilsCrossed, label: 'Menu', emoji: '🍽️' },
    { to: '/admin/orders', icon: ClipboardList, label: 'Commandes', emoji: '📋' },
    { to: '/admin/tables', icon: Grid, label: 'Tables', emoji: '🪑' },
    { to: '/admin/staff', icon: Users, label: 'Équipe', emoji: '👨‍🍳' },
    { to: '/admin/qr', icon: QrCode, label: 'QR Codes', emoji: '📱' },
    { to: '/admin/settings', icon: Settings, label: 'Personnalisation', emoji: '🎨' },
];

const PAGE_TITLES = {
    '/admin/dashboard': 'Tableau de bord',
    '/admin/menu': 'Gestion du Menu',
    '/admin/orders': 'Commandes',
    '/admin/qr': 'QR Codes',
    '/admin/settings': 'Personnalisation',
};

function PhoneFrame({ src, mode }) {
    const iframeRef = useRef(null);
    const [key, setKey] = useState(0);

    const isTablet = mode === 'tablet';
    const frameW = isTablet ? 420 : 320;
    const frameH = isTablet ? 640 : 680;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            {/* Refresh button */}
            <button
                onClick={() => setKey(k => k + 1)}
                title="Actualiser"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#555' }}
            >
                <RefreshCw size={13} /> Actualiser
            </button>

            {/* Phone / Tablet outer shell */}
            <div style={{
                width: frameW + 20,
                height: frameH + 60,
                background: '#1a1a2e',
                borderRadius: isTablet ? 22 : 44,
                padding: isTablet ? '16px 12px' : '22px 10px',
                boxShadow: '0 30px 80px rgba(0,0,0,0.45), 0 0 0 2px #333, inset 0 0 0 1px #555',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                position: 'relative',
            }}>
                {/* Top notch (phone only) */}
                {!isTablet && (
                    <div style={{ width: 80, height: 10, background: '#111', borderRadius: 10, flexShrink: 0 }} />
                )}

                {/* Screen */}
                <div style={{
                    width: frameW,
                    height: frameH,
                    borderRadius: isTablet ? 10 : 28,
                    overflow: 'hidden',
                    background: '#fff',
                    flexShrink: 0,
                    border: '1px solid #333',
                }}>
                    <iframe
                        key={key}
                        ref={iframeRef}
                        src={src}
                        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                        title="Menu Preview"
                    />
                </div>

                {/* Home bar (phone only) */}
                {!isTablet && (
                    <div style={{ width: 100, height: 4, background: '#444', borderRadius: 4, flexShrink: 0 }} />
                )}
            </div>
        </div>
    );
}

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewMode, setPreviewMode] = useState('mobile'); // 'mobile' | 'tablet'

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/admin');
            }
        };
        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_OUT' || !session) {
                    navigate('/admin');
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [navigate]);

    // Close sidebar on route change (mobile)
    useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

    const logout = async () => {
        await supabase.auth.signOut();
        navigate('/admin');
    };

    const previewSrc = window.location.origin + '/';
    const currentTitle = PAGE_TITLES[location.pathname] || 'Admin';

    return (
        <div className="admin-wrapper" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Mobile overlay */}
            {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* SIDEBAR */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <Link to="/admin/dashboard" className="admin-sidebar-logo">
                    <div className="logo-badge" style={{ width: 40, height: 40, fontSize: 18, flexShrink: 0 }}>🍴</div>
                    <div>
                        <div className="admin-sidebar-title">Le Jardin</div>
                        <div className="admin-sidebar-sub">Admin Panel</div>
                    </div>
                </Link>

                <nav className="admin-nav">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                            <ChevronRight size={14} className="admin-nav-chevron" />
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <Link to="/" className="admin-nav-item" style={{ color: '#aaa' }}>
                        <Globe size={16} /><span>Menu client</span>
                    </Link>
                    <button className="admin-nav-item admin-logout" onClick={logout}>
                        <LogOut size={16} /><span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <div className="admin-main" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                {/* TOP HEADER BAR */}
                <div className="admin-topbar">
                    <div className="admin-topbar-left">
                        <button className="admin-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <h3 className="admin-topbar-title">{currentTitle}</h3>
                    </div>

                    {/* QUICK NAV PILLS */}
                    <div className="admin-quick-nav">
                        {navItems.map(({ to, emoji, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) => `admin-quick-pill ${isActive ? 'active' : ''}`}
                            >
                                {emoji} {label}
                            </NavLink>
                        ))}
                    </div>

                    <NotificationBell />

                    {/* PREVIEW TOGGLE */}
                    <button
                        onClick={() => setShowPreview(p => !p)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                            background: showPreview ? 'var(--gold)' : '#f0ede8',
                            color: showPreview ? '#fff' : '#555',
                            flexShrink: 0, transition: 'all .2s'
                        }}
                    >
                        {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
                        {showPreview ? 'Masquer' : 'Preview'}
                    </button>
                </div>

                {/* CONTENT + PREVIEW */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Page content */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <Outlet />
                    </div>

                    {/* PREVIEW PANEL */}
                    {showPreview && (
                        <div style={{
                            width: 400, flexShrink: 0, borderLeft: '1px solid #e5e0d8',
                            background: '#f7f4ee', overflowY: 'auto',
                            display: 'flex', flexDirection: 'column',
                        }}>
                            {/* Preview topbar */}
                            <div style={{
                                padding: '14px 16px', background: '#fff', borderBottom: '1px solid #ede9e1',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                            }}>
                                <span style={{ fontWeight: 700, fontSize: 13, color: '#333' }}>👁 Aperçu live</span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {[{ id: 'mobile', icon: Smartphone }, { id: 'tablet', icon: Tablet }].map(({ id, icon: Icon }) => (
                                        <button key={id} onClick={() => setPreviewMode(id)}
                                            style={{
                                                padding: '5px 12px', borderRadius: 20, border: '1px solid',
                                                borderColor: previewMode === id ? 'var(--gold)' : '#ddd',
                                                background: previewMode === id ? '#fff8ec' : '#fff',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                                                fontWeight: 600, fontSize: 12, color: previewMode === id ? '#b08f52' : '#888',
                                            }}>
                                            <Icon size={13} /> {id === 'mobile' ? 'Mobile' : 'Tablette'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Phone frame */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '28px 16px', display: 'flex', justifyContent: 'center' }}>
                                <PhoneFrame src={previewSrc} mode={previewMode} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

