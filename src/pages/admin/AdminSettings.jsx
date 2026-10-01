import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const FONT_OPTIONS = [
    { label: 'Classique (Segoe UI + Georgia)', body: "'Segoe UI', Georgia, serif", heading: 'Georgia, serif' },
    { label: 'Moderne (Inter)', body: "'Inter', sans-serif", heading: "'Inter', sans-serif" },
    { label: 'Élégant (Playfair Display)', body: "Georgia, 'Times New Roman', serif", heading: "'Playfair Display', Georgia, serif" },
    { label: 'Arabe (Amiri)', body: "'Amiri', 'Segoe UI', serif", heading: "'Amiri', Georgia, serif" },
];

const PRESET_THEMES = [
    { label: '🌿 Jardin (défaut)', accentColor: '#c9a86a', accentDark: '#b08f52', darkBg: '#1a1f24', darkBg2: '#11151a', bodyBg: '#f3efe7', asiaAccent: '#c9a86a', asiaDark: '#1a1f24', asiaBg: '#f6f1e7', asiaText: '#2e3a52', bcTerra: '#c9a86a', bcInk: '#1a1f24', bcCream: '#faf4ec', bcPaper: '#f3ead9' },
    { label: '🔴 Rouge Signature', accentColor: '#c0392b', accentDark: '#96281b', darkBg: '#1c1010', darkBg2: '#120a0a', bodyBg: '#fdf5f5', asiaAccent: '#c0392b', asiaDark: '#1c1010', asiaBg: '#fdf5f5', asiaText: '#1c1010', bcTerra: '#c0392b', bcInk: '#1c1010', bcCream: '#fdf5f5', bcPaper: '#f7ebeb' },
    { label: '🔵 Bleu Méditerranée', accentColor: '#2980b9', accentDark: '#1a6fa6', darkBg: '#0d1b2a', darkBg2: '#0a1520', bodyBg: '#f0f4f8', asiaAccent: '#2980b9', asiaDark: '#0d1b2a', asiaBg: '#f0f4f8', asiaText: '#0a1520', bcTerra: '#2980b9', bcInk: '#0d1b2a', bcCream: '#f0f4f8', bcPaper: '#e2e8f0' },
    { label: '🟣 Violet Royal', accentColor: '#8e44ad', accentDark: '#6c3483', darkBg: '#1b0d2a', darkBg2: '#120820', bodyBg: '#f5f0fb', asiaAccent: '#8e44ad', asiaDark: '#1b0d2a', asiaBg: '#f5f0fb', asiaText: '#120820', bcTerra: '#8e44ad', bcInk: '#1b0d2a', bcCream: '#f5f0fb', bcPaper: '#f1e6f9' },
    { label: '⚫ Noir Luxe', accentColor: '#e5c46b', accentDark: '#c9a84a', darkBg: '#000000', darkBg2: '#0a0a0a', bodyBg: '#f0ede8', asiaAccent: '#e5c46b', asiaDark: '#000000', asiaBg: '#f0ede8', asiaText: '#0a0a0a', bcTerra: '#e5c46b', bcInk: '#080808', bcCream: '#f0ede8', bcPaper: '#e2ded9' },
    { label: '🟢 Vert Nature', accentColor: '#27ae60', accentDark: '#1e8449', darkBg: '#0d1f14', darkBg2: '#091409', bodyBg: '#f0f8f2', asiaAccent: '#27ae60', asiaDark: '#0d1f14', asiaBg: '#f0f8f2', asiaText: '#091409', bcTerra: '#27ae60', bcInk: '#0d1f14', bcCream: '#f0f8f2', bcPaper: '#e2f2e7' },
];

function Field({ label, hint, children }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#444', marginBottom: 4 }}>{label}</label>
            {hint && <p style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>{hint}</p>}
            {children}
        </div>
    );
}

const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit', background: '#fafafa'
};

import { supabase } from '../../config/supabaseClient';

