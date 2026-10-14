import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth-context';
import { errorMessage } from '../api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', motDePasse: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { const user = await login(form.email, form.motDePasse); navigate(user.role === 'CLIENT' ? '/my-reservations' : user.role === 'ADMIN' ? '/admin/stats' : '/staff'); }
    catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  };

  return <div className="auth-wrap">
    <aside className="auth-visual"><div><div className="eyebrow">HOTEL DES PRINCESSES</div><h2>Le plaisir de retrouver votre place.</h2><p>Votre prochaine parenthèse commence ici.</p></div></aside>
    <section className="auth-form-side"><div className="auth-form">
      <div className="eyebrow">Ravi de vous revoir</div><h1>Connexion</h1><p>Connectez-vous pour retrouver vos séjours.</p>
      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="form-field"><label htmlFor="email">Adresse e-mail</label><input id="email" name="email" type="email" placeholder="vous@exemple.com" value={form.email} onChange={handleChange} autoComplete="email" required /></div>
        <div className="form-field"><label htmlFor="password">Mot de passe</label><input id="password" name="motDePasse" type="password" placeholder="Votre mot de passe" value={form.motDePasse} onChange={handleChange} autoComplete="current-password" required /></div>
        {error && <div className="notice error">{error}</div>}
        <button className="button-primary" type="submit" disabled={loading}>{loading ? 'Connexion…' : 'Se connecter →'}</button>
      </form>
      <p className="auth-switch">Pas encore de compte ? <Link to="/register">Créer mon compte</Link></p>
    </div></section>
  </div>;
}
