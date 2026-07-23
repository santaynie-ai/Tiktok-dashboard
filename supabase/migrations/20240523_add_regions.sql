-- Create provinces table
CREATE TABLE IF NOT EXISTS provinces (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    capital TEXT
);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    province_id INTEGER REFERENCES provinces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT -- 'Kabupaten' or 'Kota'
);

-- Insert Provinces
INSERT INTO provinces (id, name, capital) VALUES
(1, 'Aceh', 'Banda Aceh'),
(2, 'Sumatera Utara', 'Medan'),
(3, 'Sumatera Barat', 'Padang'),
(4, 'Riau', 'Pekanbaru'),
(5, 'Kepulauan Riau', 'Tanjungpinang'),
(6, 'Jambi', 'Jambi'),
(7, 'Bengkulu', 'Bengkulu'),
(8, 'Sumatera Selatan', 'Palembang'),
(9, 'Kepulauan Bangka Belitung', 'Pangkalpinang'),
(10, 'Lampung', 'Bandar Lampung'),
(11, 'DKI Jakarta', 'Jakarta'),
(12, 'Banten', 'Serang'),
(13, 'Jawa Barat', 'Bandung'),
(14, 'Jawa Tengah', 'Semarang'),
(15, 'DI Yogyakarta', 'Yogyakarta'),
(16, 'Jawa Timur', 'Surabaya'),
(17, 'Bali', 'Denpasar'),
(18, 'Nusa Tenggara Barat', 'Mataram'),
(19, 'Nusa Tenggara Timur', 'Kupang'),
(20, 'Kalimantan Barat', 'Pontianak'),
(21, 'Kalimantan Tengah', 'Palangkaraya'),
(22, 'Kalimantan Selatan', 'Banjarbaru'),
(23, 'Kalimantan Timur', 'Samarinda'),
(24, 'Kalimantan Utara', 'Tanjung Selor'),
(25, 'Sulawesi Utara', 'Manado'),
(26, 'Gorontalo', 'Gorontalo'),
(27, 'Sulawesi Tengah', 'Palu'),
(28, 'Sulawesi Barat', 'Mamuju'),
(29, 'Sulawesi Selatan', 'Makassar'),
(30, 'Sulawesi Tenggara', 'Kendari'),
(31, 'Maluku', 'Ambon'),
(32, 'Maluku Utara', 'Sofifi'),
(33, 'Papua', 'Jayapura'),
(34, 'Papua Barat', 'Manokwari'),
(35, 'Papua Selatan', 'Merauke'),
(36, 'Papua Tengah', 'Nabire'),
(37, 'Papua Pegunungan', 'Wamena'),
(38, 'Papua Barat Daya', 'Sorong')
ON CONFLICT (name) DO NOTHING;

-- Insert Cities (Sample/Initial set based on provided data)
-- Aceh
INSERT INTO cities (province_id, name, type) VALUES
(1, 'Aceh Barat', 'Kabupaten'), (1, 'Aceh Barat Daya', 'Kabupaten'), (1, 'Aceh Besar', 'Kabupaten'), (1, 'Aceh Jaya', 'Kabupaten'), (1, 'Aceh Selatan', 'Kabupaten'), (1, 'Aceh Singkil', 'Kabupaten'), (1, 'Aceh Tamiang', 'Kabupaten'), (1, 'Aceh Tengah', 'Kabupaten'), (1, 'Aceh Tenggara', 'Kabupaten'), (1, 'Aceh Timur', 'Kabupaten'), (1, 'Aceh Utara', 'Kabupaten'), (1, 'Bener Meriah', 'Kabupaten'), (1, 'Bireuen', 'Kabupaten'), (1, 'Gayo Lues', 'Kabupaten'), (1, 'Nagan Raya', 'Kabupaten'), (1, 'Pidie', 'Kabupaten'), (1, 'Pidie Jaya', 'Kabupaten'), (1, 'Simeulue', 'Kabupaten'),
(1, 'Banda Aceh', 'Kota'), (1, 'Langsa', 'Kota'), (1, 'Lhokseumawe', 'Kota'), (1, 'Sabang', 'Kota'), (1, 'Subulussalam', 'Kota');

