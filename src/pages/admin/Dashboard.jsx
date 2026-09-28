import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../config/supabaseClient';
import WaiterDashboard from './WaiterDashboard';

export default function Dashboard() {
    const { menu, orders } = useAppContext();
    const [roleData, setRoleData] = useState(null);

    useEffect(() => {
        const getRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('restaurant_members')
                    .select('role, restaurant_id, profile_id')
                    .eq('profile_id', user.id)
                    .limit(1).single();
                if (data) setRoleData(data);
            }
        };
        getRole();
    }, []);

    if (roleData?.role === 'WAITER') {
        return <WaiterDashboard profileId={roleData.profile_id} restaurantId={roleData.restaurant_id} />;
    }

    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    // Most ordered item from all orders
    const itemCount = {};
    orders.forEach(o => o.items.forEach(i => {
        itemCount[i.name] = (itemCount[i.name] || 0) + i.quantity;
    }));
    const topDish = Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0];

    const stats = [
        { icon: '🍽️', label: 'Plats au menu', value: menu.length, color: '#c9a86a' },
        { icon: '📋', label: 'Commandes totales', value: orders.length, color: '#4f9cf5' },
        { icon: '⏳', label: 'En attente', value: pendingOrders, color: '#f5a64f' },
        { icon: '💰', label: 'Chiffre d\'affaires', value: totalRevenue + ' DH', color: '#5cbf8a' },
    ];

    return (
        <div className="admin-page">
            <div className="admin-page-head">
                <h2>Tableau de bord</h2>
                <span className="admin-page-date">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>

            <div className="admin-stats">
                {stats.map((s, i) => (
                    <div className="stat-card" key={i}>
                        <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
                        <div>
                            <div className="stat-value">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin-section-title">Activité récente</div>
            {orders.length === 0 ? (
                <div className="admin-empty">Aucune commande pour l'instant.</div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr><th>#</th><th>Table</th><th>Plats</th><th>Total</th><th>Heure</th><th>Statut</th></tr>
                        </thead>
                        <tbody>
                            {orders.slice(0, 5).map((o, i) => (
                                <tr key={o.id}>
                                    <td>#{i + 1}</td>
                                    <td>Table {o.table}</td>
                                    <td>{o.items.map(it => it.name).join(', ')}</td>
                                    <td style={{ color: 'var(--gold)', fontWeight: 700 }}>{o.total} DH</td>
                                    <td>{o.time}</td>
                                    <td><span className={`admin-badge status-${o.status}`}>{o.status === 'pending' ? 'En attente' : o.status === 'kitchen' ? 'En cuisine' : 'Servi'}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {topDish && (
                <div style={{ marginTop: 24, padding: '18px 24px', background: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
                    <div style={{ fontSize: 32 }}>🏆</div>
                    <div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Plat le plus commandé</div>
                        <div style={{ fontWeight: 700, fontSize: 18 }}>{topDish[0]} <span style={{ color: 'var(--gold)' }}>×{topDish[1]}</span></div>
                    </div>
                </div>
            )}
        </div>
    );
}
