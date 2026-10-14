import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '../api';
import { roomImageUrl } from '../utils/roomImages';

const emptyForm = { numero: '', description: '', imageUrl: '', equipements: '', disponible: true, categoryId: '' };

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [roomResponse, categoryResponse] = await Promise.all([api.get('/rooms'), api.get('/room-categories')]);
      setRooms(roomResponse.data); setCategories(categoryResponse.data);
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const resetForm = () => { setEditingId(null); setForm(emptyForm); };
  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(''); setSuccess('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choisis une image JPEG, PNG ou WebP.'); event.target.value = ''; return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La photo ne doit pas dépasser 5 Mo.'); event.target.value = ''; return;
    }
    setUploading(true);
    try {
      const data = new FormData(); data.append('image', file);
      const response = await api.post('/rooms/upload', data);
      setForm((current) => ({ ...current, imageUrl: response.data.imageUrl }));
      setSuccess('Photo importée. Enregistre la chambre pour confirmer les changements.');
    } catch (err) { setError(errorMessage(err)); }
    finally { setUploading(false); event.target.value = ''; }
  };
  const editRoom = (room) => {
    setEditingId(room.id);
    setForm({ numero: room.numero || '', description: room.description || '', imageUrl: room.imageUrl || '', equipements: room.equipements || '', disponible: room.disponible, categoryId: String(room.categoryId || room.category?.id || '') });
    setSuccess('');
    document.getElementById('room-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setSuccess('');
    const payload = { ...form, categoryId: Number(form.categoryId) };
    try {
      if (editingId) await api.patch(`/rooms/${editingId}`, payload);
      else await api.post('/rooms', payload);
      setSuccess(editingId ? 'La chambre a bien été modifiée.' : 'La chambre a bien été créée.');
      resetForm(); await load();
    } catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  };
  const toggleAvailable = async (room) => {
    setError(''); setSuccess('');
    try { await api.patch(`/rooms/${room.id}`, { disponible: !room.disponible }); setSuccess(`Chambre ${room.numero} ${room.disponible ? 'désactivée' : 'activée'}.`); await load(); }
    catch (err) { setError(errorMessage(err)); }
  };
  const remove = async (room) => {
    if (!window.confirm(`Supprimer définitivement la chambre ${room.numero} ?`)) return;
    setError(''); setSuccess('');
    try { await api.delete(`/rooms/${room.id}`); setSuccess(`La chambre ${room.numero} a été supprimée.`); if (editingId === room.id) resetForm(); await load(); }
    catch (err) { setError(errorMessage(err)); }
  };

  return <div className="container dashboard-wrap">
    <div className="dashboard-top"><div><div className="eyebrow">Administration · Inventaire</div><h1>Gestion des chambres</h1><p>Créez, actualisez et mettez à jour les chambres de l’hôtel.</p></div></div>
    {error && <div className="notice error" role="alert">{error}</div>}{success && <div className="notice success" role="status">{success}</div>}
    <section className="table-panel room-admin-form" id="room-form">
      <div className="panel-head"><h2>{editingId ? `Modifier la chambre ${form.numero}` : 'Ajouter une chambre'}</h2>{editingId && <button className="button-small" type="button" onClick={resetForm}>Annuler la modification</button>}</div>
      <form className="admin-room-fields" onSubmit={submit}>
        <div className="form-field"><label htmlFor="room-number">Numéro de chambre</label><input id="room-number" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="Ex. 201" required /></div>
        <div className="form-field"><label htmlFor="room-category">Catégorie</label><select id="room-category" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required><option value="">Choisir une catégorie</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name} · {Number(category.pricePerNight).toLocaleString('fr-FR')} FCFA / nuit</option>)}</select></div>
        <div className="form-field admin-room-wide"><label htmlFor="room-description">Description</label><textarea id="room-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Décrivez la chambre" rows="3" /></div>
        <div className="form-field"><label htmlFor="room-image-file">Importer une photo depuis l’appareil</label><input id="room-image-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} disabled={uploading} /><small className="admin-room-hint">JPEG, PNG ou WebP · 5 Mo maximum</small></div>
        <div className="form-field"><label htmlFor="room-image">Ou coller une URL d’image</label><input id="room-image" type="text" inputMode="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://… ou /uploads/photo.jpg" /></div>
        {form.imageUrl && <div className="admin-room-image-preview"><img src={roomImageUrl({ imageUrl: form.imageUrl, id: editingId || 0 })} alt="Aperçu de la photo de chambre" /><span>Aperçu de la photo</span></div>}
        <div className="form-field"><label htmlFor="room-equipment">Équipements</label><input id="room-equipment" value={form.equipements} onChange={(e) => setForm({ ...form, equipements: e.target.value })} placeholder="Wi-Fi, climatisation…" /></div>
        <label className="admin-room-availability"><input type="checkbox" checked={form.disponible} onChange={(e) => setForm({ ...form, disponible: e.target.checked })} /> Chambre en service</label>
        <button className="button-primary" type="submit" disabled={saving || uploading || categories.length === 0}>{uploading ? 'Import de la photo…' : saving ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : 'Ajouter la chambre →'}</button>
        {categories.length === 0 && !loading && <p className="admin-room-hint">Crée d’abord une catégorie pour pouvoir ajouter des chambres.</p>}
      </form>
    </section>
    <section className="table-panel" style={{ marginTop: 22 }}>
      <div className="panel-head"><h2>Les chambres</h2><span className="room-meta">{rooms.length} chambre{rooms.length > 1 ? 's' : ''}</span></div>
      {loading ? <div className="loading-state">Chargement des chambres…</div> : rooms.length === 0 ? <div className="empty-state"><strong>Aucune chambre enregistrée.</strong>Ajoutez la première chambre avec le formulaire ci-dessus.</div> : <div className="table-scroll"><table>
        <thead><tr><th>Chambre</th><th>Catégorie</th><th>Capacité</th><th>Prix / nuit</th><th>État</th><th>Actions</th></tr></thead>
        <tbody>{rooms.map((room) => <tr key={room.id}>
          <td><div className="admin-room-cell"><img src={roomImageUrl(room)} alt="" loading="lazy" /><span><strong>{room.numero}</strong>{room.description && <><br /><span className="room-meta">{room.description}</span></>}</span></div></td><td>{room.category?.name || '—'}</td><td>{room.category?.capacity ?? '—'} pers.</td><td>{Number(room.category?.pricePerNight || 0).toLocaleString('fr-FR')} FCFA</td>
          <td><span className={`status ${room.disponible ? 'status--CONFIRMEE' : 'status--ANNULEE'}`}>{room.disponible ? 'En service' : 'Désactivée'}</span></td>
          <td><div className="table-actions"><button className="button-small" onClick={() => editRoom(room)}>Modifier</button><button className="button-small" onClick={() => toggleAvailable(room)}>{room.disponible ? 'Désactiver' : 'Activer'}</button><button className="button-small danger" onClick={() => remove(room)}>Supprimer</button></div></td>
        </tr>)}</tbody>
      </table></div>}
    </section>
  </div>;
}
