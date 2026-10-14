import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api';

const blank = { name: '', description: '', pricePerNight: '', capacity: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    try { const [categoryResponse, roomResponse] = await Promise.all([api.get('/room-categories'), api.get('/rooms')]); setCategories(categoryResponse.data); setRooms(roomResponse.data); }
    catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { Promise.resolve().then(load); }, []);
  const reset = () => { setForm(blank); setEditing(null); };
  const edit = (category) => { setEditing(category.id); setForm({ name: category.name, description: category.description || '', pricePerNight: category.pricePerNight, capacity: category.capacity }); };
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('');
    const payload = { ...form, pricePerNight: Number(form.pricePerNight), capacity: Number(form.capacity) };
    try { if (editing) await api.patch(`/room-categories/${editing}`, payload); else await api.post('/room-categories', payload); setSuccess(editing ? 'Catégorie modifiée.' : 'Catégorie créée.'); reset(); await load(); }
    catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  };
  const remove = async (category) => {
    const count = rooms.filter((room) => (room.categoryId || room.category?.id) === category.id).length;
    const warning = count ? ` ${count} chambre(s) utilisent cette catégorie.` : '';
    if (!window.confirm(`Supprimer « ${category.name} » ?${warning}`)) return;
    setError(''); setSuccess('');
    try { await api.delete(`/room-categories/${category.id}`); setSuccess('Catégorie supprimée.'); await load(); }
    catch (err) { setError(errorMessage(err)); }
  };
  return <div className="container dashboard-wrap">
    <div className="dashboard-top"><div><div className="eyebrow">Administration · Inventaire</div><h1>Catégories de chambres</h1><p>Gérez les catégories, les capacités et les tarifs de l’hôtel.</p></div></div>
    {error && <div className="notice error" role="alert">{error}</div>}{success && <div className="notice success" role="status">{success}</div>}
    <section className="table-panel"><div className="panel-head"><h2>{editing ? 'Modifier une catégorie' : 'Ajouter une catégorie'}</h2>{editing && <button className="button-small" onClick={reset}>Annuler</button>}</div>
      <form className="admin-room-fields" onSubmit={submit}>
        <div className="form-field"><label htmlFor="category-name">Nom</label><input id="category-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div className="form-field"><label htmlFor="category-capacity">Capacité (personnes)</label><input id="category-capacity" type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required /></div>
        <div className="form-field"><label htmlFor="category-price">Prix par nuit (FCFA)</label><input id="category-price" type="number" min="0" step="0.01" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} required /></div>
        <div className="form-field"><label htmlFor="category-description">Description</label><input id="category-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <button className="button-primary" type="submit" disabled={saving}>{saving ? 'Enregistrement…' : editing ? 'Enregistrer les changements' : 'Créer la catégorie →'}</button>
      </form>
    </section>
    <section className="table-panel" style={{ marginTop: 22 }}><div className="panel-head"><h2>Catégories</h2><span className="room-meta">{categories.length} catégorie{categories.length > 1 ? 's' : ''}</span></div>
      {loading ? <div className="loading-state">Chargement des catégories…</div> : categories.length === 0 ? <div className="empty-state"><strong>Aucune catégorie.</strong>Créez une catégorie pour structurer les chambres.</div> : <div className="table-scroll"><table><thead><tr><th>Nom</th><th>Description</th><th>Capacité</th><th>Tarif par nuit</th><th>Actions</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id}><td><strong>{category.name}</strong></td><td>{category.description || '—'}</td><td>{category.capacity} pers.</td><td>{Number(category.pricePerNight).toLocaleString('fr-FR')} FCFA</td><td><div className="table-actions"><button className="button-small" onClick={() => edit(category)}>Modifier</button><button className="button-small danger" onClick={() => remove(category)}>Supprimer</button></div></td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