-- Sumatera Utara
INSERT INTO cities (province_id, name, type) VALUES
(2, 'Asahan', 'Kabupaten'), (2, 'Batu Bara', 'Kabupaten'), (2, 'Dairi', 'Kabupaten'), (2, 'Deli Serdang', 'Kabupaten'), (2, 'Humbang Hasundutan', 'Kabupaten'), (2, 'Karo', 'Kabupaten'), (2, 'Labuhanbatu', 'Kabupaten'), (2, 'Labuhanbatu Selatan', 'Kabupaten'), (2, 'Labuhanbatu Utara', 'Kabupaten'), (2, 'Langkat', 'Kabupaten'), (2, 'Mandailing Natal', 'Kabupaten'), (2, 'Nias', 'Kabupaten'), (2, 'Nias Barat', 'Kabupaten'), (2, 'Nias Selatan', 'Kabupaten'), (2, 'Nias Utara', 'Kabupaten'), (2, 'Padang Lawas', 'Kabupaten'), (2, 'Padang Lawas Utara', 'Kabupaten'), (2, 'Pakpak Bharat', 'Kabupaten'), (2, 'Samosir', 'Kabupaten'), (2, 'Serdang Bedagai', 'Kabupaten'), (2, 'Simalungun', 'Kabupaten'), (2, 'Tapanuli Selatan', 'Kabupaten'), (2, 'Tapanuli Tengah', 'Kabupaten'), (2, 'Tapanuli Utara', 'Kabupaten'), (2, 'Toba', 'Kabupaten'),
(2, 'Binjai', 'Kota'), (2, 'Gunungsitoli', 'Kota'), (2, 'Medan', 'Kota'), (2, 'Padangsidimpuan', 'Kota'), (2, 'Pematangsiantar', 'Kota'), (2, 'Sibolga', 'Kota'), (2, 'Tanjungbalai', 'Kota'), (2, 'Tebing Tinggi', 'Kota');

-- Sumatera Barat
INSERT INTO cities (province_id, name, type) VALUES
(3, 'Agam', 'Kabupaten'), (3, 'Dharmasraya', 'Kabupaten'), (3, 'Kepulauan Mentawai', 'Kabupaten'), (3, 'Lima Puluh Kota', 'Kabupaten'), (3, 'Padang Pariaman', 'Kabupaten'), (3, 'Pasaman', 'Kabupaten'), (3, 'Pasaman Barat', 'Kabupaten'), (3, 'Pesisir Selatan', 'Kabupaten'), (3, 'Sijunjung', 'Kabupaten'), (3, 'Solok', 'Kabupaten'), (3, 'Solok Selatan', 'Kabupaten'), (3, 'Tanah Datar', 'Kabupaten'),
(3, 'Bukittinggi', 'Kota'), (3, 'Padang', 'Kota'), (3, 'Padang Panjang', 'Kota'), (3, 'Pariaman', 'Kota'), (3, 'Payakumbuh', 'Kota'), (3, 'Sawahlunto', 'Kota'), (3, 'Solok', 'Kota');

-- Riau
INSERT INTO cities (province_id, name, type) VALUES
(4, 'Bengkalis', 'Kabupaten'), (4, 'Indragiri Hilir', 'Kabupaten'), (4, 'Indragiri Hulu', 'Kabupaten'), (4, 'Kampar', 'Kabupaten'), (4, 'Kepulauan Meranti', 'Kabupaten'), (4, 'Kuantan Singingi', 'Kabupaten'), (4, 'Pelalawan', 'Kabupaten'), (4, 'Rokan Hilir', 'Kabupaten'), (4, 'Rokan Hulu', 'Kabupaten'), (4, 'Siak', 'Kabupaten'),
(4, 'Dumai', 'Kota'), (4, 'Pekanbaru', 'Kota');

-- Kepulauan Riau
INSERT INTO cities (province_id, name, type) VALUES
(5, 'Bintan', 'Kabupaten'), (5, 'Karimun', 'Kabupaten'), (5, 'Kepulauan Anambas', 'Kabupaten'), (5, 'Lingga', 'Kabupaten'), (5, 'Natuna', 'Kabupaten'),
(5, 'Batam', 'Kota'), (5, 'Tanjungpinang', 'Kota');

