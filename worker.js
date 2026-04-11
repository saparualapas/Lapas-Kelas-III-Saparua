export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/upload') {
      return handleUpload(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleUpload(request, env) {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      }
    });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // Cek auth
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Ambil file dari form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) return json({ error: 'File tidak ditemukan' }, 400);

    // Validasi tipe
    if (!file.type.startsWith('image/')) {
      return json({ error: 'Hanya file gambar' }, 400);
    }

    // Buat nama file unik
    const ext = file.name.split('.').pop().toLowerCase();
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Upload langsung ke R2 via binding — tidak butuh aws4fetch!
    await env.BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type }
    });

    const publicUrl = `${env.R2_PUBLIC_URL}/${key}`;

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
