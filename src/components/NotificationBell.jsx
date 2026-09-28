import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(true);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on out-click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="notif-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: 8, position: 'relative', display: 'flex', alignItems: 'center'
                }}
            >
                <Bell size={20} color="#555" />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: 4, right: 6,
                        background: '#e53e3e', color: '#fff', fontSize: 10,
                        fontWeight: 'bold', width: 16, height: 16,
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', pointerEvents: 'none'
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: 45, right: 0,
                    width: 320, background: '#fff', borderRadius: 12,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '1px solid #eaeaea',
                    zIndex: 9999, display: 'flex', flexDirection: 'column', overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: '#fafafa'
                    }}>
                        <h4 style={{ margin: 0, fontSize: 14, color: '#333' }}>Notifications</h4>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} style={{
                                background: 'none', border: 'none', fontSize: 12, color: 'var(--gold)',
                                cursor: 'pointer', fontWeight: 600, display: 'flex', gap: 4, alignItems: 'center'
                            }}>
                                <Check size={14} /> Tout marquer lu
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: 30, textAlign: 'center', color: '#999', fontSize: 13 }}>
                                🔕 Aucune notification.
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} style={{
                                    padding: '12px 16px', borderBottom: '1px solid #f5f5f5',
                                    background: notif.is_read ? '#fff' : '#f4f6fb',
                                    cursor: 'pointer', transition: 'background 0.2s'
                                }} onClick={() => !notif.is_read && markAsRead(notif.id)}>

                                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: '#222', marginBottom: 2 }}>
                                                {notif.title}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                                                {notif.message}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#aaa', display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{new Date(notif.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                {!notif.is_read && <span style={{ color: '#4f9cf5', fontWeight: 600 }}>Nouveau</span>}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ padding: '10px', borderTop: '1px solid #eee', textAlign: 'center', background: '#fafafa' }}>
                        <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} style={{
                            color: '#666', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 500
                        }}>
                            Voir tout <ExternalLink size={14} />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
