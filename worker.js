import { AwsClient } from 'aws4fetch';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route API upload
    if (url.pathname === '/api/upload-url') {
      return handleUploadUrl(request, env);
    }

    // Semua request lain → static assets (HTML, CSS, JS, dll)
    return env.ASSETS.fetch(request);
  }
};

async function handleUploadUrl(request, env) {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      }
    });
  }

  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // Validasi auth — hanya admin Supabase yang boleh upload
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(request.url);
  const filename    = url.searchParams.get('filename');
  const contentType = url.searchParams.get('type') || 'image/jpeg';

  if (!filename) return json({ error: 'filename diperlukan' }, 400);

  // Sanitize — buat nama file unik agar tidak tertimpa
  const ext = filename.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Generate presigned URL pakai aws4fetch
  const aws = new AwsClient({
    accessKeyId:     env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    service: 's3',
    region:  'auto',
  });

  const r2Endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${key}`;

  const signed = await aws.sign(
    new Request(r2Endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': contentType }
    }),
    { aws: { signQuery: true }, expiresIn: 300 } // URL berlaku 5 menit
  );

  return json({
    uploadUrl: signed.url,
    publicUrl: `${env.R2_PUBLIC_URL}/${key}`,
    key,
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
