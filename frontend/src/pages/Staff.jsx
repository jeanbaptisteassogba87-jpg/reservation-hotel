import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';
import { Link } from 'react-router-dom';
import { formatDate, formatMoney, reservationStatus } from '../utils/format';
import PaymentModal from '../components/PaymentModal';

const todayISO = () => { const date = new Date(); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

export default function Staff() {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentReservation, setPaymentReservation] = useState(null);
  const load = () => api.get('/reservations').then((res) => setReservations(res.data)).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false));
  useEffect(() => { Promise.resolve().then(load); }, []);

  const act = async (id, action) => {
    setError('');
    try { await api.patch(`/reservations/${id}/${action}`); load(); }
    catch (err) { setError(errorMessage(err)); }
  };
  const pending = reservations.filter((r) => r.statut === 'EN_ATTENTE').length;
  const inHouse = reservations.filter((r) => r.statut === 'EN_COURS').length;
  const revenue = reservations.reduce((total, r) => total + Number(r.prixTotal || 0), 0);
  const today = todayISO();
  const arrivalsToday = reservations.filter((r) => r.statut === 'CONFIRMEE' && r.dateArrivee === today).length;
  const departuresToday = reservations.filter((r) => r.statut === 'EN_COURS' && r.dateDepart === today).length;
  const statusCounts = ['EN_ATTENTE', 'CONFIRMEE', 'EN_COURS', 'TERMINEE', 'ANNULEE', 'REFUSEE'].map((status) => ({ status, count: reservations.filter((reservation) => reservation.statut === status).length }));

  return <div className="container dashboard-wrap">
    <div className="dashboard-top"><div><div className="eyebrow">HOTEL DES PRINCESSES · Administration</div><h1>Bonjour, l’équipe.</h1><p>Le suivi des séjours et des arrivées, en un clin d’œil.</p></div></div>
    <div className="stat-grid">
      <div className="stat-card"><span>Arrivées aujourd’hui</span><strong>{arrivalsToday}</strong></div>
      <div className="stat-card"><span>Départs aujourd’hui</span><strong>{departuresToday}</strong></div>
      <div className="stat-card"><span>Réservations en attente</span><strong>{pending}</strong></div>
      <div className="stat-card"><span>En cours · Réservations</span><strong>{inHouse} <span style={{ font: '500 13px DM Sans', color: 'var(--muted)' }}>· {formatMoney(revenue)}</span></strong></div>
    </div>
    <div className="staff-status-summary">{statusCounts.map(({ status, count }) => <div key={status}><span className={`status status--${status}`}>{reservationStatus(status)}</span><strong>{count}</strong></div>)}</div>
    <div className="staff-quick-links"><Link to="/staff/reservations">Toutes les réservations →</Link><Link to="/staff/planning">Planning des chambres →</Link><Link to="/staff/new-reservation">Créer une réservation →</Link><Link to="/staff/clients">Clients →</Link></div>
    {error && <div className="notice error">{error}</div>}
    <section className="table-panel">
      <div className="panel-head"><h2>Suivi des réservations</h2><span className="room-meta">{reservations.length} dossier{reservations.length > 1 ? 's' : ''}</span></div>
      {loading ? <div className="loading-state">Chargement des réservations…</div> : reservations.length === 0 ? <div className="empty-state"><strong>Aucune réservation pour le moment.</strong>Les prochains séjours apparaîtront ici.</div> : <div className="table-scroll"><table>
        <thead><tr><th>Dossier</th><th>Client</th><th>Chambre</th><th>Dates</th><th>Total</th><th>Statut</th><th>Actions</th></tr></thead>
        <tbody>{reservations.map((r) => <tr key={r.id}>
          <td><strong>#{r.id}</strong></td><td>{r.client?.nom || 'Client'}</td><td>{r.chambres?.map((c) => c.room?.numero).join(', ') || '—'}</td><td>{formatDate(r.dateArrivee)}<br />→ {formatDate(r.dateDepart)}</td><td>{formatMoney(r.prixTotal)}</td><td><span className={`status status--${r.statut}`}>{reservationStatus(r.statut)}</span></td>
          <td><div className="table-actions">
            {r.statut === 'EN_ATTENTE' && <><button className="button-small" onClick={() => act(r.id, 'confirm')}>Confirmer</button><button className="button-small danger" onClick={() => act(r.id, 'refuse')}>Refuser</button></>}
            {r.statut === 'CONFIRMEE' && <button className="button-small" onClick={() => act(r.id, 'check-in')}>Enregistrer l’arrivée</button>}
            {r.statut === 'EN_COURS' && <button className="button-small" onClick={() => act(r.id, 'check-out')}>Enregistrer le départ</button>}
            {!['ANNULEE', 'REFUSEE', 'TERMINEE'].includes(r.statut) && <button className="button-small" onClick={() => setPaymentReservation(r)}>Paiement</button>}
          </div></td>
        </tr>)}</tbody>
      </table></div>}
    </section>
    {paymentReservation && <PaymentModal reservation={paymentReservation} onClose={() => setPaymentReservation(null)} onPaid={() => load()} />}
  </div>;
}
