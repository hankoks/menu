import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Users, UserPlus, Shield, User, X } from 'lucide-react';

export default function AdminStaff() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('WAITER');
    const [formLoading, setFormLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        // Assuming Admin is a member of exactly one restaurant for this prototype
        const { data: currUser } = await supabase.auth.getUser();
        if (!currUser?.user) return;

        // Get restaurant ID
        const { data: memberData } = await supabase.from('restaurant_members').select('restaurant_id').eq('profile_id', currUser.user.id).limit(1).single();

        if (memberData) {
            setRestaurantId(memberData.restaurant_id);
            // Fetch all members of this restaurant
            const { data } = await supabase.from('restaurant_members')
                .select(`role, profiles(id, name, is_active)`)
                .eq('restaurant_id', memberData.restaurant_id);

            if (data) setStaff(data);
        }
        setLoading(false);
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setMsg('');

        try {
            // Call our Edge Function
            const { data: session } = await supabase.auth.getSession();
            const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-staff`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.session.access_token}`
                },
                body: JSON.stringify({ email, password, name, role, restaurantId })
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error || 'Erreur lors de la création');

            alert('Membre ajouté avec succès !');
            setMsg('');
            setShowModal(false);
            fetchStaff(); // Refresh list

            // Reset form
            setEmail(''); setPassword(''); setName(''); setRole('WAITER');
        } catch (error) {
            setMsg('ERREUR: ' + error.message);
            alert('Crash Serveur: ' + error.message);
        }
        setFormLoading(false);
    };

    return (
        <div className="admin-page">
            <div className="admin-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Équipe & Personnel</h2>
                    <span style={{ color: 'var(--muted)', fontSize: 14 }}>{staff.length} membre(s)</span>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{ background: 'var(--gold)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    <UserPlus size={16} /> Ajouter un Membre
                </button>
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Chargement de l'équipe...</div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Rôle</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map((s, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={16} color="#777" />
                                            </div>
                                            {s.profiles?.name}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`admin-badge status-${s.role === 'OWNER' ? 'served' : s.role === 'MANAGER' ? 'kitchen' : 'pending'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            {s.role === 'OWNER' || s.role === 'MANAGER' ? <Shield size={12} /> : null}
                                            {s.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ color: s.profiles?.is_active ? '#4caf50' : '#f44336', fontWeight: 600, fontSize: 13 }}>
                                            {s.profiles?.is_active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td>
                                        <button style={{ background: 'transparent', border: 'none', color: '#4f9cf5', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Modifier</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Création */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 16, width: 400, position: 'relative' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <X size={20} color="#777" />
                        </button>
                        <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>Ajouter un membre</h3>
                        <form onSubmit={handleCreateStaff}>
                            <div className="admin-form-group">
                                <label>Nom Complet</label>
                                <input value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="admin-form-group">
                                <label>Email (Identifiant)</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div className="admin-form-group">
                                <label>Mot de passe provisoire</label>
                                <input type="text" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                            </div>
                            <div className="admin-form-group">
                                <label>Rôle</label>
                                <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: '10px', borderRadius: 8, border: '1px solid #ddd' }}>
                                    <option value="WAITER">WAITER (Serveur)</option>
                                    <option value="KITCHEN">KITCHEN (Cuisine)</option>
                                    <option value="MANAGER">MANAGER (Gérant)</option>
                                </select>
                            </div>
                            {msg && <div style={{ color: msg.includes('Erreur') ? 'red' : 'green', fontSize: 13, marginBottom: 16 }}>{msg}</div>}
                            <button type="submit" disabled={formLoading} style={{ background: 'var(--gold)', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, width: '100%' }}>
                                {formLoading ? 'Création...' : 'Créer le compte'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
