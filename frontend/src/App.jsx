import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import MyReservations from './pages/MyReservations';
import Staff from './pages/Staff';
import AdminRooms from './pages/AdminRooms';
import AdminCategories from './pages/AdminCategories';
import AdminUsers from './pages/AdminUsers';
import AdminStats from './pages/AdminStats';
import StaffReservations from './pages/StaffReservations';
import StaffPlanning from './pages/StaffPlanning';
import StaffNewReservation from './pages/StaffNewReservation';
import StaffClients from './pages/StaffClients';
import Profile from './pages/Profile';
import SiteFooter from './components/SiteFooter';
import WhatsAppButton from './components/WhatsAppButton';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/reserve" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/my-reservations"
            element={
              <PrivateRoute>
                <MyReservations />
              </PrivateRoute>
            }
          />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route
            path="/staff"
            element={
              <PrivateRoute roles={['RECEPTIONNISTE', 'ADMIN']}>
                <Staff />
              </PrivateRoute>
            }
          />
          <Route path="/staff/reservations" element={<PrivateRoute roles={['RECEPTIONNISTE', 'ADMIN']}><StaffReservations /></PrivateRoute>} />
          <Route path="/staff/planning" element={<PrivateRoute roles={['RECEPTIONNISTE', 'ADMIN']}><StaffPlanning /></PrivateRoute>} />
          <Route path="/staff/new-reservation" element={<PrivateRoute roles={['RECEPTIONNISTE', 'ADMIN']}><StaffNewReservation /></PrivateRoute>} />
          <Route path="/staff/clients" element={<PrivateRoute roles={['RECEPTIONNISTE', 'ADMIN']}><StaffClients /></PrivateRoute>} />
          <Route path="/admin/rooms" element={<PrivateRoute roles={['ADMIN']}><AdminRooms /></PrivateRoute>} />
          <Route path="/admin/categories" element={<PrivateRoute roles={['ADMIN']}><AdminCategories /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={['ADMIN']}><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/stats" element={<PrivateRoute roles={['ADMIN']}><AdminStats /></PrivateRoute>} />
          <Route path="*" element={<div className="container error-page"><div className="eyebrow">Oups, mauvaise adresse</div><h1>Cette page n’existe pas.</h1><Link className="text-link" to="/">Retourner à l’accueil →</Link></div>} />
        </Routes>
      </main>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
