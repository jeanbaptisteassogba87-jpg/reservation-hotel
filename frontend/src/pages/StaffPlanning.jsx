import { useEffect, useMemo, useState } from 'react';
import api, { errorMessage } from '../api';
import { formatDate } from '../utils/format';

const isoDate = (date) => { const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10); };
const shiftDate = (date, amount) => { const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + amount); return isoDate(next); };
const initialPlanningDate = isoDate(new Date());

export default function StaffPlanning() {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [start, setStart] = useState(initialPlanningDate);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([api.get('/rooms'), api.get('/reservations')]).then(([r, b]) => { setRooms(r.data); setReservations(b.data); }).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)); }, []);
  const days = useMemo(() => Array.from({ length: 14 }, (_, index) => shiftDate(start, index)), [start]);
  const eligible = reservations.filter((r) => ['CONFIRMEE', 'EN_COURS'].includes(r.statut));
  const reservationFor = (room, day) => eligible.find((reservation) => reservation.dateArrivee <= day && reservation.dateDepart > day && reservation.chambres?.some((entry) => entry.room?.id === room.id));
  return <div className="container dashboard-wrap">
    <div className="dashboard-top"><div><div className="eyebrow">Réception · Occupation</div><h1>Planning des chambres</h1><p>Visualisez l’occupation des 14 prochains jours.</p></div><label className="planning-start">Début du planning<input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label></div>
    {error && <div className="notice error" role="alert">{error}</div>}{loading ? <div className="loading-state">Chargement du planning…</div> : rooms.length === 0 ? <div className="empty-state"><strong>Aucune chambre disponible.</strong>Ajoutez des chambres à l’inventaire.</div> : <section className="table-panel"><div className="planning-legend"><span><i className="planning-free" /> Libre</span><span><i className="planning-booked" /> Réservée</span><span>Chaque case correspond à une nuit.</span></div><div className="planning-scroll"><table className="planning-table"><thead><tr><th className="planning-room-head">Chambre</th>{days.map((day) => <th key={day}>{formatDate(day).slice(0, 5)}</th>)}</tr></thead><tbody>{rooms.map((room) => <tr key={room.id}><th className="planning-room-head">{room.numero}<small>{room.category?.name}</small></th>{days.map((day) => { const reservation = reservationFor(room, day); return <td className={reservation ? 'planning-booked-cell' : room.disponible ? 'planning-free-cell' : 'planning-disabled-cell'} title={reservation ? `Réservation #${reservation.id} · ${reservation.client?.nom || 'Client'}` : room.disponible ? 'Libre' : 'Chambre désactivée'} key={day}>{reservation ? `#${reservation.id}` : room.disponible ? '·' : '—'}</td>; })}</tr>)}</tbody></table></div></section>}
  </div>;
}
