# RK Stil Danışmanı

## Deneyim
- Mağazaya “Stil Danışmanı” sayfası ve masaüstü/mobil gezinme bağlantısı eklenecek.
- Kullanıcı beden, bütçe, renk, kullanım amacı veya aradığı tarzı serbest metinle yazabilecek.
- Danışman yalnızca RK Collection kataloğundaki gerçek ürünleri önerecek; önerilen ürünler görsel, fiyat ve ürün sayfası bağlantısıyla gösterilecek.
- Yanıtlar akış halinde gelecek; bekleme, durdurma, hata ve yeniden deneme durumları açıkça gösterilecek.
- Mevcut siyah–krem–altın tema ve tipografi korunacak; mobil kullanım öncelikli olacak.

## Tek görüşme ve hesapta saklama
- Kullanıcı başına tek danışman görüşmesi tutulacak; farklı cihazda giriş yaptığında geçmişi geri gelecek.
- Giriş yapmamış ziyaretçi danışman sayfasında güvenli giriş ekranı görecek.
- Mesajlar yalnızca sahibi tarafından okunup değiştirilebilecek; kayıt erişimi hesap kimliğiyle sınırlandırılacak.
- “Görüşmeyi temizle” işlemi kullanıcı onayıyla geçmişi sıfırlayacak.

## Ürün öneri akışı
- Model çağrısı AI Gateway üzerinden sunucuda, `openai/gpt-6-astra` ile yapılacak; anahtar ve katalog yönergeleri tarayıcıya gönderilmeyecek.
- Her istekte güncel katalog adı, kategori, renk, beden/stok ve fiyat bilgileri modele bağlam olarak verilecek.
- Modelin önerdiği ürün kimlikleri doğrulanacak; katalogda olmayan ürün veya fiyat gösterilmeyecek.
- Kredi, erişim, hız sınırı ve geçici servis hataları güvenli mesajlarla gösterilecek; terminal hatalar otomatik tekrarlanmayacak.

## Teknik ve güvenlik
- AI Elements konuşma, mesaj ve yazma alanı bileşenleri kurulacak ve mevcut tasarım token’larına uyarlanacak.
- Kullanıcıya ait tek görüşme kaydı için korumalı bir backend tablosu ve satır düzeyi erişim kuralları eklenecek.
- Akış endpoint’i oturumu doğrulayacak, tamamlanan kullanıcı/asistan mesajlarını aynı görüşmeye kaydedecek ve ürün önerilerini yapılandırılmış mesaj parçaları olarak döndürecek.

## Doğrulama
- Giriş, ilk mesaj, akışlı yanıt, ürün kartına geçiş, yenileme sonrası geçmişin geri gelmesi ve görüşmeyi temizleme test edilecek.
- Açık/koyu tema ile mobil/masaüstü görünüm; hata mesajları ve derleme sonucu kontrol edilecek.
