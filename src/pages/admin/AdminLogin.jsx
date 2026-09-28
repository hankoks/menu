import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErr('');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        setLoading(false);

        if (error) {
            setErr(error.message);
        } else if (data.session) {
            navigate('/admin/dashboard');
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <div className="admin-login-logo">
                    <div className="logo-badge" style={{ width: 56, height: 56, fontSize: 24 }}>🍴</div>
                    <h1>Le Jardin</h1>
                    <span>ADMINISTRATION</span>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="admin-form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@lejardin.com" required />
                    </div>
                    <div className="admin-form-group">
                        <label>Mot de passe</label>
                        <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••" required />
                    </div>
                    {err && <p className="admin-err">{err}</p>}
                    <button type="submit" className="admin-login-btn" disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter →'}
                    </button>
                </form>
            </div>
        </div>
    );
}
