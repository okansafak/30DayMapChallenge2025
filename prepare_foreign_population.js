const fs = require('fs');
const XLSX = require('xlsx');

// Excel dosyasını raw olarak oku (header yok)
console.log('Excel dosyası okunuyor...');
const workbook = XLSX.readFile('./data/population/illere ve cinsiyete gore yabanci nufus.xls', {
    cellDates: true,
    cellNF: false,
    cellText: false
});

const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Raw data olarak oku (header olmadan)
const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log(`Toplam ${rawData.length} satır bulundu`);

// İlk birkaç satırı göster
console.log('\nİlk 10 satır:');
for (let i = 0; i < Math.min(10, rawData.length); i++) {
    console.log(`Satır ${i}:`, rawData[i]);
}

// Veri satırlarını bul (başlık satırlarını atla)
let dataStartRow = 0;
for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    // İl ismi içeren ilk gerçek veri satırını bul
    if (row[0] && typeof row[0] === 'string' && row[0].trim() && 
        !row[0].includes('Foreign') && !row[0].includes('Provinces') &&
        !row[0].includes('İller') && !row[0].includes('2022') && !row[0].includes('2023')) {
        dataStartRow = i;
        console.log(`\nVeri başlangıç satırı: ${i}`);
        console.log('Başlangıç satırı:', row);
        break;
    }
}

// İl isimlerini normalize et
function normalizeProvinceName(name) {
    if (!name) return '';
    
    // Trim ve uppercase
    name = name.toString().trim();
    
    // İl isimleri için özel mapping
    const mapping = {
        'Afyonkarahisar': 'Afyon',
        'K.Maraş': 'K.Maras',
        'Kahramanmaraş': 'K.Maras',
        'Zonguldak': 'Zinguldak',
        'Kırıkkale': 'Kinkkale',
        'Kırklareli': 'Kirklareli',
        'Kırşehir': 'Kirsehir',
        'Eskişehir': 'Eskisehir',
        'İstanbul': 'Istanbul',
        'İzmir': 'Izmir',
        'Şanlıurfa': 'Sanliurfa',
        'Tekirdağ': 'Tekirdag',
        'Çanakkale': 'Çanakkale',
        'Çankırı': 'Çankiri',
        'Çorum': 'Çorum',
        'Iğdır': 'Iğdır',
        'Ağrı': 'Agri',
        'Şırnak': 'Sirnak',
        'Muğla': 'Mugla',
        'Kütahya': 'Kütahya',
        'Elazığ': 'Elazığ',
        'Düzce': 'Düzce',
        'Gümüşhane': 'Gümüshane',
        'Muş': 'Mus',
        'Niğde': 'Nigde',
        'Nevşehir': 'Nevsehir',
        'Kırşehir': 'Kirsehir',
        'Uşak': 'Usak',
        'Bartın': 'Bartın',
        'Kilis': 'Kilis',
        'Osmaniye': 'Osmaniye',
        'Düzce': 'Düzce',
        'Adıyaman': 'Adiyaman',
        'Aydın': 'Aydin',
        'Balıkesir': 'Balikesir',
        'Diyarbakır': 'Diyarbakir'
    };
    
    return mapping[name] || name;
}

console.log('\n\n=== Excel Veri İşleme ===');
const populationData = {};

// Excel verisinden 2023 verilerini çek (satır 4'ten başla - Toplam-Total satırını atla)
for (let i = dataStartRow + 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || row[0].trim() === '') continue; // Boş satırları atla
    
    const provinceName = row[0].trim();
    const total2023 = row[5] || 0;  // Toplam 2023
    const male2023 = row[6] || 0;   // Erkek 2023
    const female2023 = row[7] || 0; // Kadın 2023
    
    const normalizedName = normalizeProvinceName(provinceName);
    
    populationData[normalizedName] = {
        province: provinceName,
        province_normalized: normalizedName,
        total_2023: parseInt(total2023) || 0,
        male_2023: parseInt(male2023) || 0,
        female_2023: parseInt(female2023) || 0
    };
    
    console.log(`${provinceName} -> ${normalizedName}: Toplam=${total2023}, E=${male2023}, K=${female2023}`);
}

