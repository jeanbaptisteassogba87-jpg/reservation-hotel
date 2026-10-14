import { useEffect, useMemo, useState } from 'react';
import api, { errorMessage } from '../api';
import { formatDate, formatMoney } from '../utils/format';

const paymentModes = [
  ['ESPECES', 'Espèces'],
  ['CARTE', 'Carte bancaire'],
  ['MOBILE_MONEY', 'Mobile Money'],
];

export default function PaymentModal({ reservation, onClose, onPaid }) {
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('CARTE');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const paid = useMemo(() => payments.reduce((sum, item) => sum + Number(item.montant || 0), 0), [payments]);
  const remaining = Math.max(0, Number(reservation.prixTotal || 0) - paid);
  useEffect(() => {
    api.get(`/payments/reservation/${reservation.id}`).then(({ data }) => {
      setPayments(data);
      const alreadyPaid = data.reduce((sum, item) => sum + Number(item.montant || 0), 0);
      setAmount(String(Math.max(0, Number(reservation.prixTotal || 0) - alreadyPaid)));
    }).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false));
  }, [reservation.id, reservation.prixTotal]);
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      const { data } = await api.post('/payments', { reservationId: reservation.id, montant: Number(amount), modePaiement: mode });
      setSuccess(`Paiement enregistré. Reste à payer : ${formatMoney(data.reste)}.`);
      setAmount('');
      const history = await api.get(`/payments/reservation/${reservation.id}`);
      setPayments(history.data);
      const newRemaining = Math.max(0, Number(reservation.prixTotal || 0) - history.data.reduce((sum, item) => sum + Number(item.montant || 0), 0));
      setAmount(newRemaining ? String(newRemaining) : '');
      onPaid?.(data);
    } catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-title">
      <div className="panel-head"><div><span className="eyebrow">Dossier n°{reservation.id}</span><h2 id="payment-title">Paiement du séjour</h2></div><button className="modal-close" onClick={onClose} aria-label="Fermer">×</button></div>
      <div className="payment-summary"><span>Total séjour <strong>{formatMoney(reservation.prixTotal)}</strong></span><span>Déjà réglé <strong>{formatMoney(paid)}</strong></span><span>Reste à payer <strong>{formatMoney(remaining)}</strong></span></div>
      {error && <div className="notice error" role="alert">{error}</div>}{success && <div className="notice success" role="status">{success}</div>}
      {remaining > 0 && <form className="payment-form" onSubmit={submit}><div className="form-field"><label htmlFor="payment-amount">Montant à payer (FCFA)</label><input id="payment-amount" type="number" min="1" max={remaining} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={String(remaining)} required /></div><div className="form-field"><label htmlFor="payment-mode">Mode de paiement</label><select id="payment-mode" value={mode} onChange={(e) => setMode(e.target.value)}>{paymentModes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><button className="button-primary" disabled={saving || loading}>{saving ? 'Enregistrement…' : 'Enregistrer le paiement →'}</button></form>}
      <div className="payment-history"><h3>Historique des paiements</h3>{loading ? <p>Chargement…</p> : payments.length === 0 ? <p>Aucun paiement enregistré.</p> : payments.map((payment) => <div className="payment-history-row" key={payment.id}><span>{formatDate(String(payment.datePaiement).slice(0, 10))} · {paymentModes.find(([value]) => value === payment.modePaiement)?.[1] || payment.modePaiement}</span><strong>{formatMoney(payment.montant)}</strong></div>)}</div>
    </section>
  </div>;
}
