export const formatDate = (value) => {
  if (!value) return '—';
  const [year, month, day] = String(value).slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

export const formatMoney = (value) => `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;

export const reservationStatus = (value) => ({
  EN_ATTENTE: 'En attente',
  CONFIRMEE: 'Confirmée',
  REFUSEE: 'Refusée',
  ANNULEE: 'Annulée',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
})[value] || value;