-- Jambi
INSERT INTO cities (province_id, name, type) VALUES
(6, 'Batanghari', 'Kabupaten'), (6, 'Bungo', 'Kabupaten'), (6, 'Kerinci', 'Kabupaten'), (6, 'Merangin', 'Kabupaten'), (6, 'Muaro Jambi', 'Kabupaten'), (6, 'Sarolangun', 'Kabupaten'), (6, 'Tanjung Jabung Barat', 'Kabupaten'), (6, 'Tanjung Jabung Timur', 'Kabupaten'), (6, 'Tebo', 'Kabupaten'),
(6, 'Jambi', 'Kota'), (6, 'Sungai Penuh', 'Kota');

-- Bengkulu
INSERT INTO cities (province_id, name, type) VALUES
(7, 'Bengkulu Selatan', 'Kabupaten'), (7, 'Bengkulu Tengah', 'Kabupaten'), (7, 'Bengkulu Utara', 'Kabupaten'), (7, 'Kaur', 'Kabupaten'), (7, 'Kepahiang', 'Kabupaten'), (7, 'Lebong', 'Kabupaten'), (7, 'Mukomuko', 'Kabupaten'), (7, 'Rejang Lebong', 'Kabupaten'), (7, 'Seluma', 'Kabupaten'),
(7, 'Bengkulu', 'Kota');

-- Sumatera Selatan
INSERT INTO cities (province_id, name, type) VALUES
(8, 'Banyuasin', 'Kabupaten'), (8, 'Empat Lawang', 'Kabupaten'), (8, 'Lahat', 'Kabupaten'), (8, 'Muara Enim', 'Kabupaten'), (8, 'Musi Banyuasin', 'Kabupaten'), (8, 'Musi Rawas', 'Kabupaten'), (8, 'Musi Rawas Utara', 'Kabupaten'), (8, 'Ogan Ilir', 'Kabupaten'), (8, 'Ogan Komering Ilir', 'Kabupaten'), (8, 'Ogan Komering Ulu', 'Kabupaten'), (8, 'Ogan Komering Ulu Selatan', 'Kabupaten'), (8, 'Ogan Komering Ulu Timur', 'Kabupaten'), (8, 'Penukal Abab Lematang Ilir', 'Kabupaten'),
(8, 'Lubuklinggau', 'Kota'), (8, 'Pagar Alam', 'Kota'), (8, 'Palembang', 'Kota'), (8, 'Prabumulih', 'Kota');

-- Kepulauan Bangka Belitung
INSERT INTO cities (province_id, name, type) VALUES
(9, 'Bangka', 'Kabupaten'), (9, 'Bangka Barat', 'Kabupaten'), (9, 'Bangka Selatan', 'Kabupaten'), (9, 'Bangka Tengah', 'Kabupaten'), (9, 'Belitung', 'Kabupaten'), (9, 'Belitung Timur', 'Kabupaten'),
(9, 'Pangkalpinang', 'Kota');

-- Lampung
INSERT INTO cities (province_id, name, type) VALUES
(10, 'Lampung Barat', 'Kabupaten'), (10, 'Lampung Selatan', 'Kabupaten'), (10, 'Lampung Tengah', 'Kabupaten'), (10, 'Lampung Timur', 'Kabupaten'), (10, 'Lampung Utara', 'Kabupaten'), (10, 'Mesuji', 'Kabupaten'), (10, 'Pesawaran', 'Kabupaten'), (10, 'Pesisir Barat', 'Kabupaten'), (10, 'Pringsewu', 'Kabupaten'), (10, 'Tanggamus', 'Kabupaten'), (10, 'Tulang Bawang', 'Kabupaten'), (10, 'Tulang Bawang Barat', 'Kabupaten'), (10, 'Way Kanan', 'Kabupaten'),
(10, 'Bandar Lampung', 'Kota'), (10, 'Metro', 'Kota');

-- DKI Jakarta
INSERT INTO cities (province_id, name, type) VALUES
(11, 'Kepulauan Seribu', 'Kabupaten'),
(11, 'Jakarta Barat', 'Kota'), (11, 'Jakarta Pusat', 'Kota'), (11, 'Jakarta Selatan', 'Kota'), (11, 'Jakarta Timur', 'Kota'), (11, 'Jakarta Utara', 'Kota');

