# Ana Sayfa Banner Carousel

## Yapılacaklar
- Ana sayfadaki mevcut iki sütunlu alanı, header altında başlayan tam genişlikte 3 slaytlık banner carousel ile değiştirmek.
- Slaytlara büyük başlık, kısa açıklama, kategori bağlantılı buton, koyu okuma katmanı, önceki/sonraki okları ve aktif altın nokta göstergeleri eklemek.
- Slaytları 5.5 saniyede otomatik ilerletmek; ok/nokta kullanımında süreyi sıfırlamak, masaüstünde üzerine gelince durdurmak ve mobilde yatay kaydırmayı desteklemek.
- Banner yüksekliğini mobilde ekranın yaklaşık %58'i, masaüstünde ise alttaki güven şeridinden en az 80–100 px görünecek şekilde sınırlamak.
- Gerçek görseller yüklenene kadar RK Collection paletinde, birbirinden ayırt edilebilir sade dokulu koyu placeholder yüzeyler göstermek.

## Yönetim Ekranı
- Site Ayarları içinde “Ana Sayfa Banner’ları” bölümü oluşturmak.
- 3–5 slayt için görsel, başlık, açıklama, buton metni ve bağlantı alanlarını düzenlenebilir yapmak.
- Slayt ekleme, kaldırma ve yukarı/aşağı taşıma kontrolleri eklemek; sınırı 3–5 slayt olarak doğrulamak.
- Görselleri mevcut güvenli banner yükleme akışıyla yüklemek ve tüm slayt listesini ortak site ayarlarında saklamak.
- Eski tek banner ayarları varsa ilk slayta dönüştürerek mevcut içeriği kaybetmemek.

## Teknik Notlar
- Carousel ayrı ve küçük bir bileşen olacak; erişilebilir adlar, klavye ile çalışan kontroller ve hareket azaltma tercihi korunacak.
- Renkler yalnız mevcut semantik tema değişkenlerinden gelecek; açık/koyu tema ve tipografi değişmeyecek.
- Ana sayfadaki güven şeridi ve ürün vitrinleri aynı sırada kalacak.
- Sonuç masaüstü ve mobil görünümde, otomatik geçiş/duraklatma/ok/nokta/kaydırma akışlarıyla doğrulanacak.
