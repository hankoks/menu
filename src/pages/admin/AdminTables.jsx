import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { LayoutGrid, Plus, Users, Trash2, Edit } from 'lucide-react';

export default function AdminTables() {
    const [tables, setTables] = useState([]);
    const [waiters, setWaiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState(null);

    // Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTableNum, setNewTableNum] = useState('');

    // Assignment state
    const [assigningTableId, setAssigningTableId] = useState(null);
    const [selectedWaiter, setSelectedWaiter] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: currUser } = await supabase.auth.getUser();
        if (!currUser?.user) return;

        const { data: memberData } = await supabase.from('restaurant_members').select('restaurant_id').eq('profile_id', currUser.user.id).limit(1).single();

        if (memberData) {
            setRestaurantId(memberData.restaurant_id);

            // Fetch tables with their assignments mapped to profiles
            const { data: tData } = await supabase
                .from('tables')
                .select(`
                    id, number, capacity, status,
                    table_assignments(id, profile_id, profiles(name))
                `)
                .eq('restaurant_id', memberData.restaurant_id)
                .order('number', { ascending: true });

            if (tData) setTables(tData);

            // Fetch waiters for dropdown
            const { data: wData } = await supabase
                .from('restaurant_members')
                .select('profile_id, profiles(name)')
                .eq('restaurant_id', memberData.restaurant_id)
                .in('role', ['WAITER', 'MANAGER']);

            if (wData) setWaiters(wData);
        }
        setLoading(false);
    };

    const handleAddTable = async (e) => {
        e.preventDefault();
        if (!restaurantId || !newTableNum) return;

        const { error } = await supabase.from('tables').insert({
            restaurant_id: restaurantId,
            number: parseInt(newTableNum, 10)
        });

        if (error) {
            alert('DB ERREUR: ' + error.message);
            return;
        }

        setShowAddModal(false);
        setNewTableNum('');
        fetchData();
    };

    const handleAssignStaff = async (e) => {
        e.preventDefault();
        if (!restaurantId || !assigningTableId || !selectedWaiter) return;

        // Ensure not already assigned
        const table = tables.find(t => t.id === assigningTableId);
        if (table.table_assignments.some(a => a.profile_id === selectedWaiter)) {
            alert('Ce membre est déjà assigné à cette table.');
            return;
        }

        await supabase.from('table_assignments').insert({
            restaurant_id: restaurantId,
            table_id: assigningTableId,
            profile_id: selectedWaiter
        });

        setAssigningTableId(null);
        setSelectedWaiter('');
        fetchData();
    };

    const removeAssignment = async (assignmentId) => {
        await supabase.from('table_assignments').delete().eq('id', assignmentId);
        fetchData();
    };

    return (
        <div className="admin-page">
            <div className="admin-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Plan de Salle & Tables</h2>
                    <span style={{ color: 'var(--muted)', fontSize: 14 }}>{tables.length} table(s) configurée(s)</span>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{ background: 'var(--gold)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    <Plus size={16} /> Ajouter une Table
                </button>
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Chargement des tables...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {tables.map(t => (
                        <div key={t.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800 }}>Table {t.number}</h3>
                                    <span className={`admin-badge status-${t.status === 'available' ? 'served' : 'pending'}`}>
                                        {t.status === 'available' ? 'Libre' : 'Occupée'}
                                    </span>
                                </div>
                                <div style={{ background: '#f5f5f5', padding: 8, borderRadius: 8, color: '#666' }}>
                                    <LayoutGrid size={20} />
                                </div>
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Assignations ({t.table_assignments?.length || 0})
                                </div>
                                {t.table_assignments?.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {t.table_assignments.map(a => (
                                            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8f9fa', padding: '6px 10px', borderRadius: 6, fontSize: 13 }}>
                                                <Users size={14} color="var(--gold)" />
                                                <span style={{ flex: 1, fontWeight: 600 }}>{a.profiles?.name}</span>
                                                <button onClick={() => removeAssignment(a.id)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: 2 }}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 13, color: '#aaa', fontStyle: 'italic' }}>Aucun serveur assigné</div>
                                )}
                            </div>

                            <button
                                onClick={() => setAssigningTableId(t.id)}
                                style={{
                                    marginTop: 16, width: '100%', padding: '8px', background: 'transparent',
                                    border: '1px dashed #ccc', borderRadius: 6, cursor: 'pointer',
                                    color: '#555', fontWeight: 600, fontSize: 13, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', gap: 6
                                }}
                            >
                                <Plus size={14} /> Assigner un serveur
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 16, width: 350 }}>
                        <h3 style={{ margin: '0 0 20px' }}>Nouvelle Table</h3>
                        <form onSubmit={handleAddTable}>
                            <div className="admin-form-group">
                                <label>Numéro de Table</label>
                                <input type="number" value={newTableNum} onChange={e => setNewTableNum(e.target.value)} required min={1} />
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: 10, background: '#f5f5f5', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                                <button type="submit" style={{ flex: 1, padding: 10, background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {assigningTableId && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 16, width: 350 }}>
                        <h3 style={{ margin: '0 0 20px' }}>Assigner à la Table {tables.find(t => t.id === assigningTableId)?.number}</h3>
                        <form onSubmit={handleAssignStaff}>
                            <div className="admin-form-group">
                                <label>Serveur</label>
                                <select value={selectedWaiter} onChange={e => setSelectedWaiter(e.target.value)} required style={{ padding: 10, width: '100%', borderRadius: 8, border: '1px solid #ddd' }}>
                                    <option value="" disabled>-- Sélectionner --</option>
                                    {waiters.map(w => (
                                        <option key={w.profile_id} value={w.profile_id}>{w.profiles?.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button type="button" onClick={() => setAssigningTableId(null)} style={{ flex: 1, padding: 10, background: '#f5f5f5', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                                <button type="submit" style={{ flex: 1, padding: 10, background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Assigner</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
