const fs = require('fs');

console.log('GeoJSON analiz ediliyor...\n');

const data = JSON.parse(fs.readFileSync('data/spacetime_cube_data.geojson', 'utf-8'));

const routes = {};
const marmarayTrips = [];

data.features.forEach(f => {
    const r = f.properties.route_short_name;
    routes[r] = (routes[r] || 0) + 1;
    
    if (r && (r.includes('Marmaray') || r.includes('marmaray'))) {
        marmarayTrips.push(f.properties);
    }
});

console.log('📊 Hat Başına Sefer Sayıları:\n');
Object.entries(routes).sort((a, b) => b[1] - a[1]).forEach(([r, c]) => {
    console.log(`  ${r.padEnd(15)} : ${c} sefer`);
});

console.log(`\n🚆 Marmaray Seferleri: ${marmarayTrips.length}`);
if (marmarayTrips.length > 0) {
    console.log('\nMarmaray sefer örnekleri:');
    marmarayTrips.slice(0, 5).forEach(t => {
        console.log(`  - ${t.route_short_name}: ${t.route_long_name}`);
        console.log(`    Trip: ${t.trip_id}, Headsign: ${t.trip_headsign}`);
    });
}

console.log(`\n✅ Toplam: ${data.features.length} sefer`);
