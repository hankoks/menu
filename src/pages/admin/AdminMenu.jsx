import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { categories } from '../../data';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

const emptyForm = {
    name: '', desc: '', price: '', images: ['', '', ''], category: 'Entrées',
    colors: ['#c9a86a', '#b08f52'], badge: null,
    hasVariants: false, variants: [],
    extras: []
};

function RowEditor({ items, onAdd, onUpdate, onRemove, namePlaceholder, pricePlaceholder }) {
    return (
        <div style={{ marginTop: 14 }}>
            {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <input
                        required
                        placeholder={namePlaceholder}
                        value={item.name}
                        onChange={e => onUpdate(idx, 'name', e.target.value)}
                        style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
                    />
                    <input
                        required
                        type="number"
                        placeholder={pricePlaceholder || 'Prix'}
                        value={item.price}
                        onChange={e => onUpdate(idx, 'price', e.target.value)}
                        style={{ width: 80, padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
                    />
                    <button
                        type="button"
                        onClick={() => onRemove(idx)}
                        style={{ width: 34, height: 34, borderRadius: 8, background: '#ffe5e5', color: '#dc2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={onAdd}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--gold)', border: '1px dashed var(--gold)', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}
            >
                <Plus size={14} /> Ajouter
            </button>
        </div>
    );
}

export default function AdminMenu() {
    const { menu, addMenuItem, updateMenuItem, deleteMenuItem } = useAppContext();
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [filterCat, setFilterCat] = useState('Tous');

    const openAdd = () => { setForm(emptyForm); setEditId(null); setModal(true); };
    const openEdit = (item) => {
        setForm({
            name: item.name, desc: item.desc, price: item.price || '',
            images: item.images ? [...item.images, '', '', ''].slice(0, 3) : ['', '', ''],
            category: item.category, colors: item.colors, badge: item.badge,
            hasVariants: item.hasVariants || false,
            variants: item.variants ? [...item.variants] : [],
            extras: item.extras ? [...item.extras] : []
        });
        setEditId(item.id);
        setModal(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const item = {
            ...form,
            images: form.images.filter(url => url && url.trim() !== ''),
            price: form.hasVariants ? 0 : Number(form.price),
            variants: form.hasVariants ? form.variants.map(v => ({ ...v, price: Number(v.price) })) : [],
            extras: form.extras.map(ex => ({ ...ex, price: Number(ex.price), isAvailable: true }))
        };
        editId ? updateMenuItem({ ...item, id: editId }) : addMenuItem(item);
        setModal(false);
    };

    const handleImageUpload = (idx, file) => {
        if (!file) {
            const newImgs = [...form.images];
            newImgs[idx] = '';
            setForm({ ...form, images: newImgs });
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            const newImgs = [...form.images];
            newImgs[idx] = base64String;
            setForm({ ...form, images: newImgs });
        };
        reader.readAsDataURL(file);
    };

    // Variant helpers
    const addVariant = () => setForm({ ...form, variants: [...form.variants, { name: '', price: '', isAvailable: true }] });
    const updateVariant = (i, f, v) => { const a = [...form.variants]; a[i][f] = v; setForm({ ...form, variants: a }); };
    const removeVariant = (i) => { const a = [...form.variants]; a.splice(i, 1); setForm({ ...form, variants: a }); };

    // Extra helpers
    // ... skipping to the render part ...
    const addExtra = () => setForm({ ...form, extras: [...form.extras, { name: '', price: '', isAvailable: true }] });
    const updateExtra = (i, f, v) => { const a = [...form.extras]; a[i][f] = v; setForm({ ...form, extras: a }); };
    const removeExtra = (i) => { const a = [...form.extras]; a.splice(i, 1); setForm({ ...form, extras: a }); };

    const allCats = ['Tous', ...new Set(menu.map(i => i.category))];
    const filtered = filterCat === 'Tous' ? menu : menu.filter(i => i.category === filterCat);

    return (
        <div className="admin-page">
            <div className="admin-page-head">
                <h2>Gestion du Menu</h2>
                <button className="admin-add-btn" onClick={openAdd}><Plus size={16} /> Ajouter un plat</button>
            </div>

            <div className="admin-cat-filter">
                {allCats.map(c => (
                    <button key={c} className={`admin-cat-pill ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>{c}</button>
                ))}
            </div>

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr><th>Plat</th><th>Catégorie</th><th>Prix</th><th>Options</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {filtered.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 42, height: 42, borderRadius: 10, background: item.images?.[0] ? '#eee' : `linear-gradient(135deg,${item.colors[0]},${item.colors[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, overflow: 'hidden' }}>
                                            {item.images?.[0] ? <img src={item.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (item.icon || '🍽️')}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.desc.substring(0, 40)}…</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="admin-tag">{item.category}</span></td>
                                <td style={{ fontWeight: 700, color: 'var(--gold)' }}>
                                    {item.hasVariants && item.variants?.length > 0
                                        ? `Dès ${Math.min(...item.variants.map(v => v.price))} DH`
                                        : `${item.price} DH`}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {item.hasVariants && <span className="admin-badge status-kitchen">{item.variants?.length || 0} tailles</span>}
                                        {item.extras?.length > 0 && <span className="admin-badge status-served">{item.extras.length} suppléments</span>}
                                        {!item.hasVariants && !item.extras?.length && <span style={{ color: '#ccc' }}>—</span>}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="admin-icon-btn edit" onClick={() => openEdit(item)}><Pencil size={14} /></button>
                                        <button className="admin-icon-btn delete" onClick={() => deleteMenuItem(item.id)}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {modal && (
                <div className="admin-modal-overlay" onClick={() => setModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
                        <div className="admin-modal-head">
                            <h3>{editId ? 'Modifier le plat' : 'Nouveau plat'}</h3>
                            <button className="admin-modal-close" onClick={() => setModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            {/* Basic info */}
                            <div className="admin-form-group">
                                <label>Nom du plat</label>
                                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ex: Tacos Bœuf" />
                            </div>
                            <div className="admin-form-group">
                                <label>Description</label>
                                <input required value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Courte description…" />
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Catégorie</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        {categories.map(c => <option key={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                {!form.hasVariants && (
                                    <div className="admin-form-group">
                                        <label>Prix (DH)</label>
                                        <input type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="95" />
                                    </div>
                                )}
                            </div>

                            <div className="admin-form-group">
                                <label>Images (Upload local) - Jusqu'à 3 images</label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {[0, 1, 2].map(idx => (
                                        <div key={idx} style={{ flex: 1, position: 'relative' }}>
                                            <div style={{
                                                width: '100%', height: 90, borderRadius: 8,
                                                border: '2px dashed #ddd',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: form.images[idx] ? '#fff' : '#f9f9f9',
                                                overflow: 'hidden', position: 'relative', cursor: 'pointer'
                                            }}>
                                                {form.images[idx] ? (
                                                    <img src={form.images[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <span style={{ fontSize: 24, color: '#ccc' }}>+</span>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    title={`Uploadez l'image ${idx + 1}`}
                                                    onChange={e => handleImageUpload(idx, e.target.files[0])}
                                                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                                />
                                            </div>
                                            {form.images[idx] && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleImageUpload(idx, null)}
                                                    style={{
                                                        position: 'absolute', top: -6, right: -6,
                                                        background: '#dc2626', color: '#fff', border: 'none',
                                                        borderRadius: '50%', width: 22, height: 22,
                                                        fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Les images sont enregistrées localement dans votre navigateur.</p>
                            </div>

                            {/* Colors + Badge */}
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Couleur 1</label>
                                    <input type="color" value={form.colors[0]} onChange={e => setForm({ ...form, colors: [e.target.value, form.colors[1]] })} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Couleur 2</label>
                                    <input type="color" value={form.colors[1]} onChange={e => setForm({ ...form, colors: [form.colors[0], e.target.value] })} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Badge</label>
                                    <select value={form.badge?.type || ''} onChange={e => {
                                        if (!e.target.value) setForm({ ...form, badge: null });
                                        else if (e.target.value === 'green') setForm({ ...form, badge: { type: 'green', text: 'Végétarien' } });
                                        else setForm({ ...form, badge: { type: 'red', text: 'Best Seller' } });
                                    }}>
                                        <option value="">Aucun</option>
                                        <option value="green">Végétarien</option>
                                        <option value="red">Best Seller</option>
                                    </select>
                                </div>
                            </div>

                            {/* ─── VARIANTS ─── */}
                            <div className="admin-customization-block">
                                <label className="admin-toggle-label">
                                    <input
                                        type="checkbox"
                                        checked={form.hasVariants}
                                        onChange={e => setForm({ ...form, hasVariants: e.target.checked })}
                                        style={{ accentColor: 'var(--gold)' }}
                                    />
                                    <div>
                                        <strong>Variantes / Tailles</strong>
                                        <span>Petit, Moyen, Grand, Simple, Double…</span>
                                    </div>
                                </label>
                                {form.hasVariants && (
                                    <RowEditor
                                        items={form.variants}
                                        onAdd={addVariant}
                                        onUpdate={updateVariant}
                                        onRemove={removeVariant}
                                        namePlaceholder="Nom (ex: Grand)"
                                        pricePlaceholder="Prix DH"
                                    />
                                )}
                            </div>

                            {/* ─── EXTRAS / SUPPLÉMENTS ─── */}
                            <div className="admin-customization-block">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong style={{ fontSize: 14, color: 'var(--dark)' }}>🧩 Suppléments</strong>
                                        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>Double fromage, frite, sauce… (facultatif)</p>
                                    </div>
                                </div>
                                <RowEditor
                                    items={form.extras}
                                    onAdd={addExtra}
                                    onUpdate={updateExtra}
                                    onRemove={removeExtra}
                                    namePlaceholder="ex: Double fromage"
                                    pricePlaceholder="+DH"
                                />
                            </div>

                            <button type="submit" className="admin-save-btn">{editId ? 'Enregistrer' : 'Ajouter au menu'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
