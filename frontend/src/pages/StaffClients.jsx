import { useEffect, useMemo, useState } from 'react';
import api, { errorMessage } from '../api';

export default function StaffClients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ nom: '', email: '', telephone: '' });
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = async () => { try { const { data } = await api.get('/users'); setClients(data.filter((user) => user.role === 'CLIENT')); } catch (err) { setError(errorMessage(err)); } finally { setLoading(false); } };
  useEffect(() => { Promise.resolve().then(load); }, []);
  const filtered = useMemo(() => clients.filter((client) => `${client.nom} ${client.telephone} ${client.email || ''}`.toLowerCase().includes(query.toLowerCase())), [clients, query]);
  const submit = async (e) => { e.preventDefault(); setSaving(true); setError(''); setSuccess(''); try { await api.post('/users', { ...form, email: form.email || undefined }); setSuccess(`La fiche client de ${form.nom} a été créée.`); setForm({ nom: '', email: '', telephone: '' }); await load(); } catch (err) { setError(errorMessage(err)); } finally { setSaving(false); } };
  return <div className="container dashboard-wrap">
    <div className="dashboard-top"><div><div className="eyebrow">Réception · Carnet d’adresses</div><h1>Clients</h1><p>Retrouvez les clients et créez une fiche pour les réservations au guichet.</p></div></div>
    {error && <div className="notice error" role="alert">{error}</div>}{success && <div className="notice success" role="status">{success}</div>}
    <div className="staff-client-layout"><section className="table-panel"><div className="panel-head"><h2>Nouveau client</h2></div><form className="admin-room-fields" onSubmit={submit}><div className="form-field"><label htmlFor="client-name">Nom complet</label><input id="client-name" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></div><div className="form-field"><label htmlFor="client-phone">Téléphone</label><input id="client-phone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} required /></div><div className="form-field admin-room-wide"><label htmlFor="client-email">Adresse e-mail (facultative)</label><input id="client-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div><button className="button-primary" disabled={saving}>{saving ? 'Création…' : 'Créer la fiche client →'}</button></form></section>
      <section className="table-panel"><div className="panel-head"><h2>Répertoire</h2><span className="room-meta">{filtered.length} client{filtered.length > 1 ? 's' : ''}</span></div><div style={{ padding: 18 }}><div className="form-field"><label htmlFor="client-search">Rechercher par nom ou téléphone</label><input id="client-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom, téléphone, e-mail" /></div></div>{loading ? <div className="loading-state">Chargement des clients…</div> : filtered.length === 0 ? <div className="empty-state"><strong>Aucun client trouvé.</strong>Ajoutez une fiche ou changez la recherche.</div> : <div className="table-scroll"><table><thead><tr><th>Nom</th><th>Téléphone</th><th>E-mail</th><th>Compte</th></tr></thead><tbody>{filtered.map((client) => <tr key={client.id}><td><strong>{client.nom}</strong></td><td>{client.telephone}</td><td>{client.email || '—'}</td><td>{client.aUnCompte ? 'En ligne' : 'Guichet'}</td></tr>)}</tbody></table></div>}</section></div>
  </div>;
}
