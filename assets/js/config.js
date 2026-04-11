// ╔══════════════════════════════════════════════════════╗
// ║  EDIT BAGIAN INI SESUAI PROJECT ANDA                ║
// ╚══════════════════════════════════════════════════════╝
const SUPABASE_URL      = 'https://ftjnhtvldsgzdyhtycdi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0am5odHZsZHNnemR5aHR5Y2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTI1ODYsImV4cCI6MjA5MTE2ODU4Nn0.dxxjODoqWUGItnPnOO6aCG3OU0HFtrcMuujWcB6thj0';
//const R2_PUBLIC_URL     = 'https://707ded1990065af7ad305e0b0f1b220c.r2.cloudflarestorage.com'; // tanpa trailing slas
const R2_PUBLIC_URL = 'https://lapassaparua.saparualapas.workers.dev/media';
// ╔══════════════════════════════════════════════════════╗
// ║  JANGAN EDIT DI BAWAH INI                           ║
// ╚══════════════════════════════════════════════════════╝
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: get all web_settings as a map
async function getSettings() {
  const { data } = await sb.from('web_settings').select('key_name,value_text');
  const s = {};
  (data||[]).forEach(r => s[r.key_name] = r.value_text);
  return s;
}

// Helper: toast (dipanggil setelah DOM ready)
function toast(msg, type='success') {
  const el = document.getElementById('global-toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `toast toast-${type} show`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3500);
}