-- Banten
INSERT INTO cities (province_id, name, type) VALUES
(12, 'Lebak', 'Kabupaten'), (12, 'Pandeglang', 'Kabupaten'), (12, 'Serang', 'Kabupaten'), (12, 'Tangerang', 'Kabupaten'),
(12, 'Cilegon', 'Kota'), (12, 'Serang', 'Kota'), (12, 'Tangerang', 'Kota'), (12, 'Tangerang Selatan', 'Kota');

-- Jawa Barat
INSERT INTO cities (province_id, name, type) VALUES
(13, 'Bandung', 'Kabupaten'), (13, 'Bandung Barat', 'Kabupaten'), (13, 'Bekasi', 'Kabupaten'), (13, 'Bogor', 'Kabupaten'), (13, 'Ciamis', 'Kabupaten'), (13, 'Cianjur', 'Kabupaten'), (13, 'Cirebon', 'Kabupaten'), (13, 'Garut', 'Kabupaten'), (13, 'Indramayu', 'Kabupaten'), (13, 'Karawang', 'Kabupaten'), (13, 'Kuningan', 'Kabupaten'), (13, 'Majalengka', 'Kabupaten'), (13, 'Pangandaran', 'Kabupaten'), (13, 'Purwakarta', 'Kabupaten'), (13, 'Subang', 'Kabupaten'), (13, 'Sukabumi', 'Kabupaten'), (13, 'Sumedang', 'Kabupaten'), (13, 'Tasikmalaya', 'Kabupaten'),
(13, 'Bandung', 'Kota'), (13, 'Banjar', 'Kota'), (13, 'Bekasi', 'Kota'), (13, 'Bogor', 'Kota'), (13, 'Cimahi', 'Kota'), (13, 'Cirebon', 'Kota'), (13, 'Depok', 'Kota'), (13, 'Sukabumi', 'Kota'), (13, 'Tasikmalaya', 'Kota');

-- Jawa Tengah
INSERT INTO cities (province_id, name, type) VALUES
(14, 'Banjarnegara', 'Kabupaten'), (14, 'Banyumas', 'Kabupaten'), (14, 'Batang', 'Kabupaten'), (14, 'Blora', 'Kabupaten'), (14, 'Boyolali', 'Kabupaten'), (14, 'Brebes', 'Kabupaten'), (14, 'Cilacap', 'Kabupaten'), (14, 'Demak', 'Kabupaten'), (14, 'Grobogan', 'Kabupaten'), (14, 'Jepara', 'Kabupaten'), (14, 'Karanganyar', 'Kabupaten'), (14, 'Kebumen', 'Kabupaten'), (14, 'Kendal', 'Kabupaten'), (14, 'Klaten', 'Kabupaten'), (14, 'Kudus', 'Kabupaten'), (14, 'Magelang', 'Kabupaten'), (14, 'Pati', 'Kabupaten'), (14, 'Pekalongan', 'Kabupaten'), (14, 'Pemalang', 'Kabupaten'), (14, 'Purbalingga', 'Kabupaten'), (14, 'Purworejo', 'Kabupaten'), (14, 'Rembang', 'Kabupaten'), (14, 'Semarang', 'Kabupaten'), (14, 'Sragen', 'Kabupaten'), (14, 'Sukoharjo', 'Kabupaten'), (14, 'Tegal', 'Kabupaten'), (14, 'Temanggung', 'Kabupaten'), (14, 'Wonogiri', 'Kabupaten'), (14, 'Wonosobo', 'Kabupaten'),
(14, 'Magelang', 'Kota'), (14, 'Pekalongan', 'Kota'), (14, 'Salatiga', 'Kota'), (14, 'Semarang', 'Kota'), (14, 'Surakarta', 'Kota'), (14, 'Tegal', 'Kota');

-- DI Yogyakarta
INSERT INTO cities (province_id, name, type) VALUES
(15, 'Bantul', 'Kabupaten'), (15, 'Gunungkidul', 'Kabupaten'), (15, 'Kulon Progo', 'Kabupaten'), (15, 'Sleman', 'Kabupaten'),
(15, 'Yogyakarta', 'Kota');

