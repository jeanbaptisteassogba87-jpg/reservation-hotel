import { Link } from 'react-router-dom';
import { whatsappUrl } from '../utils/contact';

export default function SiteFooter() {
  return <footer className="site-footer">
    <div className="container site-footer-grid">
      <Link className="brand footer-brand" to="/">
        <span className="brand-mark">P</span>
        <span className="brand-copy"><strong>HOTEL DES PRINCESSES</strong><span>Hôtel & élégance</span></span>
      </Link>
      <p>Une adresse, mille souvenirs.</p>
      <div className="footer-links"><a href={whatsappUrl} target="_blank" rel="noreferrer">Nous contacter sur WhatsApp</a><Link to="/">Accueil</Link></div>
      <span className="footer-copy">© HOTEL DES PRINCESSES</span>
    </div>
  </footer>;
}
