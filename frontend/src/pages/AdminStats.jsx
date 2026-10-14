import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { formatMoney, reservationStatus } from '../utils/format';

const statuses = ['EN_ATTENTE', 'CONFIRMEE', 'REFUSEE', 'ANNULEE', 'EN_COURS', 'TERMINEE'];
const todayISO = () => { const date = new Date(); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10); };

export default function AdminStats() {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([api.get('/rooms'), api.get('/reservations')])
      .then(([roomResponse, reservationResponse]) => { setRooms(roomResponse.data); setReservations(reservationResponse.data); })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);
  const today = todayISO();
  const activeReservations = reservations.filter((r) => !['ANNULEE', 'REFUSEE'].includes(r.statut));
  const revenue = activeReservations.reduce((sum, r) => sum + Number(r.prixTotal || 0), 0);
  const occupied = new Set(reservations.filter((r) => ['CONFIRMEE', 'EN_COURS'].includes(r.statut) && r.dateArrivee <= today && r.dateDepart > today).flatMap((r) => r.chambres?.map((entry) => entry.room?.id) || []));
  const activeRooms = rooms.filter((room) => room.disponible);
  const occupancy = activeRooms.length ? Math.round((occupied.size / activeRooms.length) * 100) : 0;
  const byStatus = statuses.map((status) => ({ status, count: reservations.filter((r) => r.statut === status).length }));
  const popularRooms = useMemo(() => {
    const counts = new Map();
    reservations.filter((r) => !['ANNULEE', 'REFUSEE'].includes(r.statut)).forEach((r) => r.chambres?.forEach((entry) => {
      const room = entry.room;
      if (room) counts.set(room.id, { room, count: (counts.get(room.id)?.count || 0) + 1 });
    }));
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [reservations]);
  if (loading) return <div className="container dashboard-wrap"><div className="loading-state">Calcul des indicateurs…</div></div>;
  return <div className="container dashboard-wrap">
    <div className="dashboard-top"><div><div className="eyebrow">HOTEL DES PRINCESSES · Pilotage</div><h1>Vue d’ensemble</h1><p>Les indicateurs de l’hôtel, calculés à partir des séjours enregistrés.</p></div></div>
    {error && <div className="notice error" role="alert">{error}</div>}
    <div className="stat-grid"><div className="stat-card"><span>Chiffre d’affaires réservé</span><strong style={{ fontSize: 21 }}>{formatMoney(revenue)}</strong></div><div className="stat-card"><span>Réservations</span><strong>{reservations.length}</strong></div><div className="stat-card"><span>Occupation aujourd’hui</span><strong>{occupancy}%</strong></div><div className="stat-card"><span>Chambres en service</span><strong>{activeRooms.length}</strong></div></div>
    <div className="admin-stats-grid">
      <section className="table-panel"><div className="panel-head"><h2>Réservations par statut</h2></div><div className="admin-stats-list">{byStatus.map(({ status, count }) => <div className="admin-stat-row" key={status}><span className={`status status--${status}`}>{reservationStatus(status)}</span><div className="admin-stat-track"><i style={{ width: `${reservations.length ? Math.max(4, count / reservations.length * 100) : 0}%` }} /></div><strong>{count}</strong></div>)}</div></section>
      <section className="table-panel"><div className="panel-head"><h2>Chambres les plus réservées</h2><Link className="text-link" to="/admin/rooms">Gérer les chambres →</Link></div>{popularRooms.length ? <div className="table-scroll"><table><thead><tr><th>Chambre</th><th>Catégorie</th><th>Séjours</th></tr></thead><tbody>{popularRooms.map(({ room, count }) => <tr key={room.id}><td><strong>{room.numero}</strong></td><td>{room.category?.name || '—'}</td><td>{count}</td></tr>)}</tbody></table></div> : <div className="empty-state"><strong>Pas encore de séjour enregistré.</strong></div>}</section>
    </div>
    <div className="admin-quick-links"><Link to="/admin/rooms">Chambres →</Link><Link to="/admin/categories">Catégories →</Link><Link to="/admin/users">Utilisateurs →</Link><Link to="/staff">Réservations →</Link></div>
  </div>;
}
