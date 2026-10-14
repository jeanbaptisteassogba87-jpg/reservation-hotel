import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';
import { useAuth } from '../auth-context';

const roleName = { ADMIN: 'Administrateur', RECEPTIONNISTE: 'Réceptionniste', CLIENT: 'Client' };

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: '', email: '', telephone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = async () => { try { const { data } = await api.get('/users'); setUsers(data); } catch (err) { setError(errorMessage(err)); } finally { setLoading(false); } };
  useEffect(() => { Promise.resolve().then(load); }, []);
  const edit = (item) => { setEditing(item.id); setForm({ nom: item.nom || '', email: item.email || '', telephone: item.telephone || '' }); };
  const reset = () => { setEditing(null); setForm({ nom: '', email: '', telephone: '' }); };
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try { await api.patch(`/users/${editing}`, form); setSuccess('Les informations du compte ont été modifiées.'); reset(); await load(); }
    catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  };
  const remove = async (item) => {
    if (!window.confirm(`Supprimer le compte de ${item.nom} ?`)) return;
    setError(''); setSuccess('');
    try { await api.delete(`/users/${item.id}`); setSuccess('Utilisateur supprimé.'); if (editing === item.id) reset(); await load(); }
    catch (err) { setError(errorMessage(err)); }
  };
  const filtered = users.filter((item) => `${item.nom} ${item.email || ''} ${item.telephone || ''}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="container dashboard-wrap">
    <div className="dashboard-top"><div><div className="eyebrow">Administration · Comptes</div><h1>Utilisateurs</h1><p>Consultez les comptes et mettez à jour leurs coordonnées.</p></div></div>
    {error && <div className="notice error" role="alert">{error}</div>}{success && <div className="notice success" role="status">{success}</div>}
    {editing && <section className="table-panel" style={{ marginBottom: 20 }}><div className="panel-head"><h2>Modifier les coordonnées</h2><button className="button-small" onClick={reset}>Annuler</button></div><form className="admin-room-fields" onSubmit={submit}>
      <div className="form-field"><label htmlFor="user-name">Nom</label><input id="user-name" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></div>
      <div className="form-field"><label htmlFor="user-email">E-mail</label><input id="user-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
      <div className="form-field"><label htmlFor="user-phone">Téléphone</label><input id="user-phone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} required /></div>
      <div className="form-field"><label>Rôle</label><input value={roleName[users.find((item) => item.id === editing)?.role] || '—'} readOnly /></div>
      <button className="button-primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer les modifications'}</button>
    </form></section>}
    <section className="table-panel"><div className="panel-head"><h2>Comptes enregistrés</h2><span className="room-meta">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span></div>
      <div style={{ padding: '16px 20px' }}><div className="form-field"><label htmlFor="users-query">Rechercher par nom, e-mail ou téléphone</label><input id="users-query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Saisir un nom ou un numéro" /></div></div>
      {loading ? <div className="loading-state">Chargement des utilisateurs…</div> : filtered.length === 0 ? <div className="empty-state"><strong>Aucun utilisateur trouvé.</strong>Modifiez votre recherche.</div> : <div className="table-scroll"><table><thead><tr><th>Nom</th><th>E-mail</th><th>Téléphone</th><th>Rôle</th><th>Compte en ligne</th><th>Actions</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><strong>{item.nom}</strong>{item.id === user?.userId && <span className="room-meta"> (vous)</span>}</td><td>{item.email || '—'}</td><td>{item.telephone}</td><td>{roleName[item.role] || item.role}</td><td>{item.aUnCompte ? 'Oui' : 'Non'}</td><td><div className="table-actions"><button className="button-small" onClick={() => edit(item)}>Modifier</button><button className="button-small danger" disabled={item.id === user?.userId} onClick={() => remove(item)}>Supprimer</button></div></td></tr>)}</tbody></table></div>}
      <p className="admin-room-hint" style={{ padding: '0 20px 18px' }}>Les rôles sont affichés en lecture seule : l’API ne propose pas leur modification.</p>
    </section>
  </div>;
}
