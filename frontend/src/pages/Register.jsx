import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth-context';
import { errorMessage } from '../api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', email: '', motDePasse: '', telephone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register(form); navigate('/search'); }
    catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  };

  return <div className="auth-wrap">
    <aside className="auth-visual"><div><div className="eyebrow">Bienvenue chez vous</div><h2>Une belle histoire commence par un séjour.</h2><p>Créez votre compte, et la maison est à vous.</p></div></aside>
    <section className="auth-form-side"><div className="auth-form">
      <div className="eyebrow">Votre espace personnel</div><h1>Nous rejoindre</h1><p>Quelques informations et votre prochaine escapade est à portée de main.</p>
      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="form-field"><label htmlFor="name">Nom complet</label><input id="name" name="nom" placeholder="Votre nom" value={form.nom} onChange={handleChange} autoComplete="name" required /></div>
        <div className="form-field"><label htmlFor="email">Adresse e-mail</label><input id="email" name="email" type="email" placeholder="vous@exemple.com" value={form.email} onChange={handleChange} autoComplete="email" required /></div>
        <div className="form-field"><label htmlFor="phone">Téléphone</label><input id="phone" name="telephone" type="tel" placeholder="Votre numéro de téléphone" value={form.telephone} onChange={handleChange} autoComplete="tel" required /></div>
        <div className="form-field"><label htmlFor="password">Mot de passe</label><input id="password" name="motDePasse" type="password" placeholder="6 caractères minimum" value={form.motDePasse} onChange={handleChange} autoComplete="new-password" minLength={6} required /></div>
        {error && <div className="notice error">{error}</div>}
        <button className="button-primary" type="submit" disabled={loading}>{loading ? 'Création…' : 'Créer mon compte →'}</button>
      </form>
      <p className="auth-switch">Vous avez déjà un compte ? <Link to="/login">Se connecter</Link></p>
    </div></section>
  </div>;
}