-- Jawa Timur
INSERT INTO cities (province_id, name, type) VALUES
(16, 'Bangkalan', 'Kabupaten'), (16, 'Banyuwangi', 'Kabupaten'), (16, 'Blitar', 'Kabupaten'), (16, 'Bojonegoro', 'Kabupaten'), (16, 'Bondowoso', 'Kabupaten'), (16, 'Gresik', 'Kabupaten'), (16, 'Jember', 'Kabupaten'), (16, 'Jombang', 'Kabupaten'), (16, 'Kediri', 'Kabupaten'), (16, 'Lamongan', 'Kabupaten'), (16, 'Lumajang', 'Kabupaten'), (16, 'Madiun', 'Kabupaten'), (16, 'Magetan', 'Kabupaten'), (16, 'Malang', 'Kabupaten'), (16, 'Mojokerto', 'Kabupaten'), (16, 'Nganjuk', 'Kabupaten'), (16, 'Ngawi', 'Kabupaten'), (16, 'Pacitan', 'Kabupaten'), (16, 'Pamekasan', 'Kabupaten'), (16, 'Pasuruan', 'Kabupaten'), (16, 'Ponorogo', 'Kabupaten'), (16, 'Probolinggo', 'Kabupaten'), (16, 'Sampang', 'Kabupaten'), (16, 'Sidoarjo', 'Kabupaten'), (16, 'Situbondo', 'Kabupaten'), (16, 'Sumenep', 'Kabupaten'), (16, 'Trenggalek', 'Kabupaten'), (16, 'Tuban', 'Kabupaten'), (16, 'Tulungagung', 'Kabupaten'),
(16, 'Batu', 'Kota'), (16, 'Blitar', 'Kota'), (16, 'Kediri', 'Kota'), (16, 'Madiun', 'Kota'), (16, 'Malang', 'Kota'), (16, 'Mojokerto', 'Kota'), (16, 'Pasuruan', 'Kota'), (16, 'Probolinggo', 'Kota'), (16, 'Surabaya', 'Kota');

-- Bali
INSERT INTO cities (province_id, name, type) VALUES
(17, 'Badung', 'Kabupaten'), (17, 'Bangli', 'Kabupaten'), (17, 'Buleleng', 'Kabupaten'), (17, 'Gianyar', 'Kabupaten'), (17, 'Jembrana', 'Kabupaten'), (17, 'Karangasem', 'Kabupaten'), (17, 'Klungkung', 'Kabupaten'), (17, 'Tabanan', 'Kabupaten'),
(17, 'Denpasar', 'Kota');

-- NTB
INSERT INTO cities (province_id, name, type) VALUES
(18, 'Bima', 'Kabupaten'), (18, 'Dompu', 'Kabupaten'), (18, 'Lombok Barat', 'Kabupaten'), (18, 'Lombok Tengah', 'Kabupaten'), (18, 'Lombok Timur', 'Kabupaten'), (18, 'Lombok Utara', 'Kabupaten'), (18, 'Sumbawa', 'Kabupaten'), (18, 'Sumbawa Barat', 'Kabupaten'),
(18, 'Bima', 'Kota'), (18, 'Mataram', 'Kota');

-- NTT
INSERT INTO cities (province_id, name, type) VALUES
(19, 'Alor', 'Kabupaten'), (19, 'Belu', 'Kabupaten'), (19, 'Ende', 'Kabupaten'), (19, 'Flores Timur', 'Kabupaten'), (19, 'Kupang', 'Kabupaten'), (19, 'Lembata', 'Kabupaten'), (19, 'Malaka', 'Kabupaten'), (19, 'Manggarai', 'Kabupaten'), (19, 'Manggarai Barat', 'Kabupaten'), (19, 'Manggarai Timur', 'Kabupaten'), (19, 'Nagekeo', 'Kabupaten'), (19, 'Ngada', 'Kabupaten'), (19, 'Rote Ndao', 'Kabupaten'), (19, 'Sabu Raijua', 'Kabupaten'), (19, 'Sikka', 'Kabupaten'), (19, 'Sumba Barat', 'Kabupaten'), (19, 'Sumba Barat Daya', 'Kabupaten'), (19, 'Sumba Tengah', 'Kabupaten'), (19, 'Sumba Timur', 'Kabupaten'), (19, 'Timor Tengah Selatan', 'Kabupaten'), (19, 'Timor Tengah Utara', 'Kabupaten'),
(19, 'Kupang', 'Kota');

