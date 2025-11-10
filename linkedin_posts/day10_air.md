# LinkedIn Post - Day 10: Air

#30DayMapChallenge'ın 10. günü "Air" teması için İstanbul'un gerçek zamanlı hava kalitesini görselleştiren interaktif bir atmosfer haritası geliştirdim.

🎯 Konsept: Soluduğumuz havayı görünür kılmak. Harita üzerinde herhangi bir noktaya tıklayarak o bölgenin hava kalitesini, kirlilik seviyelerini ve 24 saatlik trendini gerçek zamanlı olarak görselleştiriyorum.

✨ Hava Kalitesi Analizi:
• PM2.5, PM10, NO₂, O₃ olmak üzere 4 temel kirlilik parametresi
• AQI (Air Quality Index) hesaplama: 0-200+ skala
• Renk kodlaması: Yeşil (İyi hava) → Sarı (Orta) → Kırmızı (Kötü) → Mor (Çok kötü)
• Dinamik alan gösterimi: Kötü hava kalitesi daha geniş alanı etkiliyor
• 24 saatlik PM2.5 trend grafiği: Günün hangi saatlerinde hava daha temiz?
• GPS tabanlı konum desteği: Bulunduğunuz noktanın hava kalitesini öğrenin

🌬️ Neden Önemli?

Hava kirliliği dünya genelinde yılda 7 milyon erken ölüme neden oluyor (WHO). Bu görselleştirme:
• Hangi bölgelerin daha riskli olduğunu gösteriyor
• Açık hava aktiviteleri için karar desteği sağlıyor  
• Şehir planlaması ve yeşil alan ihtiyacını ortaya koyuyor
• Halk sağlığı farkındalığı yaratıyor

🛠️ Teknik Stack:
• Leaflet.js ile interaktif dark tema harita
• Open-Meteo API'den gerçek zamanlı hava durumu ve kirlilik verisi
• Canvas API ile custom grafik çizimi (eksenler, etiketler, trend çizgisi)
• Geolocation API ile GPS tabanlı konum bulma
• Responsive grid layout (desktop & mobile)

📊 Veri Kaynağı:
Open-Meteo Weather & Air Quality API - Saatlik güncellenen açık veri

🔍 Kirlilik Parametreleri:
• PM2.5: 2.5 mikrondan küçük partiküller (akciğerlere ulaşır)
• PM10: 10 mikrondan küçük partiküller (solunum yollarını etkiler)
• NO₂: Nitrojen dioksit (trafik kaynaklı, astımı tetikler)
• O₃: Ozon (güneş + kirlilik reaksiyonu, göz ve solunum tahrişi)

🔗 GitHub: https://github.com/okansafak/30DayMapChallenge2025
🔗 Demo: https://okansafak.github.io/30DayMapChallenge2025/maps/day10.html

#air #pollution #airquality #environmentaldata #publichealth #urbanplanning #istanbul #atmosphere #realtime #dataviz #webmapping #leafletjs #opengisturkiye #30daymapchallenge #geospatialdata #climateaction
