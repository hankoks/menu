import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, Clock, Flame, Home } from 'lucide-react';

const STEPS = [
    {
        key: 'pending',
        icon: Clock,
        emoji: '🕐',
        label: 'Commande reçue',
        desc: 'Votre commande a bien été envoyée.',
        color: '#f59e0b',
    },
    {
        key: 'kitchen',
        icon: Flame,
        emoji: '👨‍🍳',
        label: 'En préparation',
        desc: 'Votre plat est en cours de préparation.',
        color: '#f97316',
    },
    {
        key: 'served',
        icon: CheckCircle,
        emoji: '✅',
        label: 'Commande servie !',
        desc: 'Votre commande est prête. Bon appétit !',
        color: '#16a34a',
    },
];

const STATUS_INDEX = { pending: 0, kitchen: 1, served: 2 };

export default function OrderStatus() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Read order from localStorage directly on every tick so it works across tabs
    const getOrderFromStorage = () => {
        try {
            const orders = JSON.parse(localStorage.getItem('lj_orders')) || [];
            return orders.find(o => String(o.id) === String(id)) || null;
        } catch { return null; }
    };

    const [order, setOrder] = useState(getOrderFromStorage);

    // Poll localStorage every 3 seconds — works even when admin is in a different tab
    useEffect(() => {
        const interval = setInterval(() => {
            setOrder(getOrderFromStorage());
        }, 3000);
        return () => clearInterval(interval);
    }, [id]);

    if (!order) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>❓</div>
                <h3 style={{ marginBottom: 8 }}>Commande introuvable</h3>
                <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Elle a peut-être été effacée.</p>
                <Link to="/" className="os-home-btn"><Home size={16} /> Retour au menu</Link>
            </div>
        );
    }

    const stepIdx = STATUS_INDEX[order.status] ?? 0;
    const currentStep = STEPS[stepIdx];

    return (
        <div className="os-page">
            {/* TOP STATUS HERO */}
            <div className="os-hero" style={{ background: `linear-gradient(145deg, ${currentStep.color}22, ${currentStep.color}44)` }}>
                <div className="os-hero-emoji">{currentStep.emoji}</div>
                <h2 className="os-status-title" style={{ color: currentStep.color }}>{currentStep.label}</h2>
                <p className="os-status-desc">{currentStep.desc}</p>
            </div>

            {/* STEP TRACKER */}
            <div className="os-stepper">
                {STEPS.map((step, i) => {
                    const done = i < stepIdx;
                    const active = i === stepIdx;
                    return (
                        <React.Fragment key={step.key}>
                            <div className={`os-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                                <div className="os-step-dot" style={active || done ? { background: step.color, borderColor: step.color } : {}}>
                                    {done ? '✓' : step.emoji}
                                </div>
                                <span className="os-step-label">{step.label}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`os-step-line ${done ? 'done' : ''}`} style={done ? { background: STEPS[i].color } : {}} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* ORDER SUMMARY */}
            <div className="os-card">
                <div className="os-card-head">
                    <div>
                        <div className="os-order-label">Commande</div>
                        <div className="os-order-table">Table {order.table} · {order.time}</div>
                    </div>
                    <span className="os-order-total">{order.total} DH</span>
                </div>
                {order.note && (
                    <div style={{ padding: '12px 20px', background: '#fff9c4', borderBottom: '1px solid #f0ece4', fontSize: 13, color: '#8d6e00', display: 'flex', gap: 8 }}>
                        <span>📝</span>
                        <i>"{order.note}"</i>
                    </div>
                )}
                <div className="os-items">
                    {order.items.map((item, i) => (
                        <div className="os-item-row" key={i}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: item.images?.length > 0 ? '#f5f2ec' : `linear-gradient(135deg,${item.colors[0]},${item.colors[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, overflow: 'hidden' }}>
                                    {item.images?.length > 0 ? (
                                        <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        item.icon || '🍽️'
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                                        {item.name}
                                        {item.variantName && <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--muted)', background: '#eee', padding: '1px 6px', borderRadius: 4 }}>{item.variantName}</span>}
                                    </div>
                                    {item.selectedExtras?.length > 0 && (
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                                            {item.selectedExtras.map((ex, j) => (
                                                <span key={j} style={{ fontSize: 11, background: '#f3efe7', color: '#999', borderRadius: 20, padding: '1px 7px' }}>+ {ex.name}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                <span style={{ color: 'var(--muted)', fontSize: 13 }}>×{item.quantity}</span>
                                <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{item.price * item.quantity} DH</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* POLLING NOTICE */}
            {order.status !== 'served' && (
                <p className="os-poll-notice">🔄 Mise à jour automatique toutes les 4 secondes…</p>
            )}

            <Link to="/" className="os-home-btn"><Home size={16} /> Retour au menu</Link>
        </div>
    );
}
