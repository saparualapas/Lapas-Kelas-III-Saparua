export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route upload
    if (url.pathname === '/api/upload') {
      return handleUpload(request, env);
    }

    // Route serve foto dari R2
    if (url.pathname.startsWith('/media/')) {
      return handleMedia(request, env, url);
    }

    // Static assets
    return env.ASSETS.fetch(request);
  }
};

// ── Serve foto dari R2 ──────────────────────────────────
async function handleMedia(request, env, url) {
  // Ambil key dari URL, contoh: /media/uploads/foto.jpg → uploads/foto.jpg
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

// ── Upload foto ke R2 ───────────────────────────────────
async function handleUpload(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      }
    });
  }

  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) return json({ error: 'File tidak ditemukan' }, 400);
    if (!file.type.startsWith('image/')) return json({ error: 'Hanya file gambar' }, 400);

    const ext = file.name.split('.').pop().toLowerCase();
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await env.BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type }
    });

    // URL pakai domain Worker sendiri, bukan r2.dev
    const publicUrl = `${env.WORKER_URL}/media/${key}`;

    return json({ success: true, publicUrl, key });

  } catch (err) {
    return json({ error: err.message }, 500);
  }
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
