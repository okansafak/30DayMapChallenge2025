# 30 Day Map Challenge 2025

Bu repository, [#30DayMapChallenge](https://30daymapchallenge.com/) 2025 için hazırlanmış harita projelerini içermektedir.

## 🗓️ Projeler

### Day 1: Points
İlk gün teması ile hazırlanan nokta haritası.
- 📁 Dosya: `maps/day01.html`

### Day 2: Lines
Çizgi verilerinin görselleştirildiği harita.
- 📁 Dosya: `maps/day02.html`

### Day 3: Polygons
Poligon verilerinin kullanıldığı harita.
- 📁 Dosya: `maps/day03.html`

### Day 5: Raster
Raster veri görselleştirmesi.
- 📁 Dosya: `maps/day05.html`

### Day 6: Dimensions ⭐
**İstanbul Raylı Sistem - 24 Saatlik Spacetime Animasyonu**

İstanbul'un metro, tramvay ve banliyö tren sistemlerinin günlük hareketlerini gösteren interaktif 3D+zaman animasyon haritası.

- 📁 Dosya: `maps/day06.html`
- 🔧 Veri İşleme: `prepare_metro_from_gtfs.js`

#### Özellikler
- ✅ **10,902 gerçek sefer** verisi
- ✅ **23 farklı hat** (Metro M1-M9, Tramvay T1-T4, Füniküler F1-F3, TF1-TF2, Marmaray)
- ✅ **24 saat animasyon** (00:00 - 24:00)
- ✅ **Gerçek güzergah geometrileri** (GTFS shapes.csv)
- ✅ **Dinamik istatistikler**: Aktif sefer sayısı, kategori bazlı dağılım
- ✅ **İnteraktif kontroller**: Zaman kaydırma, hız ayarlama (0.5x - 16x)
- ✅ **Renkli legend**: Her hat için özel renk paleti

#### Veri Kaynağı
[İBB Açık Veri Portalı](https://data.ibb.gov.tr) - GTFS (General Transit Feed Specification) formatında toplu taşıma verileri

#### Teknik Detaylar
- **MapLibre GL JS** v3.6.2
- **GTFS Veri İşleme**: Node.js ile CSV parse ve GeoJSON dönüşümü
- **Spacetime Cube**: Koordinatlar [lon, lat, seconds_since_midnight] formatında
- **Animasyon**: Gerçek zamanlı interpolasyon ile araç pozisyonu hesaplama

#### Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# GTFS verilerinden spacetime cube oluştur
node prepare_metro_from_gtfs.js

# Haritayı tarayıcıda aç
# maps/day06.html dosyasını bir web tarayıcısında açın
```

**Not:** `spacetime_cube_data.geojson` dosyası (~207MB) GitHub'da bulunmamaktadır. Lokal olarak `prepare_metro_from_gtfs.js` scripti çalıştırılarak oluşturulmalıdır.

---

### Day 7: Network 🕷️
**İETT Spider Map - İnteraktif Durak Ağı**

- 📁 Dosya: `maps/day07.html`
- 🔧 Veri İşleme: `prepare_iett_stops.js`

#### Özellikler
- ✅ **14,840 İETT otobüs durağı** (metro, marmaray ve diğer raylı sistem durakları hariç)
- ✅ **Mouse konumuna göre dinamik spider web**: Harita üzerinde gezinirken en yakın duraklara çizgiler çizilir
- ✅ **Mesafe bazlı renklendirme**: 
  - Yeşil (0-500m) → Turuncu (500m-1km) → Kırmızı (1-2km) → Koyu Kırmızı (3km+)
- ✅ **Ayarlanabilir parametreler**:
  - Maksimum mesafe (500m - 5km)
  - Maksimum bağlantı sayısı (10-200 durak)
- ✅ **Canlı istatistikler**: Aktif bağlantı ve en yakın durak mesafesi
- ✅ **İnteraktif popup'lar**: Durak ID ve kodları
- ✅ **Carto Light basemap**: Durakların net görünmesi için açık renkli altlık harita

#### Veri Kaynağı
[Ulaşım Veri Portalı - İETT GTFS](https://ulasav.csb.gov.tr/dataset/34-iett-gtfs-verisi) - stops_iett.csv

#### Teknik Detaylar
- **MapLibre GL JS** v3.6.2
- **Haversine Formula**: Gerçek coğrafi mesafe hesaplama
- **Real-time Line Generation**: Mouse hareketine göre anlık çizgi oluşturma
- **Distance-based Styling**: Mesafeye göre renk, kalınlık ve opacity

#### Kurulum ve Çalıştırma

```bash
# İETT durakları verisini hazırla
node prepare_iett_stops.js

# Haritayı tarayıcıda aç
# maps/day07.html dosyasını bir web tarayıcısında açın
```

**Not:** `iett_stops.geojson` dosyası GitHub'da bulunmamaktadır. Lokal olarak `prepare_iett_stops.js` scripti çalıştırılarak oluşturulmalıdır.

---

### Day 8: Urban 🏙️
**Kocaeli Acil Toplanma Alanları - Voronoi Analizi**

İstanbul'un komşu ili Kocaeli'deki 338 acil toplanma alanının hizmet alanlarını Voronoi diyagramı ile görselleştiren interaktif harita.

- 📁 Dosya: `maps/day08.html`
- 📊 Veri: `data/toplanma alani kocaeli/acil-toplanma-alanlar.json`

#### Özellikler
- ✅ **338 acil toplanma alanı** koordinat ve detay bilgileri
- ✅ **Voronoi diyagramı**: Her bölge en yakın toplanma alanını gösterir
- ✅ **Alan büyüklüğü analizi**: Her Voronoi hücresinin km² cinsinden alanı
- ✅ **Renk kodlaması**:
  - 🟢 Yeşil (0-2 km²): Kolay erişim, yoğun servis
  - 🟡 Sarı (2-10 km²): Orta seviye erişim
  - 🔴 Kırmızı (10+ km²): Geniş alan, ek toplanma noktası gerekebilir
- ✅ **İnteraktif popup'lar**: Toplanma alanı adı, adresi, telefon ve servis alanı bilgisi

#### Veri Kaynağı
[Ulaşım Veri Portalı - Kocaeli Acil Toplanma Alanları](https://ulasav.csb.gov.tr/dataset/41-acil-toplanma-alanlari)

#### Teknik Detaylar
- **MapLibre GL JS** v3.6.2
- **Turf.js** v6: Voronoi diyagramı ve alan hesaplama
- **turf.voronoi()**: Delaunay triangulation tabanlı Voronoi oluşturma
- **turf.area()**: m² cinsinden alan hesaplama ve km²'ye dönüştürme
- **Interpolated Color Gradient**: Alan büyüklüğüne göre 6 kademeli renklendirme

#### Kentsel Planlama Çıkarımları
- Kırmızı bölgeler: Ek toplanma alanı ihtiyacı olabilir
- Yeşil bölgeler: Yeterli yoğunlukta servis alanı
- Voronoi hücre boyutu: Afet anında erişim mesafesinin göstergesi

---

### Day 10: Air 🌬️
**İstanbul Hava Kalitesi Monitörü - Gerçek Zamanlı Kirlilik Haritası**

Gerçek zamanlı hava kalitesi verilerini görselleştiren, interaktif hava durumu ve kirlilik monitörü.

- 📁 Dosya: `maps/day10.html`

#### Özellikler
- ✅ **Gerçek zamanlı veri**: Open-Meteo API'den anlık hava durumu ve hava kalitesi
- ✅ **Hava kalitesi parametreleri**:
  - PM2.5: 2.5 mikrondan küçük partiküller
  - PM10: 10 mikrondan küçük partiküller
  - NO₂: Nitrojen dioksit
  - O₃: Ozon
- ✅ **AQI hesaplama**: Air Quality Index (Hava Kalitesi İndeksi)
- ✅ **İnteraktif harita**: Haritaya tıklayarak herhangi bir noktanın hava kalitesini öğrenin
- ✅ **Dinamik görselleştirme**:
  - Renkli circle layer: AQI değerine göre yeşil/sarı/kırmızı/mor
  - Dinamik yarıçap: Kötü hava daha geniş alanı temsil eder
- ✅ **24 saatlik PM2.5 grafiği**: Eksenleri, değerleri ve zaman etiketleriyle detaylı trend
- ✅ **Konum desteği**: Gelişmiş hata yönetimi ile GPS tabanlı konum bulma
- ✅ **Hava durumu verileri**: Sıcaklık, nem, rüzgar hızı ve yönü

#### Veri Kaynağı
- [Open-Meteo Weather API](https://open-meteo.com/en/docs)
- [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)

#### Teknik Detaylar
- **Leaflet.js** v1.9.4: Basit ve güçlü harita kütüphanesi
- **CartoDB Dark Matter**: Dark tema altlık harita
- **Canvas API**: Özel grafik çizimi (y ekseni, değerler, zaman etiketleri)
- **Geolocation API**: GPS tabanlı konum bulma
- **Responsive Design**: Mobil ve masaüstü uyumlu grid layout

#### AQI Renk Skalası
- 🟢 **İyi (0-50)**: Hava kalitesi tatmin edici
- 🟡 **Orta (51-100)**: Hassas gruplar için kabul edilebilir
- 🔴 **Kötü (101-150)**: Hassas gruplar etkilenir
- 🟣 **Çok Kötü (150+)**: Herkes için sağlıksız

---

### Day 11: Minimal Map ⬜
**İstanbul Boğazı - Negatif Alan Yöntemi**

Siyah-beyaz kontrast ile İstanbul Boğazı'nın en minimalist haritası. Sadece kara parçaları ve boşluk - başka hiçbir şey yok.

- 📁 Dosya: `maps/day11.html`
- 📊 Veri: `data/ilceler.geojson`

#### Özellikler
- ✅ **Negatif alan tekniği**: Beyaz arka plan = Deniz, Siyah poligon = Kara
- ✅ **Tam minimalizm**: Sadece iki renk, hiçbir etiket, tamamen statik
- ✅ **Boğaz odaklı**: Zoom 10, merkez Boğaz üzerinde
- ✅ **Kaligrafik estetik**: "Boğaz'ın Kaligrafisi" - zarif tipografi
- ✅ **İnteraktivite yok**: Harita tamamen statik, sanat eseri gibi
- ✅ **Saf geometri**: Sadece kara parçalarının silueti

#### Tasarım Felsefesi
> "Minimalizmin gücü: Az çok demektir. Siyah-beyaz kontrast ile İstanbul Boğazı'nın en saf hali. Sadece kara parçaları ve boşluk - başka hiçbir şey yok."

#### Teknik Detaylar
- **MapLibre GL JS** v3.6.2
- **Negatif Alan Yöntemi**: Kıyıları çizmek yerine, kara parçalarını doldurarak denizi ortaya çıkarma
- **Static Map**: `interactive: false` - Zoom, pan, rotation devre dışı
- **Monochrome**: Sadece #000000 (siyah) ve #ffffff (beyaz)
- **Typography**: 2rem font-weight 300 ile zarif İstanbul imzası

#### Görsel Kompozisyon
- Sol üst: Minimal info card (GÜN 11, açıklama)
- Sağ alt: Siyah kutu içinde beyaz "İstanbul" yazısı ve "Boğaz'ın Kaligrafisi" alt yazısı
- Merkez: Boğaz'ın siyah-beyaz silueti

---

## 📊 Veri Setleri

```
data/
├── ilceler.geojson           # İlçe sınırları
├── tarihi_noktalar.geojson   # Tarihi noktalar
├── vapur.geojson             # Vapur hatları
├── ist_gtfs/                 # İBB GTFS verileri
│   ├── agency.csv
│   ├── calendar.csv
│   ├── routes.csv
│   ├── shapes.csv
│   ├── stop_times.csv
│   ├── stops.csv
│   └── trips.csv
├── toplanma alani kocaeli/   # Kocaeli acil toplanma alanları
│   └── acil-toplanma-alanlar.json
├── population/               # Türkiye nüfus verileri
│   ├── gadm41_TUR_1.json
│   ├── illere ve cinsiyete gore yabanci nufus.xls
│   └── turkey_foreign_population_2023.geojson
└── openflights/
    └── routes_processed.geojson
```

## 🛠️ Teknolojiler

- **MapLibre GL JS** v3.6.2 - İnteraktif WebGL tabanlı harita görselleştirme
- **Leaflet.js** v1.9.4 - Hafif ve esnek harita kütüphanesi
- **Turf.js** v6 - İstemci tarafı coğrafi analiz (Voronoi, alan hesaplama)
- **Node.js** - Veri işleme ve dönüşüm
- **GTFS** - Toplu taşıma veri standardı (General Transit Feed Specification)
- **GeoJSON** - Coğrafi veri formatı
- **Canvas API** - Özel grafik ve görselleştirmeler
- **Geolocation API** - Tarayıcı tabanlı konum servisleri

## 📝 Lisans

Bu proje #30DayMapChallenge kapsamında eğitim amaçlı hazırlanmıştır.

## 🔗 Bağlantılar

**Etkinlik & Topluluk**
- [30 Day Map Challenge](https://30daymapchallenge.com/)
- [#opengisturkiye](https://twitter.com/hashtag/opengisturkiye)

**Veri Kaynakları**
- [İBB Açık Veri Portalı](https://data.ibb.gov.tr)
- [Ulaşım Veri Portalı](https://ulasav.csb.gov.tr)
- [Open-Meteo API](https://open-meteo.com)

**Teknoloji & Dokümantasyon**
- [MapLibre GL JS](https://maplibre.org/)
- [Leaflet.js](https://leafletjs.com/)
- [Turf.js](https://turfjs.org/)
- [GTFS Specification](https://gtfs.org/)

---

**Yazar:** Okan Şafak  
**GitHub:** [@okansafak](https://github.com/okansafak)
