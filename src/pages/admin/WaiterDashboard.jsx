import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Coffee, CheckCircle, Clock } from 'lucide-react';

export default function WaiterDashboard({ profileId, restaurantId }) {
    const [myTables, setMyTables] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyTables();

        // Subscribe to order changes to keep table statuses active
        const sub = supabase.channel('waiter-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` }, () => {
                fetchMyTables();
            })
            .subscribe();

        return () => supabase.removeChannel(sub);
    }, [profileId, restaurantId]);

    const fetchMyTables = async () => {
        setLoading(true);
        // GET assignments
        const { data: assignments } = await supabase
            .from('table_assignments')
            .select('table_id')
            .eq('profile_id', profileId);

        if (!assignments || assignments.length === 0) {
            setMyTables([]);
            setLoading(false);
            return;
        }

        const tIds = assignments.map(a => a.table_id);

        // GET tables with pending/kitchen active orders
        const { data: tables } = await supabase
            .from('tables')
            .select('id, number, status, orders(id, status, total, created_at)')
            .in('id', tIds)
            .order('number', { ascending: true });

        if (tables) {
            // Filter orders to only show active ones (pending, kitchen)
            const mapped = tables.map(t => {
                const activeOrders = t.orders.filter(o => o.status === 'pending' || o.status === 'kitchen');
                return { ...t, activeOrders };
            });
            setMyTables(mapped);
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: 10 }}>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>👋 Mes Tables Assignées</h3>

            {loading ? (
                <div style={{ color: '#888' }}>Chargement de vos tables...</div>
            ) : myTables.length === 0 ? (
                <div style={{ background: '#f9f9f9', padding: 30, borderRadius: 12, textAlign: 'center', color: '#666' }}>
                    Aucune table ne vous est assignée pour le moment.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {myTables.map(t => {
                        const hasOrders = t.activeOrders.length > 0;
                        const bgColor = hasOrders ? '#fff9e6' : '#f4fbfa';
                        const borderColor = hasOrders ? '#ffd166' : '#4caf50';

                        return (
                            <div key={t.id} style={{
                                background: bgColor, borderRadius: 12, padding: 16,
                                border: `2px solid ${borderColor}`, display: 'flex', flexDirection: 'column'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Table {t.number}</h2>
                                    {hasOrders ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#e53e3e', fontWeight: 700, fontSize: 13 }}>
                                            <span style={{ width: 8, height: 8, background: '#e53e3e', borderRadius: '50%' }} /> Active
                                        </span>
                                    ) : (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4caf50', fontWeight: 700, fontSize: 13 }}>
                                            <CheckCircle size={14} /> Libre
                                        </span>
                                    )}
                                </div>

                                <div style={{ marginTop: 16, flex: 1 }}>
                                    {hasOrders ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {t.activeOrders.map(o => (
                                                <div key={o.id} style={{
                                                    background: '#fff', borderRadius: 8, padding: 12,
                                                    border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: 14 }}>Commande #{o.id.substring(0, 6)}</div>
                                                        <div style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                                            <Clock size={12} /> {new Date(o.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    <span className={`admin-badge status-${o.status}`}>
                                                        {o.status === 'pending' ? 'En attente' : 'En cuisine'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ height: 60, display: 'flex', alignItems: 'center', color: '#888', fontSize: 13, gap: 6 }}>
                                            <Coffee size={16} /> En attente de clients
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
