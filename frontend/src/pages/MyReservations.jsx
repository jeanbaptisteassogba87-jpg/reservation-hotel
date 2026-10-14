import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import PaymentModal from '../components/PaymentModal';
import { formatDate, formatMoney, reservationStatus } from '../utils/format';

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentReservation, setPaymentReservation] = useState(null);
  const load = () => api.get('/reservations/me').then((res) => setReservations(res.data)).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false));
  useEffect(() => { Promise.resolve().then(load); }, []);

  const cancel = async (id) => {
    setError('');
    try { await api.patch(`/reservations/${id}/cancel`); setNotice('Votre réservation a été annulée.'); load(); }
    catch (err) { setError(errorMessage(err)); }
  };
  const pending = reservations.filter((r) => ['EN_ATTENTE', 'CONFIRMEE'].includes(r.statut)).length;
  const spent = reservations.reduce((total, r) => total + Number(r.prixTotal || 0), 0);

  return <div className="container dashboard-wrap">
    <div className="dashboard-top"><div><div className="eyebrow">Votre espace HOTEL DES PRINCESSES</div><h1>Mes séjours</h1><p>Retrouvez ici tous les détails de vos escapades.</p></div><Link className="button-primary" to="/search">Réserver un séjour →</Link></div>
    <div className="stat-grid">
      <div className="stat-card"><span>Séjours au total</span><strong>{reservations.length}</strong></div>
      <div className="stat-card"><span>À venir</span><strong>{pending}</strong></div>
      <div className="stat-card"><span>Montant réservé</span><strong style={{ fontSize: 20 }}>{formatMoney(spent)}</strong></div>
      <div className="stat-card"><span>Votre espace</span><strong style={{ fontSize: 20 }}>Bienvenue</strong></div>
    </div>
    {error && <div className="notice error">{error}</div>}{notice && <div className="notice success">{notice}</div>}
    <div className="panel-head" style={{ background: 'white', border: '1px solid var(--line)', borderBottom: 0 }}><h2>Votre carnet de séjours</h2><span className="room-meta">{reservations.length} réservation{reservations.length > 1 ? 's' : ''}</span></div>
    {loading ? <div className="loading-state">Chargement de vos séjours…</div> : reservations.length === 0 ? <div className="empty-state"><strong>Votre prochaine escapade vous attend.</strong>Vous n’avez pas encore de réservation.<br /><Link className="text-link" to="/search" style={{ display: 'inline-block', marginTop: 18 }}>Explorer nos chambres →</Link></div> : <div className="reservation-list">
      {reservations.map((r) => <article className="reservation-card" key={r.id}>
        <div><span className={`status status--${r.statut}`}>{reservationStatus(r.statut)}</span><h3>Séjour n°{r.id}</h3><p>Chambre{r.chambres?.length > 1 ? 's' : ''} {r.chambres?.map((c) => c.room?.numero).join(', ') || '—'}<br />{formatDate(r.dateArrivee)} <span aria-hidden="true">→</span> {formatDate(r.dateDepart)}</p></div>
        <div className="reservation-right"><span className="room-meta">Montant du séjour</span><strong>{formatMoney(r.prixTotal)}</strong>
          <div className="reservation-actions"><button className="button-small" onClick={() => setPaymentReservation(r)}>Paiements</button>{['EN_ATTENTE', 'CONFIRMEE'].includes(r.statut) && <><button className="primary-button" onClick={() => setPaymentReservation(r)}>Régler</button><button className="danger-button" onClick={() => cancel(r.id)}>Annuler</button></>}</div>
        </div>
      </article>)}
    </div>}
    {paymentReservation && <PaymentModal reservation={paymentReservation} onClose={() => setPaymentReservation(null)} onPaid={() => { setNotice('Votre paiement a été enregistré.'); load(); }} />}
  </div>;
}
