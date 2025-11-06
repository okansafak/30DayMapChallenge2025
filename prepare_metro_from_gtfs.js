const fs = require('fs');
const path = require('path');

// Türkçe karakter düzeltme fonksiyonu - ISO-8859-9 -> UTF-8
function fixTurkishChars(str) {
    if (!str) return '';
    
    // ISO-8859-9 (Latin-5) karakterlerini UTF-8'e çevir
    const map = {
        'Ã‡': 'Ç', 'Ã§': 'ç',
        'Ä°': 'İ', 'Ä±': 'ı',
        'Ä': 'Ğ', 'Ä': 'ğ',
        'Ã–': 'Ö', 'Ã¶': 'ö',
        'Åž': 'Ş', 'ÅŸ': 'ş',
        'Ãœ': 'Ü', 'Ã¼': 'ü',
        // Yaygın bozuk encoding'ler
        'Ä°': 'İ',
        'Ä±': 'ı',
        'Å': 'Ş',
        'ÅŸ': 'ş',
        'Ä': 'Ğ',
        'ÄŸ': 'ğ',
        '�': 'İ' // Genel placeholder
    };
    
    let result = str;
    for (const [bad, good] of Object.entries(map)) {
        result = result.split(bad).join(good);
    }
    
    // Eğer hala � varsa en yaygın durumları dene
    if (result.includes('�')) {
        result = result
            .replace(/�EH�RHATLAR/gi, 'ŞEHİRHATLAR')
            .replace(/�STANBUL/gi, 'İSTANBUL')
            .replace(/BA�CILAR/gi, 'BAĞCILAR')
            .replace(/KABATA�/gi, 'KABATAŞ')
            .replace(/YEN�KAPI/gi, 'YENİKAPI')
            .replace(/KIRAZLI/gi, 'KIRAZLI')
            .replace(/�SK�DAR/gi, 'ÜSKÜDAR')
            .replace(/KADIK�Y/gi, 'KADIKÖY')
            .replace(/�EKMEK�Y/gi, 'ÇEKMEKİÖY')
            .replace(/TAV�ANTEPE/gi, 'TAVŞANTEPE')
            .replace(/BO�AZ/gi, 'BOĞAZ')
            .replace(/�/gi, 'İ');
    }
    
    return result;
}

// CSV okuma yardımcı fonksiyonu - UTF-8 BOM desteği ile
function parseCSV(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    // UTF-8 BOM varsa kaldır
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = values[i] || '';
        });
        return obj;
    });
}

// CSV satırını doğru şekilde parse et (virgüllü alanlar için)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// Zaman string'ini saniyeye çevir
function timeToSeconds(timeStr) {
    if (!timeStr) return null;
    const [h, m, s] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60 + s;
}

console.log('📊 GTFS verileri okunuyor...\n');

const dataDir = path.join(__dirname, 'data', 'ist_gtfs');

// Dosyaları oku
const agencies = parseCSV(path.join(dataDir, 'agency.csv'));
const routes = parseCSV(path.join(dataDir, 'routes.csv'));
const trips = parseCSV(path.join(dataDir, 'trips.csv'));
const stops = parseCSV(path.join(dataDir, 'stops.csv'));
const shapes = parseCSV(path.join(dataDir, 'shapes.csv'));

console.log(`✓ ${agencies.length} ajans`);
console.log(`✓ ${routes.length} hat`);
console.log(`✓ ${trips.length} sefer`);
console.log(`✓ ${stops.length} durak`);
console.log(`✓ ${shapes.length} güzergah noktası`);

// Metro İstanbul (11) ve TCDD/Marmaray (4) hatlarını filtrele
const metroAgencyIds = ['11', '4'];
const metroRoutes = routes.filter(r => metroAgencyIds.includes(r.agency_id));

console.log(`\n🚇 Raylı Sistem Hatları:`);
metroRoutes.forEach(r => {
    const agency = agencies.find(a => a.agency_id === r.agency_id);
    const routeName = fixTurkishChars(r.route_long_name);
    const agencyName = fixTurkishChars(agency?.agency_name || '');
    console.log(`  ${r.route_short_name || r.route_id}: ${routeName} (${agencyName})`);
});

