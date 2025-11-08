const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./data/toplanma alani kocaeli/acil-toplanma-alanlar.json', 'utf8'));

console.log('Is valid GeoJSON:', data.type === 'FeatureCollection');
console.log('Has features:', !!data.features);
console.log('Total features:', data.features ? data.features.length : 'N/A');

if (data.features && data.features.length > 0) {
    const first = data.features[0];
    console.log('Has geometry:', !!first.geometry);
    console.log('Geometry type:', first.geometry ? first.geometry.type : 'N/A');
    
    // GeoJSON formatı doğru mu kontrol et
    if (data.type === 'FeatureCollection' && first.geometry) {
        console.log('\n✓ Dosya zaten doğru GeoJSON formatında!');
        console.log('✓ Direkt olarak kullanılabilir.');
    }
}
