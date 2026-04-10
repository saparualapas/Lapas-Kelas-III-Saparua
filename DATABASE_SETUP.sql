-- ════════════════════════════════════════════════════════════
-- LAPAS WEBSITE v2 — DATABASE SETUP LENGKAP
-- Jalankan di Supabase → SQL Editor → New Query → Run
-- ════════════════════════════════════════════════════════════

-- ── 1. EXTENSION UUID ──────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 2. BUAT TABEL ──────────────────────────────────────────

-- Konfigurasi Global
CREATE TABLE IF NOT EXISTS web_settings (
    id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key_name   TEXT UNIQUE NOT NULL,
    value_text TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sambutan Kepala Lapas (max 1 baris)
CREATE TABLE IF NOT EXISTS sambutan (
    id        UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name      TEXT,
    position  TEXT DEFAULT 'Kepala Lembaga Pemasyarakatan',
    title     TEXT DEFAULT 'Sambutan Kepala Lapas',
    content   TEXT,
    photo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Struktur Organisasi / Hierarki Pegawai
CREATE TABLE IF NOT EXISTS staff_hierarchy (
    id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name           TEXT NOT NULL,
    position       TEXT NOT NULL,
    image_url      TEXT,
    order_priority INTEGER DEFAULT 99,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Berita & Kegiatan
CREATE TABLE IF NOT EXISTS news_posts (
    id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title         TEXT NOT NULL,
    content       TEXT,
    thumbnail_url TEXT,
    author        TEXT,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Konten Halaman Statis (Visi-Misi, Alur, Syarat, Kontak)
CREATE TABLE IF NOT EXISTS page_contents (
    id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_name    TEXT UNIQUE NOT NULL,
    body_text    TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. AKTIFKAN ROW LEVEL SECURITY ─────────────────────────
ALTER TABLE web_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sambutan        ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_contents   ENABLE ROW LEVEL SECURITY;

-- ── 4. POLICIES RLS ────────────────────────────────────────
-- Prinsip: Publik hanya bisa SELECT. Hanya user yang terautentikasi (admin) yang bisa INSERT/UPDATE/DELETE.

-- web_settings
DROP POLICY IF EXISTS "public_read_settings" ON web_settings;
DROP POLICY IF EXISTS "admin_all_settings"   ON web_settings;
CREATE POLICY "public_read_settings" ON web_settings FOR SELECT USING (true);
CREATE POLICY "admin_all_settings"   ON web_settings FOR ALL    USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- sambutan
DROP POLICY IF EXISTS "public_read_sambutan" ON sambutan;
DROP POLICY IF EXISTS "admin_all_sambutan"   ON sambutan;
CREATE POLICY "public_read_sambutan" ON sambutan FOR SELECT USING (true);
CREATE POLICY "admin_all_sambutan"   ON sambutan FOR ALL    USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- staff_hierarchy
DROP POLICY IF EXISTS "public_read_staff" ON staff_hierarchy;
DROP POLICY IF EXISTS "admin_all_staff"   ON staff_hierarchy;
CREATE POLICY "public_read_staff" ON staff_hierarchy FOR SELECT USING (true);
CREATE POLICY "admin_all_staff"   ON staff_hierarchy FOR ALL    USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- news_posts
DROP POLICY IF EXISTS "public_read_news" ON news_posts;
DROP POLICY IF EXISTS "admin_all_news"   ON news_posts;
CREATE POLICY "public_read_news" ON news_posts FOR SELECT USING (true);
CREATE POLICY "admin_all_news"   ON news_posts FOR ALL    USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- page_contents
DROP POLICY IF EXISTS "public_read_pages" ON page_contents;
DROP POLICY IF EXISTS "admin_all_pages"   ON page_contents;
CREATE POLICY "public_read_pages" ON page_contents FOR SELECT USING (true);
CREATE POLICY "admin_all_pages"   ON page_contents FOR ALL    USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ── 5. DATA AWAL web_settings ──────────────────────────────
INSERT INTO web_settings (key_name, value_text) VALUES
    ('app_name',            'Lapas Kelas III Saparua'),
    ('app_tagline',         'Kementerian Hukum dan HAM RI'),
    ('logo_url',            ''),
    ('hero_image_url',      ''),
    ('hero_description',    'Melayani dengan profesional, transparan, dan berkeadilan demi mewujudkan pemasyarakatan yang bermartabat.'),
    ('office_address',      'Jl. Pemasyarakatan No. 1, Saparua, Maluku Tengah'),
    ('office_phone',        ''),
    ('office_email',        ''),
    ('external_visit_link', '#'),
    ('socmed_instagram',    ''),
    ('socmed_facebook',     ''),
    ('socmed_youtube',      '')
ON CONFLICT (key_name) DO NOTHING;

-- ── 6. DATA AWAL page_contents (contoh) ────────────────────
INSERT INTO page_contents (page_name, body_text) VALUES
('visi-misi', '<h3>Visi</h3><p>Menjadi lembaga pemasyarakatan yang terpercaya, profesional, dan humanis dalam mewujudkan manusia mandiri dan bertanggung jawab.</p><h3>Misi</h3><ul><li>Melaksanakan pembinaan narapidana secara terencana dan terukur.</li><li>Memberikan pelayanan prima kepada masyarakat dan keluarga narapidana.</li><li>Membangun sumber daya manusia yang kompeten dan berintegritas.</li><li>Mewujudkan tata kelola pemerintahan yang bersih dan akuntabel.</li></ul>'),
('alur-kunjungan', '<h3>1. Daftar Online</h3><p>Kunjungi tautan pendaftaran kunjungan online. Isi formulir dengan data diri pengunjung dan narapidana yang akan dikunjungi.</p><h3>2. Verifikasi Data</h3><p>Petugas akan melakukan verifikasi data dan menjadwalkan kunjungan. Konfirmasi dikirim melalui sistem.</p><h3>3. Datang ke Lapas</h3><p>Datang sesuai jadwal yang ditetapkan. Bawa KTP asli dan bukti konfirmasi kunjungan.</p><h3>4. Pemeriksaan</h3><p>Pengunjung melewati pemeriksaan petugas, penitipan barang terlarang, dan verifikasi identitas.</p><h3>5. Kunjungan Berlangsung</h3><p>Kunjungan dilaksanakan sesuai aturan dan durasi yang ditetapkan oleh petugas.</p>'),
('alur-penitipan', '<h3>1. Persiapkan Barang</h3><p>Pastikan barang yang akan dititipkan sesuai dengan daftar yang diperbolehkan. Barang terlarang tidak akan diterima.</p><h3>2. Datang ke Loket</h3><p>Datang ke loket penitipan barang yang tersedia di area penerimaan. Bawa KTP asli.</p><h3>3. Pemeriksaan Barang</h3><p>Petugas akan memeriksa seluruh barang yang akan dititipkan untuk memastikan keamanan.</p><h3>4. Pengisian Formulir</h3><p>Isi formulir penitipan dengan data pengirim dan nama narapidana yang dituju.</p><h3>5. Terima Bukti Penitipan</h3><p>Pengirim menerima tanda terima sebagai bukti sah penitipan barang.</p>'),
('syarat-ketentuan', '<h3>Syarat Kunjungan</h3><ul><li>KTP/Identitas diri yang masih berlaku</li><li>Bukti konfirmasi kunjungan online</li><li>Berpakaian sopan dan rapi</li><li>Tidak dalam keadaan mabuk atau terpengaruh narkoba</li><li>Mematuhi seluruh peraturan yang berlaku di dalam lembaga</li></ul><h3>Barang yang Diperbolehkan</h3><ul><li>Pakaian bersih dalam jumlah wajar</li><li>Makanan/minuman dalam kemasan (tidak beralkohol)</li><li>Perlengkapan ibadah</li><li>Obat-obatan dengan resep dokter</li></ul><h3>Barang yang Dilarang</h3><ul><li>Narkotika dan zat terlarang</li><li>Senjata tajam atau senjata api</li><li>Perangkat komunikasi (HP, tablet)</li><li>Minuman beralkohol</li><li>Uang tunai dalam jumlah besar</li></ul>')
ON CONFLICT (page_name) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- SELESAI!
-- Langkah selanjutnya:
-- 1. Buka Supabase → Authentication → Users → Add User
--    Masukkan email dan password admin, centang "Auto Confirm"
-- 2. Edit assets/js/config.js — isi SUPABASE_URL dan SUPABASE_ANON_KEY
-- 3. Upload folder ke Cloudflare Pages
-- 4. Login di /admin/login.html
-- ════════════════════════════════════════════════════════════