-- Kalimantan Barat
INSERT INTO cities (province_id, name, type) VALUES
(20, 'Bengkayang', 'Kabupaten'), (20, 'Kapuas Hulu', 'Kabupaten'), (20, 'Kayong Utara', 'Kabupaten'), (20, 'Ketapang', 'Kabupaten'), (20, 'Kubu Raya', 'Kabupaten'), (20, 'Landak', 'Kabupaten'), (20, 'Melawi', 'Kabupaten'), (20, 'Mempawah', 'Kabupaten'), (20, 'Sambas', 'Kabupaten'), (20, 'Sanggau', 'Kabupaten'), (20, 'Sekadau', 'Kabupaten'), (20, 'Sintang', 'Kabupaten'),
(20, 'Pontianak', 'Kota'), (20, 'Singkawang', 'Kota');

-- Kalimantan Tengah
INSERT INTO cities (province_id, name, type) VALUES
(21, 'Barito Selatan', 'Kabupaten'), (21, 'Barito Timur', 'Kabupaten'), (21, 'Barito Utara', 'Kabupaten'), (21, 'Gunung Mas', 'Kabupaten'), (21, 'Kapuas', 'Kabupaten'), (21, 'Katingan', 'Kabupaten'), (21, 'Kotawaringin Barat', 'Kabupaten'), (21, 'Kotawaringin Timur', 'Kabupaten'), (21, 'Lamandau', 'Kabupaten'), (21, 'Murung Raya', 'Kabupaten'), (21, 'Pulang Pisau', 'Kabupaten'), (21, 'Sukamara', 'Kabupaten'), (21, 'Seruyan', 'Kabupaten'),
(21, 'Palangka Raya', 'Kota');

-- Kalimantan Selatan
INSERT INTO cities (province_id, name, type) VALUES
(22, 'Balangan', 'Kabupaten'), (22, 'Banjar', 'Kabupaten'), (22, 'Barito Kuala', 'Kabupaten'), (22, 'Hulu Sungai Selatan', 'Kabupaten'), (22, 'Hulu Sungai Tengah', 'Kabupaten'), (22, 'Hulu Sungai Utara', 'Kabupaten'), (22, 'Kotabaru', 'Kabupaten'), (22, 'Tabalong', 'Kabupaten'), (22, 'Tanah Bumbu', 'Kabupaten'), (22, 'Tanah Laut', 'Kabupaten'), (22, 'Tapin', 'Kabupaten'),
(22, 'Banjarbaru', 'Kota'), (22, 'Banjarmasin', 'Kota');

-- Kalimantan Timur
INSERT INTO cities (province_id, name, type) VALUES
(23, 'Berau', 'Kabupaten'), (23, 'Kutai Barat', 'Kabupaten'), (23, 'Kutai Kartanegara', 'Kabupaten'), (23, 'Kutai Timur', 'Kabupaten'), (23, 'Mahakam Ulu', 'Kabupaten'), (23, 'Paser', 'Kabupaten'), (23, 'Penajam Paser Utara', 'Kabupaten'),
(23, 'Balikpapan', 'Kota'), (23, 'Bontang', 'Kota'), (23, 'Samarinda', 'Kota');

-- Kalimantan Utara
INSERT INTO cities (province_id, name, type) VALUES
(24, 'Bulungan', 'Kabupaten'), (24, 'Malinau', 'Kabupaten'), (24, 'Nunukan', 'Kabupaten'), (24, 'Tana Tidung', 'Kabupaten'),
(24, 'Tarakan', 'Kota');

-- Sulawesi Utara
INSERT INTO cities (province_id, name, type) VALUES
(25, 'Bolaang Mongondow', 'Kabupaten'), (25, 'Bolaang Mongondow Selatan', 'Kabupaten'), (25, 'Bolaang Mongondow Timur', 'Kabupaten'), (25, 'Bolaang Mongondow Utara', 'Kabupaten'), (25, 'Kepulauan Sangihe', 'Kabupaten'), (25, 'Kepulauan Siau Tagulandang Biaro', 'Kabupaten'), (25, 'Kepulauan Talaud', 'Kabupaten'), (25, 'Minahasa', 'Kabupaten'), (25, 'Minahasa Selatan', 'Kabupaten'), (25, 'Minahasa Tenggara', 'Kabupaten'), (25, 'Minahasa Utara', 'Kabupaten'),
(25, 'Bitung', 'Kota'), (25, 'Kotamobagu', 'Kota'), (25, 'Manado', 'Kota'), (25, 'Tomohon', 'Kota');