console.log(`\n${Object.keys(populationData).length} il verisi işlendi`);

// GeoJSON dosyasını oku
console.log('\n\n=== GeoJSON İşleme ===');
const geojson = JSON.parse(fs.readFileSync('./data/population/gadm41_TUR_1.json', 'utf8'));

console.log(`GeoJSON'da ${geojson.features.length} il var`);

// Her bir feature'a nüfus verilerini ekle
let matchCount = 0;
let unmatchedProvinces = [];

geojson.features.forEach(feature => {
    const gadmName = feature.properties.NAME_1;
    
    if (populationData[gadmName]) {
        // Eşleşme bulundu
        feature.properties.foreign_population_2023 = populationData[gadmName].total_2023;
        feature.properties.foreign_male_2023 = populationData[gadmName].male_2023;
        feature.properties.foreign_female_2023 = populationData[gadmName].female_2023;
        feature.properties.province_name = populationData[gadmName].province;
        matchCount++;
        console.log(`✓ ${gadmName}: ${populationData[gadmName].total_2023} yabancı`);
    } else {
        // Eşleşme bulunamadı
        feature.properties.foreign_population_2023 = 0;
        feature.properties.foreign_male_2023 = 0;
        feature.properties.foreign_female_2023 = 0;
        feature.properties.province_name = gadmName;
        unmatchedProvinces.push(gadmName);
        console.log(`✗ ${gadmName}: Eşleşme bulunamadı`);
    }
});

console.log(`\n\n=== Sonuç ===`);
console.log(`✓ Eşleşen il sayısı: ${matchCount}`);
console.log(`✗ Eşleşmeyen il sayısı: ${unmatchedProvinces.length}`);
if (unmatchedProvinces.length > 0) {
    console.log('Eşleşmeyen iller:', unmatchedProvinces.join(', '));
}

// GeoJSON dosyasını kaydet
const outputPath = './data/population/turkey_foreign_population_2023.geojson';
fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2), 'utf8');

console.log(`\n✓ GeoJSON dosyası kaydedildi: ${outputPath}`);
console.log(`Toplam ${geojson.features.length} il`);

// İstatistikleri göster
const totalForeign = geojson.features.reduce((sum, f) => sum + (f.properties.foreign_population_2023 || 0), 0);
const totalMale = geojson.features.reduce((sum, f) => sum + (f.properties.foreign_male_2023 || 0), 0);
const totalFemale = geojson.features.reduce((sum, f) => sum + (f.properties.foreign_female_2023 || 0), 0);

console.log(`\nToplam yabancı nüfus: ${totalForeign.toLocaleString('tr-TR')}`);
console.log(`Erkek: ${totalMale.toLocaleString('tr-TR')} (${(totalMale/totalForeign*100).toFixed(1)}%)`);
console.log(`Kadın: ${totalFemale.toLocaleString('tr-TR')} (${(totalFemale/totalForeign*100).toFixed(1)}%)`);

// En fazla yabancı nüfusu olan ilk 10 ili listele
const top10 = geojson.features
    .sort((a, b) => b.properties.foreign_population_2023 - a.properties.foreign_population_2023)
    .slice(0, 10);

console.log('\nEn fazla yabancı nüfusu olan 10 il:');
top10.forEach((f, i) => {
    const props = f.properties;
    console.log(`${i + 1}. ${props.province_name || props.NAME_1}: ${props.foreign_population_2023.toLocaleString('tr-TR')} (E: ${props.foreign_male_2023.toLocaleString('tr-TR')}, K: ${props.foreign_female_2023.toLocaleString('tr-TR')})`);
});
