const fs = require('fs');
const path = require('path');

// CSV parse function with UTF-8 BOM handling
function parseCSV(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Remove UTF-8 BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, i) => {
            obj[header.trim()] = values[i] ? values[i].trim() : '';
        });
        return obj;
    });
}

// Fix Turkish character encoding issues
function fixTurkishChars(text) {
    if (!text) return text;
    
    const replacements = {
        '�': 'İ',
        '�': 'Ş',
        '�': 'Ğ',
        '�': 'Ü',
        '�': 'Ö',
        '�': 'Ç',
        '�': 'ı',
        '�': 'ş',
        '�': 'ğ',
        '�': 'ü',
        '�': 'ö',
        '�': 'ç'
    };
    
    let fixed = text;
    Object.keys(replacements).forEach(key => {
        fixed = fixed.split(key).join(replacements[key]);
    });
    
    return fixed;
}

console.log('Processing IETT stops data...');

// Read stops data
const stopsFile = path.join(__dirname, 'data', 'ist_gtfs', 'stops.csv');
const stops = parseCSV(stopsFile);

console.log(`Total stops: ${stops.length}`);

// Filter only land transport stops (exclude ferries/marmaray)
// Ferries typically have "İH." or "İskele" in the name
const landStops = stops.filter(stop => {
    const name = fixTurkishChars(stop.stop_name || '');
    const lat = parseFloat(stop.stop_lat);
    const lon = parseFloat(stop.stop_lon);
    
    // Basic validation
    if (!name || isNaN(lat) || isNaN(lon)) return false;
    
    // Exclude ferry stops
    if (name.includes('İH.') || name.includes('İskele') || 
        name.includes('Vapur') || name.includes('İskelesi')) {
        return false;
    }
    
    // Keep valid Istanbul coordinates
    return lat > 40.8 && lat < 41.5 && lon > 28.5 && lon < 29.5;
});

console.log(`Land transport stops: ${landStops.length}`);

// Convert to GeoJSON
const features = landStops.map(stop => {
    const name = fixTurkishChars(stop.stop_name || '');
    const lat = parseFloat(stop.stop_lat);
    const lon = parseFloat(stop.stop_lon);
    
    return {
        type: 'Feature',
        properties: {
            stop_id: stop.stop_id,
            stop_code: stop.stop_code,
            stop_name: name,
            wheelchair_boarding: stop.wheelchair_boarding === '1'
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
