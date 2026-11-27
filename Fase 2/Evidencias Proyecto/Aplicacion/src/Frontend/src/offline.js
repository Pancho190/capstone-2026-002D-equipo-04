const KEY = 'pendingProspectos';

export function getPending() {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

export function addPending(prospecto) {
  const list = getPending();
  list.push(prospecto);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function clearPending() {
  localStorage.removeItem(KEY);
}

export async function syncPending(api) {
  const list = getPending();
  if (list.length === 0) return;
  const synced = [];
  for (const p of list) {
    try {
      await api.post('/prospectos', p);
      synced.push(p);
    } catch (e) {
      // sigue intentando con los demás
    }
  }
  const remaining = list.filter((p) => !synced.includes(p));
  localStorage.setItem(KEY, JSON.stringify(remaining));
}