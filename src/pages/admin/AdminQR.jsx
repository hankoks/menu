import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function AdminQR() {
    const [count, setCount] = useState(10);
    const baseUrl = window.location.origin;

    return (
        <div className="admin-page">
            <div className="admin-page-head">
                <h2>Générateur QR Codes (Tables)</h2>
            </div>

            <div className="admin-qr-controls" style={{ marginBottom: 24, background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Nombre de tables à générer : </label>
                    <input
                        type="number"
                        value={count}
                        onChange={e => setCount(e.target.value)}
                        style={{ width: 100, padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }}
                        min="1"
                    />
                </div>
                <button
                    onClick={() => {
                        window.print();
                    }}
                    style={{ padding: '11px 20px', background: 'var(--dark)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    <span style={{ fontSize: 18 }}>🖨️</span> Imprimer pour les tables
                </button>
            </div>

            <div className="qr-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
                {[...Array(Number(count) || 0)].map((_, i) => {
                    const t = i + 1;
                    const url = `${baseUrl}/?table=${t}`;
                    return (
                        <div key={t} className="qr-card" style={{ background: '#fff', padding: '24px 16px', borderRadius: 16, border: '1px solid #eaeaea', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                            <h3 style={{ marginBottom: 16, fontSize: 24, color: 'var(--dark)' }}>Table {t}</h3>
                            <div style={{ background: '#fff', padding: 10, borderRadius: 12, display: 'inline-block', border: '2px dashed #ddd', marginBottom: 12 }}>
                                <QRCodeCanvas value={url} size={150} level="H" />
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--muted)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                {url}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
