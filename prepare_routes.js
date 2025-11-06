// prepare_routes.js

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync'); // Senkron CSV okuyucu

console.log("Veri hazırlama script'i başlatıldı...");

// --- 1. HAVAALANI VERİSİNİ (airports.dat) OKU VE BİR SÖZLÜK OLUŞTUR ---
const airportsPath = path.join(__dirname, 'data', 'openflights', 'airports.dat');

if (!fs.existsSync(airportsPath)) {
    console.error(`HATA: Havaalanı dosyası bulunamadı: ${airportsPath}`);
    process.exit(1);
}

const airportsCSV = fs.readFileSync(airportsPath, 'utf-8');
const airportsData = parse(airportsCSV, {
    columns: ['id', 'name', 'city', 'country', 'iata', 'icao', 'lat', 'lon', 'altitude', 'timezone', 'dst', 'tz', 'type', 'source'],
    skip_empty_lines: true,
    relax_column_count: true
});

const airportMap = new Map();
for (const airport of airportsData) {
    // IATA kodu geçerli ve 3 harfli mi kontrol et
    if (airport.iata && airport.iata !== '\\N' && airport.iata.length === 3) {
        const lat = parseFloat(airport.lat);
        const lon = parseFloat(airport.lon);
        
        // Geçerli koordinat kontrolü
        if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            airportMap.set(airport.iata, { lat, lon });
        }
    }
}
console.log(`${airportMap.size} geçerli havaalanı hafızaya yüklendi.`);

// --- 2. ROTA VERİSİNİ (routes.dat) OKU VE GEOJSON OLUŞTUR ---
const routesPath = path.join(__dirname, 'data', 'openflights', 'routes.dat');

if (!fs.existsSync(routesPath)) {
    console.error(`HATA: Rota dosyası bulunamadı: ${routesPath}`);
    process.exit(1);
}

const routesCSV = fs.readFileSync(routesPath, 'utf-8');
const routesData = parse(routesCSV, {
    columns: ['airline', 'airline_id', 'src_iata', 'src_id', 'dst_iata', 'dst_id', 'codeshare', 'stops', 'equipment'],
    skip_empty_lines: true,
    relax_column_count: true
});

console.log(`${routesData.length} rota işlenecek...`);

const geojsonFeatures = [];
let processedCount = 0;
let skippedCount = 0;

for (const route of routesData) {
    const origin = airportMap.get(route.src_iata);
    const destination = airportMap.get(route.dst_iata);

    if (origin && destination) {
        // Aynı havaalanından başlayıp biten rotaları atla
        if (route.src_iata === route.dst_iata) {
            skippedCount++;
            continue;
        }
        
        const feature = {
            type: 'Feature',
            properties: {
                src: route.src_iata,
                dst: route.dst_iata,
                airline: route.airline || 'Unknown'
            },
            geometry: {
                type: 'LineString',
                coordinates: [
                    [origin.lon, origin.lat],
                    [destination.lon, destination.lat]
                ]
            }
        };
        geojsonFeatures.push(feature);
        processedCount++;
    } else {
        skippedCount++;
    }
}

// --- 3. FİNAL GEOJSON DOSYASINI YAZ ---

const finalGeoJSON = {
    type: 'FeatureCollection',
    features: geojsonFeatures
};

const outputDir = path.join(__dirname, 'data', 'openflights');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const outputFilePath = path.join(outputDir, 'routes_processed.geojson');
fs.writeFileSync(outputFilePath, JSON.stringify(finalGeoJSON, null, 2));

console.log(`\n✓ İşlem tamamlandı!`);
console.log(`  - ${processedCount} geçerli rota işlendi`);
console.log(`  - ${skippedCount} rota atlandı`);
console.log(`  - Sonuç: ${outputFilePath}`);