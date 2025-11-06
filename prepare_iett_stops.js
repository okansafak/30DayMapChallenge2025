const fs = require('fs');
const path = require('path');

// Simple CSV parse function
function parseCSV(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Remove UTF-8 BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        const obj = {};
        headers.forEach((header, idx) => {
            obj[header] = values[idx] || '';
        });
        data.push(obj);
    }
    
    return data;
}

console.log('=== İETT Durak Verisi Oluşturuluyor ===\n');

// Read stops
const stopsFile = path.join(__dirname, 'data', 'ist_gtfs', 'stops.csv');
const allStops = parseCSV(stopsFile);

console.log(`Toplam durak (GTFS): ${allStops.length}`);

// Filter strategy:
// 1. Use coordinates to stay in Istanbul main area
// 2. Exclude ferry stops by stop_code (20xxxx)
// 3. No name filtering to avoid encoding issues

const filteredStops = allStops.filter(stop => {
    const lat = parseFloat(stop.stop_lat);
    const lon = parseFloat(stop.stop_lon);
    const stopId = stop.stop_id;
    const stopCode = stop.stop_code || '';
    
    // Basic validation
    if (!stopId || isNaN(lat) || isNaN(lon)) {
        return false;
    }
    
    // Istanbul main metropolitan area
    // Slightly tighter bounds to focus on main city
    if (lat < 40.80 || lat > 41.30 || lon < 28.50 || lon > 29.50) {
        return false;
    }
    
    // Exclude ferry stops (stop_code starts with 2000)
    // These are Şehir Hatları stops
    if (stopCode.startsWith('2000')) {
        return false;
    }
    
    return true;
});

console.log(`Filtrelenmiş duraklar: ${filteredStops.length}`);

// Convert to GeoJSON - NO NAMES to avoid encoding issues
const features = filteredStops.map(stop => {
    const lat = parseFloat(stop.stop_lat);
    const lon = parseFloat(stop.stop_lon);
    
    return {
        type: 'Feature',
        properties: {
            id: stop.stop_id,
            code: stop.stop_code || '',
            wheelchair: stop.wheelchair_boarding === '1' ? 1 : 0
        },
        geometry: {
            type: 'Point',
            coordinates: [lon, lat]
        }
    };
});

const geojson = {
    type: 'FeatureCollection',
    features: features
};

// Save
const outputFile = path.join(__dirname, 'data', 'iett_stops.geojson');
fs.writeFileSync(outputFile, JSON.stringify(geojson, null, 2));

const wheelchairCount = features.filter(f => f.properties.wheelchair === 1).length;

console.log(`\n✅ Başarıyla kaydedildi: ${outputFile}`);
console.log(`📊 Toplam durak: ${features.length}`);
console.log(`♿ Erişilebilir durak: ${wheelchairCount}`);
console.log(`🚫 Vapur iskelesi hariç (2000xx kodlar)`);
console.log(`📝 İsim alanı yok (encoding sorunları önlendi)`);
console.log('\nTamamlandı!');