-- Gorontalo
INSERT INTO cities (province_id, name, type) VALUES
(26, 'Boalemo', 'Kabupaten'), (26, 'Bone Bolango', 'Kabupaten'), (26, 'Gorontalo', 'Kabupaten'), (26, 'Gorontalo Utara', 'Kabupaten'), (26, 'Pohuwato', 'Kabupaten'),
(26, 'Gorontalo', 'Kota');

-- Sulawesi Tengah
INSERT INTO cities (province_id, name, type) VALUES
(27, 'Banggai', 'Kabupaten'), (27, 'Banggai Kepulauan', 'Kabupaten'), (27, 'Banggai Laut', 'Kabupaten'), (27, 'Buol', 'Kabupaten'), (27, 'Donggala', 'Kabupaten'), (27, 'Morowali', 'Kabupaten'), (27, 'Morowali Utara', 'Kabupaten'), (27, 'Parigi Moutong', 'Kabupaten'), (27, 'Poso', 'Kabupaten'), (27, 'Tojo Una-Una', 'Kabupaten'), (27, 'Toli-Toli', 'Kabupaten'), (27, 'Sigi', 'Kabupaten'),
(27, 'Palu', 'Kota');

-- Sulawesi Barat
INSERT INTO cities (province_id, name, type) VALUES
(28, 'Majene', 'Kabupaten'), (28, 'Mamasa', 'Kabupaten'), (28, 'Mamuju', 'Kabupaten'), (28, 'Mamuju Tengah', 'Kabupaten'), (28, 'Mamuju Utara', 'Kabupaten'), (28, 'Polewali Mandar', 'Kabupaten');

-- Sulawesi Selatan
INSERT INTO cities (province_id, name, type) VALUES
(29, 'Bantaeng', 'Kabupaten'), (29, 'Barru', 'Kabupaten'), (29, 'Bone', 'Kabupaten'), (29, 'Bulukumba', 'Kabupaten'), (29, 'Enrekang', 'Kabupaten'), (29, 'Gowa', 'Kabupaten'), (29, 'Jeneponto', 'Kabupaten'), (29, 'Kepulauan Selayar', 'Kabupaten'), (29, 'Luwu', 'Kabupaten'), (29, 'Luwu Timur', 'Kabupaten'), (29, 'Luwu Utara', 'Kabupaten'), (29, 'Maros', 'Kabupaten'), (29, 'Pangkajene dan Kepulauan', 'Kabupaten'), (29, 'Pinrang', 'Kabupaten'), (29, 'Sidenreng Rappang', 'Kabupaten'), (29, 'Sinjai', 'Kabupaten'), (29, 'Soppeng', 'Kabupaten'), (29, 'Takalar', 'Kabupaten'), (29, 'Tana Toraja', 'Kabupaten'), (29, 'Toraja Utara', 'Kabupaten'), (29, 'Wajo', 'Kabupaten'),
(29, 'Makassar', 'Kota'), (29, 'Palopo', 'Kota'), (29, 'Parepare', 'Kota');

-- Sulawesi Tenggara
INSERT INTO cities (province_id, name, type) VALUES
(30, 'Bombana', 'Kabupaten'), (30, 'Buton', 'Kabupaten'), (30, 'Buton Selatan', 'Kabupaten'), (30, 'Buton Tengah', 'Kabupaten'), (30, 'Buton Utara', 'Kabupaten'), (30, 'Kolaka', 'Kabupaten'), (30, 'Kolaka Timur', 'Kabupaten'), (30, 'Kolaka Utara', 'Kabupaten'), (30, 'Konawe', 'Kabupaten'), (30, 'Konawe Kepulauan', 'Kabupaten'), (30, 'Konawe Selatan', 'Kabupaten'), (30, 'Konawe Utara', 'Kabupaten'), (30, 'Muna', 'Kabupaten'), (30, 'Muna Barat', 'Kabupaten'), (30, 'Wakatobi', 'Kabupaten'),
(30, 'Bau-Bau', 'Kota'), (30, 'Kendari', 'Kota');

