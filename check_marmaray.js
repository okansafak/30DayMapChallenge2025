const fs = require('fs');

function parseCSV(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = values[i] || '';
        });
        return obj;
    });
}

console.log('Marmaray seferleri analiz ediliyor...\n');

const routes = parseCSV('data/ist_gtfs/routes.csv');
const trips = parseCSV('data/ist_gtfs/trips.csv');

// Marmaray route ID'leri
const marmarays = ['28188', '26727', '26615'];
const marmarayRoutes = routes.filter(r => marmarays.includes(r.route_id));

console.log('📍 Marmaray Hatları:');
marmarayRoutes.forEach(r => {
    console.log(`  ${r.route_id}: ${r.route_short_name} - ${r.route_long_name}`);
});

// Marmaray seferleri
const marmarayTrips = trips.filter(t => marmarays.includes(t.route_id));
console.log(`\n🚆 Toplam Marmaray Seferi: ${marmarayTrips.length}`);

// Route bazında sayım
const tripsByRoute = {};
marmarayTrips.forEach(t => {
    tripsByRoute[t.route_id] = (tripsByRoute[t.route_id] || 0) + 1;
});

console.log('\nRoute bazında:');
Object.entries(tripsByRoute).forEach(([routeId, count]) => {
    const route = marmarayRoutes.find(r => r.route_id === routeId);
    console.log(`  ${route.route_short_name}: ${count} sefer`);
});

// Örnek seferler
console.log('\nÖrnek seferler:');
marmarayTrips.slice(0, 5).forEach(t => {
    console.log(`  Trip ID: ${t.trip_id}, Route: ${t.route_id}, Headsign: ${t.trip_headsign}`);
});
