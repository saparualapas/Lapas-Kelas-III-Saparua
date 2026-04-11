export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/upload')       return handleUpload(request, env);
    if (url.pathname === '/api/media-list')   return handleMediaList(request, env);
    if (url.pathname === '/api/media-delete') return handleMediaDelete(request, env);
    if (url.pathname.startsWith('/media/'))   return handleServeMedia(request, env, url);

    return env.ASSETS.fetch(request);
  }
};

// ── Serve foto dari R2 ──────────────────────────────────
async function handleServeMedia(request, env, url) {
  const key = url.pathname.replace('/media/', '');
  if (!key) return new Response('Not found', { status: 404 });

  const object = await env.BUCKET.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
  headers.set('Cache-Control', 'public, max-age=31536000');
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(object.body, { headers });
}

// ── List semua foto di R2 ───────────────────────────────
async function handleMediaList(request, env) {
  if (request.method === 'OPTIONS') return corsPrelight();

  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

  try {
    const listed = await env.BUCKET.list({ prefix: 'uploads/' });
    const workerUrl = env.WORKER_URL;

    const files = listed.objects
      .filter(obj => obj.size > 0)
      .sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded))
      .map(obj => ({
        key:      obj.key,
        name:     obj.key.split('/').pop(),
        url:      `${workerUrl}/media/${obj.key}`,
        size:     formatSize(obj.size),
        uploaded: new Date(obj.uploaded).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'short', year: 'numeric'
        }),
      }));

    return json({ files });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

// ── Hapus foto dari R2 ──────────────────────────────────
async function handleMediaDelete(request, env) {
  if (request.method === 'OPTIONS') return corsPrelight();
  if (request.method !== 'DELETE') return json({ error: 'Method not allowed' }, 405);

  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!key) return json({ error: 'key diperlukan' }, 400);

  if (!key.startsWith('uploads/')) return json({ error: 'Tidak diizinkan' }, 403);

  try {
    await env.BUCKET.delete(key);
    return json({ success: true });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

// ── Upload foto ke R2 ───────────────────────────────────
async function handleUpload(request, env) {
  if (request.method === 'OPTIONS') return corsPrelight();
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) return json({ error: 'File tidak ditemukan' }, 400);
    if (!file.type.startsWith('image/')) return json({ error: 'Hanya file gambar' }, 400);

    const ext = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await env.BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type }
    });

    const publicUrl = `${env.WORKER_URL}/media/${key}`;
    return json({ success: true, publicUrl, key });

  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function corsPrelight() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    }
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}

function formatSize(bytes) {
  if (bytes < 1024)         return bytes + ' B';
  if (bytes < 1024 * 1024)  return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
