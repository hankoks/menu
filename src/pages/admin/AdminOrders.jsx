import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';

const STATUS_FLOW = { pending: 'kitchen', kitchen: 'served', served: 'served' };
const STATUS_LABEL = { pending: 'En attente', kitchen: 'En cuisine', served: 'Servi ✓' };
const STATUS_NEXT = { pending: '→ En cuisine', kitchen: '→ Servi', served: 'Terminé' };

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: member } = await supabase.from('restaurant_members').select('restaurant_id').eq('profile_id', user.id).single();
            if (!member) return;

            const { data: rawOrders } = await supabase.from('orders')
                .select(`
                    id, subtotal, service_fee, total, status, note, created_at,
                    tables(number),
                    order_items(name_snapshot, variant_snapshot, quantity, unit_price)
                `)
                .eq('restaurant_id', member.restaurant_id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (rawOrders) {
                // Map DB shape to UI shape
                const mapped = rawOrders.map(o => ({
                    id: o.id,
                    table: o.tables?.number || '?',
                    time: new Date(o.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    status: o.status,
                    note: o.note,
                    subtotal: o.subtotal,
                    serviceFee: o.service_fee,
                    total: o.total,
                    items: o.order_items.map(i => ({
                        name: i.name_snapshot,
                        variantName: i.variant_snapshot,
                        quantity: i.quantity,
                        price: i.unit_price,
                        icon: '🍽️',
                        colors: ['#eee', '#ccc']
                    }))
                }));
                setOrders(mapped);
            }
            setLoading(false);
        };

        fetchOrders();

        const channel = supabase.channel('admin-orders-live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchOrders();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const updateOrderStatus = async (id, nextStatus) => {
        // Optimistic UI
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o));
        await supabase.from('orders').update({ status: nextStatus }).eq('id', id);
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement...</div>;

    return (
        <div className="admin-page">
            <div className="admin-page-head">
                <h2>Commandes</h2>
                <span style={{ color: 'var(--muted)', fontSize: 14 }}>{orders.length} commande{orders.length !== 1 ? 's' : ''}</span>
            </div>

            {orders.length === 0 ? (
                <div className="admin-empty">
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                    Aucune commande reçue pour l'instant.<br />
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Les commandes apparaissent ici dès qu'un client valide son panier.</span>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {orders.map((o, i) => (
                        <div className="order-card" key={o.id}>
                            <div className="order-card-head">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div className="order-num">#{orders.length - i}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 16 }}>Table {o.table}</div>
                                        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{o.time}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span className={`admin-badge status-${o.status}`}>{STATUS_LABEL[o.status] || o.status}</span>
                                    {o.status !== 'served' && (
                                        <button className="order-next-btn" onClick={() => updateOrderStatus(o.id, STATUS_FLOW[o.status])}>
                                            {STATUS_NEXT[o.status]}
                                        </button>
                                    )}
                                </div>
                            </div>
                            {o.note && (
                                <div style={{ background: '#fff9e6', border: '1px solid #ffd166', padding: 12, borderRadius: 8, margin: '14px 18px 0', fontSize: 13, color: '#b7791f', display: 'flex', gap: 8 }}>
                                    <span style={{ fontSize: 16 }}>⚠️</span>
                                    <div>
                                        <strong style={{ display: 'block', marginBottom: 2 }}>Note spéciale:</strong>
                                        <i>{o.note}</i>
                                    </div>
                                </div>
                            )}
                            <div className="order-items">
                                {o.items.map((item, j) => (
                                    <div className="order-item-row" key={j}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${item.colors[0]},${item.colors[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{item.icon}</div>
                                            <span>
                                                {item.name}
                                                {item.variantName && <span style={{ marginLeft: 6, fontSize: '12px', color: 'var(--muted)', background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>{item.variantName}</span>}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <span style={{ color: 'var(--muted)', fontSize: 13 }}>×{item.quantity}</span>
                                            <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{item.price * item.quantity} DH</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="order-card-foot" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                {o.serviceFee ? (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
                                            <span>Sous-total</span>
                                            <span>{o.subtotal?.toLocaleString('fr-FR')} DH</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                                            <span>Service (10%)</span>
                                            <span>{o.serviceFee?.toLocaleString('fr-FR')} DH</span>
                                        </div>
                                    </>
                                ) : null}
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: o.serviceFee ? '1px solid #f0ece4' : 'none', paddingTop: o.serviceFee ? 10 : 0 }}>
                                    <span>Total Payé</span>
                                    <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--gold)' }}>{o.total?.toLocaleString('fr-FR')} DH</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
