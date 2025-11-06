const fs = require('fs');
const path = require('path');

// Better CSV parse function handling quoted fields
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

// Fix Turkish character encoding issues - more comprehensive
function fixTurkishChars(text) {
    if (!text) return text;
    
    const replacements = {
        'Ä°': 'İ',
        'Ä±': 'ı',
        'ÅŸ': 'ş',
        'Åž': 'Ş',
        'Ä': 'ğ',
        'Äž': 'Ğ',
        'Ã¼': 'ü',
        'Ãœ': 'Ü',
        'Ã¶': 'ö',
        'Ã–': 'Ö',
        'Ã§': 'ç',
        'Ã‡': 'Ç',
        '�': 'İ', // Common replacement for İ
        'ý': 'ı',
        'þ': 'ş',
        'Þ': 'Ş',
        'ð': 'ğ',
        'Ð': 'Ğ',
        // Additional problematic encodings
        'Ä°skele': 'İskele',
        'Ä°H.': 'İH.',
        'Ä°ETT': 'İETT',
        'Ä°stanbul': 'İstanbul'
    };
    
    let fixed = text;
    Object.keys(replacements).forEach(key => {
        const regex = new RegExp(key, 'g');
        fixed = fixed.replace(regex, replacements[key]);
    });
    
    return fixed;
}

console.log('Processing IETT stops data...');

// Read stops data
const stopsFile = path.join(__dirname, 'data', 'ist_gtfs', 'stops.csv');
const stops = parseCSV(stopsFile);

console.log(`Total stops: ${stops.length}`);

// Filter based ONLY on coordinates - no name checking
// This avoids all encoding issues
const landStops = stops.filter(stop => {
    const lat = parseFloat(stop.stop_lat);
    const lon = parseFloat(stop.stop_lon);
    const stopId = stop.stop_id;
    
    // Basic validation - must have ID and valid coordinates
    if (!stopId || isNaN(lat) || isNaN(lon)) {
        return false;
    }
    
    // Filter by coordinates only
    // Istanbul metropolitan area extended boundaries
    // Exclude outlier areas (far east/west suburbs)
    const inMainArea = lat > 40.75 && lat < 41.35 && lon > 28.45 && lon < 29.55;
    
    // Additional filter: exclude obvious sea/ferry coordinates
    // Ferries are typically at sea level and specific coordinates
    const isLikelyFerry = (
        (lon > 29.00 && lon < 29.15 && lat > 40.85 && lat < 41.15) || // Bosphorus line
        (lon > 28.95 && lon < 29.05 && lat > 40.98 && lat < 41.05)    // Golden Horn
    ) && stop.stop_code && stop.stop_code.toString().startsWith('2000'); // Ferry codes
    
    return inMainArea && !isLikelyFerry;
});

console.log(`Land transport stops: ${landStops.length}`);

// Convert to GeoJSON
// Store only IDs and coordinates, no names to avoid encoding issues
const features = landStops.map(stop => {
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

// Save to file
const outputFile = path.join(__dirname, 'data', 'iett_stops.geojson');
fs.writeFileSync(outputFile, JSON.stringify(geojson, null, 2));

console.log(`Saved ${features.length} stops to ${outputFile}`);
console.log('Done!');
