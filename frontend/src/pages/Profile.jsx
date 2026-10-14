import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';
import { formatDate } from '../utils/format';

const roles = { ADMIN: 'Administrateur', RECEPTIONNISTE: 'Réceptionniste', CLIENT: 'Client' };

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/users/me').then(({ data }) => setProfile(data)).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)); }, []);
  return <div className="container dashboard-wrap"><div className="dashboard-top"><div><div className="eyebrow">HOTEL DES PRINCESSES · Compte</div><h1>Mon profil</h1><p>Les informations associées à votre compte.</p></div></div>{error && <div className="notice error" role="alert">{error}</div>}{loading ? <div className="loading-state">Chargement du profil…</div> : profile && <section className="table-panel profile-card"><div className="profile-avatar">{profile.nom?.slice(0, 1)?.toUpperCase() || 'P'}</div><div><h2>{profile.nom}</h2><p>{profile.email || 'Aucune adresse e-mail'}</p><p>{profile.telephone}</p><p>Rôle : {roles[profile.role] || profile.role}</p><p>Membre depuis le {formatDate(String(profile.dateCreation).slice(0, 10))}</p></div><p className="profile-readonly">Pour modifier une information, contactez la réception.</p></section>}</div>;
}