-- Maluku
INSERT INTO cities (province_id, name, type) VALUES
(31, 'Buru', 'Kabupaten'), (31, 'Buru Selatan', 'Kabupaten'), (31, 'Kepulauan Aru', 'Kabupaten'), (31, 'Kepulauan Tanimbar', 'Kabupaten'), (31, 'Maluku Barat Daya', 'Kabupaten'), (31, 'Maluku Tengah', 'Kabupaten'), (31, 'Maluku Tenggara', 'Kabupaten'), (31, 'Seram Bagian Barat', 'Kabupaten'), (31, 'Seram Bagian Timur', 'Kabupaten'),
(31, 'Ambon', 'Kota'), (31, 'Tual', 'Kota');

-- Maluku Utara
INSERT INTO cities (province_id, name, type) VALUES
(32, 'Halmahera Barat', 'Kabupaten'), (32, 'Halmahera Tengah', 'Kabupaten'), (32, 'Halmahera Timur', 'Kabupaten'), (32, 'Halmahera Selatan', 'Kabupaten'), (32, 'Halmahera Utara', 'Kabupaten'), (32, 'Kepulauan Sula', 'Kabupaten'), (32, 'Pulau Morotai', 'Kabupaten'), (32, 'Pulau Taliabu', 'Kabupaten'),
(32, 'Ternate', 'Kota'), (32, 'Tidore Kepulauan', 'Kota');

-- Papua
INSERT INTO cities (province_id, name, type) VALUES
(33, 'Biak Numfor', 'Kabupaten'), (33, 'Jayapura', 'Kabupaten'), (33, 'Keerom', 'Kabupaten'), (33, 'Kepulauan Yapen', 'Kabupaten'), (33, 'Mamberamo Raya', 'Kabupaten'), (33, 'Sarmi', 'Kabupaten'), (33, 'Supiori', 'Kabupaten'), (33, 'Waropen', 'Kabupaten'),
(33, 'Jayapura', 'Kota');

-- Papua Barat
INSERT INTO cities (province_id, name, type) VALUES
(34, 'Fakfak', 'Kabupaten'), (34, 'Kaimana', 'Kabupaten'), (34, 'Manokwari', 'Kabupaten'), (34, 'Manokwari Selatan', 'Kabupaten'), (34, 'Pegunungan Arfak', 'Kabupaten'), (34, 'Teluk Bintuni', 'Kabupaten'), (34, 'Teluk Wondama', 'Kabupaten');

-- Papua Selatan
INSERT INTO cities (province_id, name, type) VALUES
(35, 'Asmat', 'Kabupaten'), (35, 'Boven Digoel', 'Kabupaten'), (35, 'Mappi', 'Kabupaten'), (35, 'Merauke', 'Kabupaten');

-- Papua Tengah
INSERT INTO cities (province_id, name, type) VALUES
(36, 'Deiyai', 'Kabupaten'), (36, 'Dogiyai', 'Kabupaten'), (36, 'Intan Jaya', 'Kabupaten'), (36, 'Mimika', 'Kabupaten'), (36, 'Nabire', 'Kabupaten'), (36, 'Paniai', 'Kabupaten'), (36, 'Puncak', 'Kabupaten'), (36, 'Puncak Jaya', 'Kabupaten');

-- Papua Pegunungan
INSERT INTO cities (province_id, name, type) VALUES
(37, 'Jayawijaya', 'Kabupaten'), (37, 'Lanny Jaya', 'Kabupaten'), (37, 'Mamberamo Tengah', 'Kabupaten'), (37, 'Nduga', 'Kabupaten'), (37, 'Pegunungan Bintang', 'Kabupaten'), (37, 'Yalimo', 'Kabupaten'), (37, 'Yahukimo', 'Kabupaten'), (37, 'Tolikara', 'Kabupaten');

-- Papua Barat Daya
INSERT INTO cities (province_id, name, type) VALUES
(38, 'Maybrat', 'Kabupaten'), (38, 'Raja Ampat', 'Kabupaten'), (38, 'Sorong', 'Kabupaten'), (38, 'Sorong Selatan', 'Kabupaten'), (38, 'Tambrauw', 'Kabupaten'),
(38, 'Sorong', 'Kota');
