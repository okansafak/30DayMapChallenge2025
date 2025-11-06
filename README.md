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
**İstanbul Rail Sistemi - 24 Saatlik Animasyon**

İstanbul'un metro, tramvay ve banliyö tren sistemlerinin günlük hareketlerini gösteren interaktif animasyon haritası.

### Day 7: Network 🕷️
**İETT Spider Map - İnteraktif Durak Ağı**

İstanbul'daki 14,840 İETT otobüs durağı arasındaki bağlantı ağını mouse konumuna göre dinamik olarak görselleştiren spider map.

- 📁 Dosya: `maps/day07.html`
- 🔧 Veri İşleme: `prepare_iett_stops.js`

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

### Day 7 - Detaylı Bilgi

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
└── openflights/
    └── routes_processed.geojson
```

## 🛠️ Teknolojiler

- **MapLibre GL JS** - İnteraktif harita görselleştirme
- **Node.js** - Veri işleme ve dönüşüm
- **GTFS** - Toplu taşıma veri standardı
- **GeoJSON** - Coğrafi veri formatı

## 📝 Lisans

Bu proje #30DayMapChallenge kapsamında eğitim amaçlı hazırlanmıştır.

## 🔗 Bağlantılar

- [30 Day Map Challenge](https://30daymapchallenge.com/)
- [İBB Açık Veri Portalı](https://data.ibb.gov.tr)
- [MapLibre GL JS](https://maplibre.org/)
- [GTFS Specification](https://gtfs.org/)

---

**Yazar:** Okan Şafak  
**GitHub:** [@okansafak](https://github.com/okansafak)
