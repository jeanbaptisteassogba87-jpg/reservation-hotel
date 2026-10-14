import { useEffect, useMemo, useState } from 'react';
import api, { errorMessage } from '../api';
import { formatDate, formatMoney, reservationStatus } from '../utils/format';
import PaymentModal from '../components/PaymentModal';

const statusOptions = ['EN_ATTENTE', 'CONFIRMEE', 'REFUSEE', 'ANNULEE', 'EN_COURS', 'TERMINEE'];

export default function StaffReservations() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState({ statut: '', from: '', to: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentReservation, setPaymentReservation] = useState(null);
  const load = async () => { try { const { data } = await api.get('/reservations'); setItems(data); } catch (err) { setError(errorMessage(err)); } finally { setLoading(false); } };
  useEffect(() => { Promise.resolve().then(load); }, []);
  const filtered = useMemo(() => items.filter((item) => (!filter.statut || item.statut === filter.statut) && (!filter.from || item.dateArrivee >= filter.from) && (!filter.to || item.dateDepart <= filter.to)), [items, filter]);
  const act = async (id, action) => { setError(''); try { await api.patch(`/reservations/${id}/${action}`); await load(); } catch (err) { setError(errorMessage(err)); } };
  return <div className="container dashboard-wrap">
    <div className="dashboard-top"><div><div className="eyebrow">Réception · Séjours</div><h1>Réservations</h1><p>Filtrez les dossiers et gérez les étapes du séjour.</p></div></div>
    {error && <div className="notice error" role="alert">{error}</div>}
    <section className="table-panel"><div className="panel-head"><h2>Liste des dossiers</h2><span className="room-meta">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span></div>
      <div className="filter-row"><label className="form-field"><span>Statut</span><select value={filter.statut} onChange={(e) => setFilter({ ...filter, statut: e.target.value })}><option value="">Tous les statuts</option>{statusOptions.map((s) => <option value={s} key={s}>{reservationStatus(s)}</option>)}</select></label><label className="form-field"><span>À partir de (arrivée)</span><input type="date" value={filter.from} onChange={(e) => setFilter({ ...filter, from: e.target.value })} /></label><label className="form-field"><span>Jusqu’au (départ)</span><input type="date" value={filter.to} onChange={(e) => setFilter({ ...filter, to: e.target.value })} /></label><button className="button-small" onClick={() => setFilter({ statut: '', from: '', to: '' })}>Effacer les filtres</button></div>
      {loading ? <div className="loading-state">Chargement des réservations…</div> : filtered.length === 0 ? <div className="empty-state"><strong>Aucun dossier pour ces critères.</strong>Modifiez les filtres pour afficher d’autres réservations.</div> : <div className="table-scroll"><table><thead><tr><th>Dossier</th><th>Client</th><th>Chambres</th><th>Arrivée</th><th>Départ</th><th>Total</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{filtered.map((r) => <tr key={r.id}><td>#{r.id}</td><td>{r.client?.nom || 'Client'}</td><td>{r.chambres?.map((c) => c.room?.numero).join(', ') || '—'}</td><td>{formatDate(r.dateArrivee)}</td><td>{formatDate(r.dateDepart)}</td><td>{formatMoney(r.prixTotal)}</td><td><span className={`status status--${r.statut}`}>{reservationStatus(r.statut)}</span></td><td><div className="table-actions">{r.statut === 'EN_ATTENTE' && <><button className="button-small" onClick={() => act(r.id, 'confirm')}>Confirmer</button><button className="button-small danger" onClick={() => act(r.id, 'refuse')}>Refuser</button></>}{r.statut === 'CONFIRMEE' && <button className="button-small" onClick={() => act(r.id, 'check-in')}>Arrivée</button>}{r.statut === 'EN_COURS' && <button className="button-small" onClick={() => act(r.id, 'check-out')}>Départ</button>}{!['ANNULEE', 'REFUSEE', 'TERMINEE'].includes(r.statut) && <button className="button-small" onClick={() => setPaymentReservation(r)}>Paiement</button>}</div></td></tr>)}</tbody></table></div>}
    </section>
    {paymentReservation && <PaymentModal reservation={paymentReservation} onClose={() => setPaymentReservation(null)} onPaid={() => load()} />}
  </div>;
}
