import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { roomImageUrl } from '../utils/roomImages';

export default function Home() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState({ dateArrivee: '', dateDepart: '' });

  useEffect(() => {
    api.get('/rooms').then((res) => setRooms(res.data.filter((room) => room.disponible))).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-content">
      <section className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow">Une parenthèse à part</div>
          <h1>L’art de se sentir ailleurs.</h1>
          <p>Un lieu confidentiel où le confort rencontre l’élégance. Bienvenue chez vous, en mieux.</p>
          <Link className="hero-link" to="/search">Découvrir nos chambres <span>→</span></Link>
        </div>
      </section>

      <form className="booking-panel" onSubmit={(event) => { event.preventDefault(); navigate(`/search?dateArrivee=${dates.dateArrivee}&dateDepart=${dates.dateDepart}`); }}>
        <label className="booking-field"><span className="field-label">Arrivée</span><input type="date" value={dates.dateArrivee} onChange={(e) => setDates({ ...dates, dateArrivee: e.target.value })} required /></label>
        <label className="booking-field"><span className="field-label">Départ</span><input type="date" value={dates.dateDepart} onChange={(e) => setDates({ ...dates, dateDepart: e.target.value })} required /></label>
        <button className="button-primary" type="submit">Trouver mon séjour <span aria-hidden="true">→</span></button>
      </form>

      <section className="section container">
        <div className="section-heading">
          <div><div className="eyebrow">Le calme, tout simplement</div><h2>Nos chambres & suites</h2></div>
          <div><p>Des espaces pensés pour ralentir et savourer l’instant.</p><Link className="text-link" to="/search">Voir toutes les disponibilités →</Link></div>
        </div>
        {error && <div className="notice error">{error}</div>}
        {!error && loading && <div className="loading-state">Nos chambres se préparent pour vous…</div>}
        {!error && !loading && rooms.length === 0 && <div className="empty-state"><strong>Nos chambres arrivent bientôt.</strong>Contactez la réception pour connaître les prochaines disponibilités.</div>}
        <div className="room-grid">
        {rooms.map((room, index) => (
            <article className="room-card" key={room.id} style={{ animationDelay: `${index * 100}ms` }}>
              <img className="room-image" src={roomImageUrl(room, index)} alt={`Chambre ${room.numero} · ${room.category?.name || 'HOTEL DES PRINCESSES'}`} loading="lazy" />
              <div className="room-content">
                <div className="room-meta"><span>{room.category?.name || 'Chambre signature'}</span><span>{room.category?.capacity || '—'} voyageurs</span></div>
                <h3>Chambre {room.numero}</h3>
                <p className="room-description">{room.description || room.category?.description || 'Un espace lumineux, pensé pour votre confort et votre tranquillité.'}</p>
                <div className="room-bottom"><span className="room-price"><strong>{Number(room.category?.pricePerNight || 0).toLocaleString('fr-FR')}</strong> FCFA / nuit</span><Link to="/search">Découvrir →</Link></div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="feature-strip"><div className="container feature-list">
        <div className="feature"><span className="feature-icon">✳</span><div><strong>Le sens du détail</strong><span>Chaque attention compte.</span></div></div>
        <div className="feature"><span className="feature-icon">⌂</span><div><strong>Un accueil sincère</strong><span>On vous reçoit comme chez vous.</span></div></div>
        <div className="feature"><span className="feature-icon">♡</span><div><strong>Le temps de souffler</strong><span>Votre séjour, à votre rythme.</span></div></div>
      </div></section>
    </div>
  );
}