const metroRouteIds = new Set(metroRoutes.map(r => r.route_id));
const metroTrips = trips.filter(t => metroRouteIds.has(t.route_id));

console.log(`\n✓ ${metroTrips.length} raylı sistem seferi bulundu`);

// Shapes'i shape_id'ye göre grupla
console.log('\n📍 Güzergah şekilleri işleniyor...');
const shapesByShapeId = {};
shapes.forEach(s => {
    if (!shapesByShapeId[s.shape_id]) {
        shapesByShapeId[s.shape_id] = [];
    }
    shapesByShapeId[s.shape_id].push(s);
});

// Her shape için koordinatları sırala
Object.keys(shapesByShapeId).forEach(shapeId => {
    shapesByShapeId[shapeId].sort((a, b) => 
        parseInt(a.shape_pt_sequence) - parseInt(b.shape_pt_sequence)
    );
});

console.log(`✓ ${Object.keys(shapesByShapeId).length} benzersiz güzergah şekli`);

// stop_times.csv'yi oku - sadece metro seferleri için
console.log('\n⏱️  Sefer zamanları okunuyor...');
const metroTripIds = new Set(metroTrips.map(t => t.trip_id));
const stopTimesData = {};

const stopTimesContent = fs.readFileSync(path.join(dataDir, 'stop_times.csv'), 'utf-8');
const stopTimesLines = stopTimesContent.trim().split('\n');
const stopTimesHeaders = stopTimesLines[0].split(',');

for (let i = 1; i < stopTimesLines.length; i++) {
    if (i % 50000 === 0) {
        console.log(`  ${i} / ${stopTimesLines.length} satır işlendi...`);
    }
    
    const values = stopTimesLines[i].split(',');
    const tripId = values[0]; // trip_id ilk sütunda
    
    if (metroTripIds.has(tripId)) {
        if (!stopTimesData[tripId]) {
            stopTimesData[tripId] = [];
        }
        
        const obj = {};
        stopTimesHeaders.forEach((header, idx) => {
            obj[header] = values[idx] || '';
        });
        stopTimesData[tripId].push(obj);
    }
}

console.log(`✓ ${Object.keys(stopTimesData).length} metro seferi için zaman verileri`);

// Durakları indeksle
const stopsById = {};
stops.forEach(stop => {
    stopsById[stop.stop_id] = stop;
});

// Hatları indeksle
const routesById = {};
routes.forEach(route => {
    routesById[route.route_id] = route;
});

// Her hat için benzersiz renk paleti
const routeColors = {
    'M1A': '#ED1C24',
    'M1B': '#C1272D',
    'M2': '#00A651',
    'M2A': '#00853D',
    'M3': '#0072BC',
    'M3A': '#005A95',
    'M4': '#EE428D',
    'M5': '#8B5DA5',
    'M6': '#FFD100',
    'M7': '#E6007D',
    'M8': '#F39200',
    'M9': '#951B81',
    'M11': '#B933AD',
    'T1': '#0099CC',
    'T3': '#00C1DE',
    'T4': '#FFCC00',
    'F1': '#FF6B35',
    'F2': '#FF8C42',
    'F3': '#FFA64D',
    'TF1': '#6C5CE7',
    'TF2': '#A29BFE',
    'Marmaray': '#E74C3C',      // Parlak kırmızı
    'Marmaray1': '#C0392B',     // Koyu kırmızı
    'Marmaray2': '#E67E22'      // Turuncu-kırmızı
};

function getRouteColor(routeShortName, routeColor) {
    // Önce route_short_name'den renk bul
    if (routeShortName && routeColors[routeShortName]) {
        return routeColors[routeShortName];
    }
    // GTFS'ten gelen renk varsa kullan
    if (routeColor && routeColor !== '') {
        return `#${routeColor}`;
    }
    // Varsayılan renk
    return '#4fc3f7';
}

// GeoJSON features oluştur
console.log('\n🗺️  GeoJSON oluşturuluyor (tüm seferler)...');
const features = [];
let processedCount = 0;