export default function AdminSettings() {
    const { branding, setBranding } = useAppContext();
    const [local, setLocal] = useState({ ...branding });
    const [saved, setSaved] = useState(false);

    // Notification Prefs
    const [notifSound, setNotifSound] = useState(true);
    const [notifOrder, setNotifOrder] = useState(true);

    useEffect(() => {
        const fetchPrefs = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('notif_prefs').eq('id', user.id).single();
                if (data?.notif_prefs) {
                    setNotifSound(data.notif_prefs.SOUND !== false);
                    setNotifOrder(data.notif_prefs.ORDER_CREATED !== false);
                }
            }
        };
        fetchPrefs();
    }, []);

    const update = (key, val) => setLocal(prev => ({ ...prev, [key]: val }));

    const saveBrandingToSupabase = async (brandingData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: member } = await supabase
                .from('restaurant_members').select('restaurant_id').eq('profile_id', user.id).single();
            if (!member) return;
            await supabase.from('restaurants')
                .update({ branding: brandingData })
                .eq('id', member.restaurant_id);
        } catch (err) {
            console.error('Erreur lors de la sauvegarde du thème:', err);
        }
    };

    const handleSave = () => {
        setBranding(local);            // update localStorage + React state immediately
        saveBrandingToSupabase(local); // persist to Supabase for all QR devices
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const applyPreset = (preset) => {
        const next = { ...local, ...preset };
        setLocal(next);
    };

    const handleHeroUpload = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => update('heroImage', reader.result);
        reader.readAsDataURL(file);
    };

    const handleLogoUpload = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => update('logoImage', reader.result);
        reader.readAsDataURL(file);
    };

    return (
        <div className="admin-page">
            <div className="admin-page-head">
                <h2>🎨 Personnalisation du Restaurant</h2>
            </div>

            {/* TEMPLATE CHOICE */}
            <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #eee', padding: 22, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Structure du Menu (Template)</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <button onClick={() => update('template', 'default')}
                        style={{ padding: '12px 20px', borderRadius: 10, border: local.template === 'default' ? '2px solid var(--gold)' : '1px solid #ddd', cursor: 'pointer', background: local.template === 'default' ? '#fdf8f0' : '#fff', fontWeight: 600, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        🏡 Classique (Le Jardin)
                        <span style={{ fontSize: 11, color: '#666', fontWeight: 400 }}>Menu traditionnel, catégories en haut</span>
                    </button>
                    <button onClick={() => update('template', 'asia')}
                        style={{ padding: '12px 20px', borderRadius: 10, border: local.template === 'asia' ? '2px solid var(--gold)' : '1px solid #ddd', cursor: 'pointer', background: local.template === 'asia' ? '#fdf8f0' : '#fff', fontWeight: 600, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        📱 Moderne App (Asia)
                        <span style={{ fontSize: 11, color: '#666', fontWeight: 400 }}>Expérience style application mobile</span>
                    </button>
                    <button onClick={() => update('template', 'borcelle')}
                        style={{ padding: '12px 20px', borderRadius: 10, border: local.template === 'borcelle' ? '2px solid var(--gold)' : '1px solid #ddd', cursor: 'pointer', background: local.template === 'borcelle' ? '#fdf8f0' : '#fff', fontWeight: 600, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        📋 Éditorial (Borcelle)
                        <span style={{ fontSize: 11, color: '#666', fontWeight: 400 }}>Menu élégant style magazine, crème & serif</span>
                    </button>
                </div>
            </section>

            {/* PRESET THEMES */}
            <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #eee', padding: 22, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Thèmes prédéfinis</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {PRESET_THEMES.map(p => (
                        <button key={p.label} onClick={() => applyPreset(p)}
                            style={{ padding: '9px 16px', borderRadius: 30, border: '1px solid #ddd', cursor: 'pointer', background: p.accentColor, color: '#fff', fontWeight: 600, fontSize: 13 }}>
                            {p.label}
                        </button>
                    ))}
                </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                {/* IDENTITY */}
                <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #eee', padding: 22 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>🏷️ Identité</h3>
                    <Field label="Nom du restaurant">
                        <input style={inputStyle} value={local.name} onChange={e => update('name', e.target.value)} />
                    </Field>
                    <Field label="Sous-titre (ex: RESTAURANT, CAFÉ, BRASSERIE)">
                        <input style={inputStyle} value={local.subtitle} onChange={e => update('subtitle', e.target.value)} />
                    </Field>
                    <Field label="Logo (Image)" hint="Uploadez le logo de l'établissement (PNG transparent recommandé)">
                        <div style={{ position: 'relative', border: '2px dashed #ddd', borderRadius: 10, height: 80, width: 80, background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            {local.logoImage
                                ? <img src={local.logoImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                : <div style={{ fontSize: 24, color: '#ccc' }}>+</div>
                            }
                            <input type="file" accept="image/*" onChange={e => handleLogoUpload(e.target.files[0])}
                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                        </div>
                        {local.logoImage && (
                            <button onClick={() => update('logoImage', '')}
                                style={{ marginTop: 8, fontSize: 12, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer' }}>
                                ✕ Retirer l'image
                            </button>
                        )}
                    </Field>
                    {!local.logoImage && (
                        <Field label="Ou Logo (Emoji)" hint="Collez un emoji si vous n'avez pas d'image">
                            <input style={{ ...inputStyle, fontSize: 24 }} value={local.logoEmoji} onChange={e => update('logoEmoji', e.target.value)} />
                        </Field>
                    )}
                    <Field label="Slogan / Tagline (texte hero)">
                        <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={local.tagline} onChange={e => update('tagline', e.target.value)} />
                    </Field>
                </section>

                {/* COLORS - Le Jardin */}
                <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #eee', padding: 22 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>🎨 Couleurs (Thème Classique)</h3>
                    {[
                        { key: 'accentColor', label: 'Couleur principale (boutons, prix, accents)' },
                        { key: 'accentDark', label: 'Couleur principale (hover)' },
                        { key: 'darkBg', label: 'Header / Fond foncé' },
                        { key: 'darkBg2', label: 'Header secondaire (fond 2)' },
                        { key: 'bodyBg', label: 'Fond de la page' },
                    ].map(({ key, label }) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <input type="color" value={local[key]} onChange={e => update(key, e.target.value)}
                                style={{ width: 44, height: 44, borderRadius: 8, border: '1px solid #ddd', padding: 2, cursor: 'pointer' }} />
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>{label}</div>
                                <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>{local[key]}</div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* COLORS - Asia App (Only shown if asia template selected) */}
                {local.template === 'asia' && (
                    <section style={{ background: '#fff3f2', borderRadius: 14, border: '2px solid #d4574e', padding: 22 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📱 Couleurs — Thème Asia App</h3>
                        <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>Ces couleurs s'appliquent uniquement au thème "Moderne App (Asia)".</p>
                        {[
                            { key: 'asiaAccent', label: 'Couleur principale (boutons, barre panier, prix)' },
                            { key: 'asiaDark', label: 'Header / Couleur foncée (logo, catégories actives)' },
                            { key: 'asiaBg', label: 'Fond général de l\'application' },
                            { key: 'asiaText', label: 'Couleur du texte principal' },
                        ].map(({ key, label }) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                <input type="color" value={local[key] || '#000000'} onChange={e => update(key, e.target.value)}
                                    style={{ width: 44, height: 44, borderRadius: 8, border: '1px solid #ddd', padding: 2, cursor: 'pointer' }} />
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>{label}</div>
                                    <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>{local[key] || ''}</div>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* COLORS - Borcelle Editorial (Only shown if borcelle template selected) */}
                {local.template === 'borcelle' && (
                    <section style={{ background: '#fcfaf6', borderRadius: 14, border: '2px solid #c2603e', padding: 22 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📋 Couleurs — Thème Éditorial (Borcelle)</h3>
                        <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>Ces couleurs s'appliquent uniquement au thème "Éditorial (Borcelle)".</p>
                        {[
                            { key: 'bcTerra', label: 'Couleur principale (boutons d\'action, accents)' },
                            { key: 'bcInk', label: 'Couleur du texte principal & Header' },
                            { key: 'bcCream', label: 'Couleur de fond général' },
                            { key: 'bcPaper', label: 'Couleur des cartes / feuilles' },
                        ].map(({ key, label }) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                <input type="color" value={local[key] || '#000000'} onChange={e => update(key, e.target.value)}
                                    style={{ width: 44, height: 44, borderRadius: 8, border: '1px solid #ddd', padding: 2, cursor: 'pointer' }} />
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>{label}</div>
                                    <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>{local[key] || ''}</div>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* TYPOGRAPHY */}
                <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #eee', padding: 22 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>🔤 Typographie</h3>
                    <Field label="Police de l'interface">
                        <select style={inputStyle} value={local.fontBody} onChange={e => {
                            const opt = FONT_OPTIONS.find(o => o.body === e.target.value);
                            update('fontBody', e.target.value);
                            if (opt) update('fontHeading', opt.heading);
                        }}>
                            {FONT_OPTIONS.map(o => <option key={o.label} value={o.body}>{o.label}</option>)}
                        </select>
                    </Field>
                    <div style={{ padding: 16, background: '#f8f6f1', borderRadius: 10, marginTop: 8 }}>
                        <p style={{ fontFamily: local.fontHeading, fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{local.name || 'Mon Restaurant'}</p>
                        <p style={{ fontFamily: local.fontBody, fontSize: 14, color: '#666' }}>{local.tagline || 'Le meilleur de la gastronomie...'}</p>
                    </div>
                </section>

                {/* HERO IMAGE */}
                <section style={{ background: '#fff', borderRadius: 14, border: '1px solid #eee', padding: 22 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>🖼️ Image Hero (Banner)</h3>
                    <Field label="Photo de fond (section d'accueil)" hint="Recommandé : paysage large, 1200×400px minimum">
                        <div style={{ position: 'relative', border: '2px dashed #ddd', borderRadius: 10, minHeight: 120, overflow: 'hidden', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            {local.heroImage
                                ? <img src={local.heroImage} alt="" style={{ width: '100%', objectFit: 'cover', maxHeight: 200 }} />
                                : <div style={{ textAlign: 'center', color: '#ccc' }}><div style={{ fontSize: 36 }}>📷</div><p style={{ fontSize: 12 }}>Cliquez pour uploader</p></div>
                            }
                            <input type="file" accept="image/*" onChange={e => handleHeroUpload(e.target.files[0])}
                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                        </div>
                        {local.heroImage && (
                            <button onClick={() => update('heroImage', '')}
                                style={{ marginTop: 8, fontSize: 12, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer' }}>
                                ✕ Supprimer l'image
                            </button>
                        )}
                    </Field>
                </section>
            </div>

            {/* NOTIFICATIONS SECTION */}
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '40px 0 20px', paddingBottom: 10, borderBottom: '1px solid #eee' }}>🔔 Préférences de Notifications</h3>
            <div style={{ background: '#f9f9f9', padding: 24, borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: '#333' }}>Alerte Sonore</div>
                        <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Jouer un son (Ting!) lors d'une nouvelle notification</div>
                    </div>
                    <label className="switch">
                        <input type="checkbox" checked={notifSound} onChange={async (e) => {
                            const val = e.target.checked;
                            setNotifSound(val);
                            const { data: { user } } = await supabase.auth.getUser();
                            if (user) await supabase.from('profiles').update({ notif_prefs: { SOUND: val, ORDER_CREATED: notifOrder } }).eq('id', user.id);
                        }} />
                        <span className="slider round"></span>
                    </label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: '#333' }}>Nouvelles Commandes</div>
                        <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Recevoir des alertes pour les nouvelles commandes entrantes</div>
                    </div>
                    <label className="switch">
                        <input type="checkbox" checked={notifOrder} onChange={async (e) => {
                            const val = e.target.checked;
                            setNotifOrder(val);
                            const { data: { user } } = await supabase.auth.getUser();
                            if (user) await supabase.from('profiles').update({ notif_prefs: { SOUND: notifSound, ORDER_CREATED: val } }).eq('id', user.id);
                        }} />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            {/* PREVIEW + SAVE */}
            <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={() => setLocal({ ...branding })} style={{ padding: '12px 24px', borderRadius: 10, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                    Annuler
                </button>
                <button onClick={handleSave} style={{ padding: '12px 32px', borderRadius: 10, border: 'none', background: saved ? '#16a34a' : 'var(--gold)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: '.2s' }}>
                    {saved ? '✓ Enregistré !' : '💾 Appliquer les changements'}
                </button>
            </div>
        </div>
    );
}
