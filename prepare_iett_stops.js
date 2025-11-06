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

console.log('=== İETT Otobüs Durak Verisi (stops_iett.csv) ===\n');

// Read İETT stops directly
const stopsFile = path.join(__dirname, 'data', 'ist_gtfs', 'stops_iett.csv');
const iettStops = parseCSV(stopsFile);

console.log(`Toplam İETT durağı: ${iettStops.length}`);

// Filter for valid coordinates
const validStops = iettStops.filter(stop => {
    const lat = parseFloat(stop.stop_lat);
    const lon = parseFloat(stop.stop_lon);
    const stopId = stop.stop_id;
    
    // Basic validation
    if (!stopId || isNaN(lat) || isNaN(lon)) {
        return false;
    }
    
    // Must be in reasonable Istanbul area
    if (lat < 40.5 || lat > 41.5 || lon < 28.0 || lon > 30.0) {
        return false;
    }
    
    return true;
});

console.log(`Geçerli koordinatlı durak: ${validStops.length}`);

// Convert to GeoJSON - NO NAMES to avoid encoding issues
const features = validStops.map(stop => {
    const lat = parseFloat(stop.stop_lat);
    const lon = parseFloat(stop.stop_lon);
    
    return {
        type: 'Feature',
        properties: {
            id: stop.stop_id,
            code: stop.stop_code || '',
            // Note: wheelchair_boarding field doesn't exist in stops_iett.csv
            wheelchair: 0
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

console.log(`\n✅ Başarıyla kaydedildi: ${outputFile}`);
console.log(`📊 Toplam İETT otobüs durağı: ${features.length}`);
console.log(`🚌 Sadece otobüs durakları (metro/marmaray/vapur hariç)`);
console.log(`📝 İsim alanı yok (encoding sorunları önlendi)`);
console.log('\nTamamlandı!');
