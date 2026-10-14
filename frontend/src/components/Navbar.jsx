import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth-context';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const admin = user?.role === 'ADMIN';
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <nav className="nav" aria-label="Navigation principale">
        <Link className="brand" to="/" onClick={close}>
          <span className="brand-mark">P</span>
          <span className="brand-copy"><strong>HOTEL DES PRINCESSES</strong><span>Hôtel & élégance</span></span>
        </Link>
        <div className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>La maison</NavLink>
          <NavLink to="/search" className={({ isActive }) => isActive || location.pathname === '/reserve' ? 'active' : undefined} onClick={close}>Nos chambres</NavLink>
          {user && <NavLink to="/my-reservations" onClick={close}>Mes séjours</NavLink>}
          {user?.role === 'CLIENT' && <NavLink to="/profile" onClick={close}>Mon profil</NavLink>}
          {user?.role === 'RECEPTIONNISTE' && <NavLink to="/staff" end onClick={close}>Tableau réception</NavLink>}
          {user?.role === 'RECEPTIONNISTE' && <NavLink to="/staff/reservations" onClick={close}>Réservations</NavLink>}
          {user?.role === 'RECEPTIONNISTE' && <NavLink to="/staff/planning" onClick={close}>Planning</NavLink>}
          {user?.role === 'RECEPTIONNISTE' && <NavLink to="/staff/clients" onClick={close}>Clients</NavLink>}
          {admin && <NavLink to="/staff" end onClick={close}>Réception</NavLink>}
          {admin && <NavLink to="/admin/stats" onClick={close}>Administration</NavLink>}
          {admin && <NavLink to="/admin/rooms" onClick={close}>Inventaire</NavLink>}
        </div>
        <div className="nav-right">
          {user ? (
            <button className="nav-action" onClick={() => { logout(); navigate('/'); close(); }}>Déconnexion</button>
          ) : <Link className="nav-action" to="/login">Connexion</Link>}
          <Link className="nav-cta" to={user?.role === 'RECEPTIONNISTE' ? '/staff/new-reservation' : '/search'}>{user?.role === 'RECEPTIONNISTE' ? 'Nouvelle réservation' : 'Réserver un séjour'}</Link>
          <button className="menu-toggle" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '×' : '☰'}</button>
        </div>
      </nav>
    </header>
  );
}
