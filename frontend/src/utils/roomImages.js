import api from '../api';

const fallbackImages = [
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1100&q=82',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1100&q=82',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1100&q=82',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1100&q=82',
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1100&q=82',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1100&q=82',
];

export function roomImageUrl(room, index = 0) {
  if (!room?.imageUrl) return fallbackImages[Math.abs(Number(room?.id) || index) % fallbackImages.length];
  if (/^https?:\/\//i.test(room.imageUrl) || room.imageUrl.startsWith('data:')) return room.imageUrl;
  return new URL(room.imageUrl, api.defaults.baseURL).toString();
}