// Tüm metro seferlerini işle
for (const tripId in stopTimesData) {
    const trip = metroTrips.find(t => t.trip_id === tripId);
    if (!trip) continue;
    
    const route = routesById[trip.route_id];
    if (!route) continue;
    const stopTimes = stopTimesData[tripId];
    if (!stopTimes || stopTimes.length < 2) continue;
    
    // stop_sequence'a göre sırala
    stopTimes.sort((a, b) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence));
    
    // Eğer shape_id varsa, gerçek güzergah şeklini kullan
    let coordinates = [];
    
    if (trip.shape_id && shapesByShapeId[trip.shape_id]) {
            const shapePoints = shapesByShapeId[trip.shape_id];
            
            // İlk ve son durakların zamanlarını al
            const firstTime = timeToSeconds(stopTimes[0].departure_time || stopTimes[0].arrival_time);
            const lastTime = timeToSeconds(stopTimes[stopTimes.length - 1].arrival_time || stopTimes[stopTimes.length - 1].departure_time);
            
            if (firstTime !== null && lastTime !== null) {
                const totalTime = lastTime - firstTime;
                
                // Shape noktalarını zamanla eşleştir
                coordinates = shapePoints.map((sp, idx) => {
                    const progress = idx / (shapePoints.length - 1);
                    const time = firstTime + (totalTime * progress);
                    
                    return [
                        parseFloat(sp.shape_pt_lon),
                        parseFloat(sp.shape_pt_lat),
                        Math.round(time)
                    ];
                });
        }
    } else {
        // Shape yoksa durakları kullan
        let lastTime = null;
        
        for (let i = 0; i < stopTimes.length; i++) {
            const st = stopTimes[i];
            const stop = stopsById[st.stop_id];
            
            if (!stop) continue;
            
            let time = timeToSeconds(st.arrival_time || st.departure_time);
            
            // Zaman interpolasyonu
            if (time === null && coordinates.length > 0) {
                let nextTimeIdx = -1;
                for (let j = i + 1; j < stopTimes.length; j++) {
                    const nextTime = timeToSeconds(stopTimes[j].arrival_time || stopTimes[j].departure_time);
                    if (nextTime !== null) {
                        nextTimeIdx = j;
                        break;
                    }
                }
                
                if (nextTimeIdx !== -1 && lastTime !== null) {
                    const nextTime = timeToSeconds(stopTimes[nextTimeIdx].arrival_time || stopTimes[nextTimeIdx].departure_time);
                    const steps = nextTimeIdx - i + 1;
                    const timeStep = (nextTime - lastTime) / steps;
                    time = lastTime + timeStep;
                }
            }
            
            if (time !== null) {
                coordinates.push([
                    parseFloat(stop.stop_lon),
                    parseFloat(stop.stop_lat),
                    Math.round(time)
                ]);
                lastTime = time;
            }
        }
    }
    
    if (coordinates.length >= 2) {
        const routeShortName = route.route_short_name || '';
        
        features.push({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: coordinates
            },
            properties: {
                trip_id: trip.trip_id,
                route_id: trip.route_id,
                route_short_name: routeShortName,
                route_long_name: fixTurkishChars(route.route_long_name || ''),
                trip_headsign: fixTurkishChars(trip.trip_headsign || ''),
                color: getRouteColor(routeShortName, route.route_color),
                has_shape: trip.shape_id ? true : false
            }
        });
        
        processedCount++;
        
        if (processedCount % 500 === 0) {
            console.log(`  ${processedCount} sefer işlendi...`);
        }
    }
}

const geojson = {
    type: 'FeatureCollection',
    features: features
};

// İstatistikler
const withShape = features.filter(f => f.properties.has_shape).length;
const withoutShape = features.filter(f => !f.properties.has_shape).length;

// Kaydet
const outputPath = path.join(__dirname, 'data', 'spacetime_cube_data.geojson');
fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));

console.log(`\n✅ Tamamlandı!`);
console.log(`  ${features.length} sefer oluşturuldu`);
console.log(`  📍 Gerçek güzergah şekli ile: ${withShape}`);
console.log(`  📍 Durak noktaları ile: ${withoutShape}`);
console.log(`\n💾 ${outputPath} dosyasına kaydedildi`);
console.log(`\nAnimasyonu görmek için: http://localhost:8080/maps/day06.html`);
