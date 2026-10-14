import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useAuth } from '../auth-context';
import PaymentModal from '../components/PaymentModal';
import { roomImageUrl } from '../utils/roomImages';

export default function Search() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [dates, setDates] = useState({ dateArrivee: params.get('dateArrivee') || '', dateDepart: params.get('dateDepart') || '' });
  const [rooms, setRooms] = useState(null);
  const [searched, setSearched] = useState(false);
  const [availableNow, setAvailableNow] = useState(new Set());
  const [availabilityReady, setAvailabilityReady] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ categoryId: '', guests: '' });
  const [selected, setSelected] = useState([]);
  const [paymentReservation, setPaymentReservation] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const arrival = today.toISOString().slice(0, 10);
    today.setDate(today.getDate() + 1);
    const departure = today.toISOString().slice(0, 10);
    const loadCatalogue = async () => {
      try {
        const { data } = await api.get('/rooms');
        if (!cancelled) setRooms(data);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
        return;
      }
      try {
        const { data } = await api.get('/reservations/availability', { params: { dateArrivee: arrival, dateDepart: departure } });
        if (!cancelled) setAvailableNow(new Set(data.map((room) => room.id)));
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setAvailabilityReady(true);
      }
    };
    loadCatalogue();
    api.get('/room-categories').then(({ data }) => { if (!cancelled) setCategories(data); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const search = async () => {
    setError(''); setMessage(''); setSelected([]); setRooms(null); setSearched(true); setLoading(true);
    try {
      const { data } = await api.get('/reservations/availability', { params: dates });
      setRooms(data);
    } catch (err) { setRooms(null); setError(errorMessage(err)); }
    finally { setLoading(false); }
  };
  const handleSubmit = (e) => { e.preventDefault(); search(); };
  const showDatePicker = () => {
    document.getElementById('search-dates')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const arrivalInput = document.getElementById('arrival-date');
    arrivalInput?.focus({ preventScroll: true });
    try { arrivalInput?.showPicker?.(); } catch { /* Certains navigateurs n'ouvrent le calendrier qu'après un délai. */ }
  };

  const nights = dates.dateArrivee && dates.dateDepart ? Math.max(0, (Date.parse(`${dates.dateDepart}T00:00:00Z`) - Date.parse(`${dates.dateArrivee}T00:00:00Z`)) / 86400000) : 0;
  const selectedRooms = rooms?.filter((room) => selected.includes(room.id)) || [];
  const estimate = selectedRooms.reduce((sum, room) => sum + Number(room.category?.pricePerNight || 0) * nights, 0);
  const filteredRooms = rooms?.filter((room) =>
    (!filters.categoryId || String(room.categoryId || room.category?.id) === filters.categoryId)
    && (!filters.guests || Number(room.category?.capacity || 0) >= Number(filters.guests)),
  ) || [];
  const toggleRoom = (id) => setSelected((current) => current.includes(id) ? current.filter((roomId) => roomId !== id) : [...current, id]);

  const reserve = async () => {
    if (!selected.length) return;
    if (!user) return navigate('/login');
    if (user.role !== 'CLIENT') return navigate('/staff/new-reservation');
    const body = { ...dates, roomIds: selected };
    setError(''); setReserving(true);
    try {
      const { data } = await api.post('/reservations', body);
      setMessage(`Réservation n°${data.id} créée. Vérifiez le récapitulatif et choisissez votre mode de paiement.`);
      setSelected([]);
      setPaymentReservation(data);
    } catch (err) { setError(errorMessage(err)); }
    finally { setReserving(false); }
  };

  return <div className="container page-content">
    <div className="page-heading"><div className="eyebrow">Votre prochaine escapade</div><h1>Trouvez votre chambre.</h1><p>Choisissez vos dates, nous nous occupons du reste.</p></div>
    <form className="search-panel" id="search-dates" onSubmit={handleSubmit}>
      <label className="booking-field"><span className="field-label">Arrivée</span><input id="arrival-date" type="date" value={dates.dateArrivee} onChange={(e) => setDates({ ...dates, dateArrivee: e.target.value })} required /></label>
      <label className="booking-field"><span className="field-label">Départ</span><input type="date" value={dates.dateDepart} onChange={(e) => setDates({ ...dates, dateDepart: e.target.value })} required /></label>
      <label className="booking-field"><span className="field-label">Catégorie</span><select value={filters.categoryId} onChange={(e) => { setFilters({ ...filters, categoryId: e.target.value }); setSelected([]); }}><option value="">Toutes les catégories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label className="booking-field"><span className="field-label">Voyageurs</span><select value={filters.guests} onChange={(e) => { setFilters({ ...filters, guests: e.target.value }); setSelected([]); }}><option value="">Tous les voyageurs</option>{[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} personne{count > 1 ? 's' : ''} minimum</option>)}</select></label>
      <button className="button-primary" type="submit" disabled={loading}>{loading ? 'Recherche…' : 'Rechercher les chambres →'}</button>
    </form>
    {message && <div className="notice success">{message} · <Link to="/my-reservations">Voir mes séjours</Link></div>}
    {error && <div className="notice error">{error}</div>}
    {rooms && <>
      <div className="section-heading"><h2 className="search-title">{searched ? `${filteredRooms.length} chambre${filteredRooms.length > 1 ? 's' : ''} libre${filteredRooms.length > 1 ? 's' : ''} pour ces dates` : `Toutes nos chambres · ${filteredRooms.length}`}</h2><span className="room-meta">{searched ? `${nights} nuit${nights === 1 ? '' : 's'}` : 'HOTEL DES PRINCESSES'}</span></div>
      {!filteredRooms.length ? <div className="search-empty"><span>⌂</span><strong>{searched ? 'Aucune chambre pour ces critères et ces dates' : 'Aucune chambre correspondant à ces critères'}</strong>{searched ? 'Essayez d’autres dates, une autre catégorie ou une capacité différente.' : 'Modifiez les filtres pour voir les chambres disponibles.'}</div> : <div className="room-grid">
        {filteredRooms.map((room, index) => <article className="room-card" key={room.id} style={{ animationDelay: `${index * 80}ms` }}>
          <img className="room-image" src={roomImageUrl(room, index)} alt={`Chambre ${room.numero} · ${room.category?.name || 'HOTEL DES PRINCESSES'}`} loading="lazy" />
          <div className="room-content"><div className="room-meta"><span>{room.category?.name}</span><span>{room.category?.capacity} voyageurs</span></div><span className={`room-availability ${searched ? 'is-available' : room.disponible && availableNow.has(room.id) ? 'is-available' : 'is-unavailable'}`}>{searched ? 'Libre pour ces dates' : !room.disponible ? 'Hors service' : !availabilityReady ? 'Vérification…' : availableNow.has(room.id) ? 'Disponible maintenant' : 'Occupée actuellement'}</span><h3>Chambre {room.numero}</h3>
            <p className="room-description">{room.description || room.category?.description || 'Un cocon élégant pour profiter pleinement de votre séjour.'}</p>
            <div className="room-bottom"><span className="room-price"><strong>{Number(room.category?.pricePerNight || 0).toLocaleString('fr-FR')}</strong> FCFA / nuit</span><button className={`button-small ${selected.includes(room.id) ? 'selected-room' : ''}`} type="button" aria-pressed={selected.includes(room.id)} onClick={searched ? () => toggleRoom(room.id) : showDatePicker}>{searched ? selected.includes(room.id) ? 'Sélectionnée ✓' : 'Choisir +' : 'Choisir les dates'}</button></div>
          </div>
        </article>)}
      </div>}
      {filteredRooms.length > 0 && selected.length > 0 && <div className="selection-summary"><div><strong>{selected.length} chambre{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''}</strong><span>Estimation pour {nights} nuit{nights === 1 ? '' : 's'} · {Number(estimate).toLocaleString('fr-FR')} FCFA</span></div><button className="button-primary" type="button" disabled={reserving} onClick={reserve}>{reserving ? 'Création de la réservation…' : 'Réserver et passer au paiement →'}</button></div>}
    </>}
    {paymentReservation && <PaymentModal reservation={paymentReservation} onClose={() => setPaymentReservation(null)} onPaid={() => setMessage('Paiement enregistré. Votre réservation est en attente de confirmation par l’hôtel.')} />}
  </div>;
}
