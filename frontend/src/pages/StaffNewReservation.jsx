import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { formatMoney } from '../utils/format';

export default function StaffNewReservation() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [createClient, setCreateClient] = useState(false);
  const [clientForm, setClientForm] = useState({ nom: '', email: '', telephone: '' });
  const [dates, setDates] = useState({ dateArrivee: '', dateDepart: '' });
  const [rooms, setRooms] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => { api.get('/users').then(({ data }) => setClients(data.filter((item) => item.role === 'CLIENT'))).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)); }, []);
  const nights = dates.dateArrivee && dates.dateDepart ? Math.max(0, (Date.parse(`${dates.dateDepart}T00:00:00Z`) - Date.parse(`${dates.dateArrivee}T00:00:00Z`)) / 86400000) : 0;
  const selectedRooms = rooms?.filter((room) => selected.includes(room.id)) || [];
  const estimate = selectedRooms.reduce((sum, room) => sum + Number(room.category?.pricePerNight || 0) * nights, 0);
  const findRooms = async (e) => { e.preventDefault(); setSearching(true); setError(''); setRooms(null); setSelected([]); try { const { data } = await api.get('/reservations/availability', { params: dates }); setRooms(data); } catch (err) { setError(errorMessage(err)); } finally { setSearching(false); } };
  const submit = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      let selectedClientId = Number(clientId);
      if (createClient) {
        const { data } = await api.post('/users', { ...clientForm, email: clientForm.email || undefined });
        selectedClientId = data.id; setClients((current) => [...current, data]); setClientId(String(data.id)); setCreateClient(false);
      }
      if (!selectedClientId) throw new Error('Sélectionnez un client ou créez sa fiche.');
      const { data } = await api.post('/reservations', { ...dates, roomIds: selected, clientId: selectedClientId });
      setSuccess(`Réservation n°${data.id} créée pour ${formatMoney(data.prixTotal)}.`); setSelected([]); setRooms([]);
    } catch (err) { setError(err.response ? errorMessage(err) : err.message); }
    finally { setSaving(false); }
  };
  return <div className="container dashboard-wrap">
    <div className="dashboard-top"><div><div className="eyebrow">Réception · Nouveau dossier</div><h1>Créer une réservation</h1><p>Associez un client, des dates et une ou plusieurs chambres.</p></div></div>
    {error && <div className="notice error" role="alert">{error}</div>}{success && <div className="notice success" role="status">{success} <button className="button-small" onClick={() => navigate('/staff/reservations')}>Voir les réservations</button></div>}
    <section className="table-panel"><div className="panel-head"><h2>1. Le client</h2></div><div className="admin-room-fields"><div className="form-field"><label htmlFor="reservation-client">Client existant</label><select id="reservation-client" value={clientId} disabled={createClient || loading} onChange={(e) => setClientId(e.target.value)}><option value="">Choisir un client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.nom} · {client.telephone}</option>)}</select></div><div className="admin-room-availability"><input id="new-client-toggle" type="checkbox" checked={createClient} onChange={(e) => { setCreateClient(e.target.checked); setClientId(''); }} /><label htmlFor="new-client-toggle">Créer une nouvelle fiche client</label></div>{createClient && <div className="admin-room-wide new-client-fields"><div className="form-field"><label htmlFor="new-client-name">Nom complet</label><input id="new-client-name" value={clientForm.nom} onChange={(e) => setClientForm({ ...clientForm, nom: e.target.value })} required /></div><div className="form-field"><label htmlFor="new-client-phone">Téléphone</label><input id="new-client-phone" value={clientForm.telephone} onChange={(e) => setClientForm({ ...clientForm, telephone: e.target.value })} required /></div><div className="form-field"><label htmlFor="new-client-email">E-mail (facultatif)</label><input id="new-client-email" type="email" value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} /></div></div>}</div></section>
    <section className="table-panel" style={{ marginTop: 20 }}><div className="panel-head"><h2>2. Dates du séjour</h2></div><form className="search-panel" onSubmit={findRooms}><label className="booking-field"><span className="field-label">Arrivée</span><input type="date" value={dates.dateArrivee} onChange={(e) => setDates({ ...dates, dateArrivee: e.target.value })} required /></label><label className="booking-field"><span className="field-label">Départ</span><input type="date" value={dates.dateDepart} onChange={(e) => setDates({ ...dates, dateDepart: e.target.value })} required /></label><button className="button-primary" disabled={searching}>{searching ? 'Recherche…' : 'Chercher les chambres libres'}</button></form></section>
    {rooms && <section style={{ marginTop: 24 }}><div className="section-heading"><h2 className="search-title">3. Chambres disponibles</h2><span className="room-meta">{nights} nuit{nights === 1 ? '' : 's'}</span></div>{rooms.length === 0 ? <div className="empty-state"><strong>Aucune chambre libre sur ces dates.</strong>Essayez d’autres dates.</div> : <div className="room-grid">{rooms.map((room) => <article className="room-card" key={room.id}><div className="room-content"><div className="room-meta"><span>{room.category?.name}</span><span>{room.category?.capacity} voyageurs</span></div><h3>Chambre {room.numero}</h3><p className="room-description">{room.description || 'Chambre confortable et prête à accueillir vos clients.'}</p><div className="room-bottom"><span className="room-price"><strong>{formatMoney(room.category?.pricePerNight)}</strong> / nuit</span><button className={`button-small ${selected.includes(room.id) ? 'selected-room' : ''}`} onClick={() => setSelected((current) => current.includes(room.id) ? current.filter((id) => id !== room.id) : [...current, room.id])}>{selected.includes(room.id) ? 'Retirer ✓' : 'Ajouter +'}</button></div></div></article>)}</div>}</section>}
    {selected.length > 0 && <div className="selection-summary"><div><strong>Récapitulatif</strong><span>{selected.length} chambre{selected.length > 1 ? 's' : ''} · {nights} nuit{nights === 1 ? '' : 's'} · Estimation {formatMoney(estimate)}</span></div><button className="button-primary" disabled={saving || (!createClient && !clientId) || (createClient && (!clientForm.nom || !clientForm.telephone))} onClick={submit}>{saving ? 'Création…' : 'Confirmer la réservation →'}</button></div>}
  </div>;
}
