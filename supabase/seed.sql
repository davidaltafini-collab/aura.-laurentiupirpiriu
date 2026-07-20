-- Opțional: populează tabela projects cu aceleași proiecte placeholder pe care
-- le vezi local (din src/data.ts), ca site-ul să arate identic imediat ce
-- conectezi Supabase. Rulează asta în SQL Editor DUPĂ schema.sql.
-- Când vine conținutul real de la client, editează/șterge aceste rânduri din
-- Admin (/admin) — nu mai e nevoie să atingi SQL-ul din nou.

insert into projects (slug, title_ro, title_en, location, event_date, cover_image_url, gallery_image_urls, description_ro, description_en, featured, sort_order)
values
  ('lake-como-romance', 'Poveste la Lacul Como', 'Lake Como Romance', 'Lacul Como, Italia', 'Septembrie 2026',
   '/placeholders/wedding-1.jpg',
   array['/placeholders/wedding-2.jpg','/placeholders/wedding-3.jpg','/placeholders/wedding-4.jpg'],
   'O celebrare elegantă și atemporală pe malul Lacului Como. Lumina schimbătoare peste apă și vila istorică au oferit un decor cinematic pentru o poveste de dragoste plină de grație și bucurie.',
   'An elegant, timeless celebration on the shores of Lake Como. The changing light over the water and the historic villa provided a cinematic backdrop for a love story filled with grace and joy.',
   true, 0),

  ('tuscany-estate', 'Domeniul din Toscana', 'Tuscany Estate', 'Florența, Italia', 'Iulie 2026',
   '/placeholders/wedding-5.jpg',
   array['/placeholders/wedding-4.jpg','/placeholders/wedding-5.jpg','/placeholders/wedding-6.jpg'],
   'O nuntă rustică, dar rafinată, în dealurile line ale Toscanei. Ora de aur a învăluit viile într-o lumină caldă, în perfectă armonie cu energia vibrantă a cuplului.',
   'A rustic yet refined wedding set amidst the rolling hills of Tuscany. The golden hour cast a warm glow over the vineyards, perfectly matching the couple''s vibrant energy.',
   true, 1),

  ('alpine-elopement', 'Elopement Alpin', 'Alpine Elopement', 'Alpii Elvețieni', 'Ianuarie 2026',
   '/placeholders/wedding-5.jpg',
   array['/placeholders/wedding-1.jpg','/placeholders/wedding-7.jpg','/placeholders/wedding-2.jpg'],
   'Un elopement intim și spectaculos, sus în vârfurile înzăpezite ale Alpilor Elvețieni. Aerul tăios și priveliștile montane dramatice au făcut fiecare cadru să pară monumental.',
   'A breathtaking, intimate elopement high in the snowy peaks of the Swiss Alps. The crisp air and dramatic mountain views made every frame feel epic and monumental.',
   true, 2),

  ('desert-mirage', 'Miraj în Deșert', 'Desert Mirage', 'Joshua Tree, SUA', 'Octombrie 2025',
   '/placeholders/wedding-3.jpg',
   array['/placeholders/wedding-5.jpg','/placeholders/wedding-5.jpg','/placeholders/wedding-2.jpg'],
   'Nuanțe calde de deșert și un stil minimalist au adus o notă boemă, modernă acestei celebrări sub cerul vast și deschis din Joshua Tree.',
   'Warm desert hues and minimalist styling brought a unique, modern bohemian vibe to this celebration under the vast open skies of Joshua Tree.',
   true, 3),

  ('coastal-breeze', 'Briză de Coastă', 'Coastal Breeze', 'Coasta Amalfi, Italia', 'August 2025',
   '/placeholders/wedding-6.jpg',
   array['/placeholders/wedding-5.jpg','/placeholders/wedding-7.jpg','/placeholders/wedding-2.jpg'],
   'Jurăminte pe stâncile de deasupra Mării Tireniene. Culorile vibrante ale Coastei Amalfi s-au împletit perfect cu estetica pasională și vie a cuplului.',
   'Cliffside vows overlooking the Tyrrhenian Sea. The vibrant colors of the Amalfi Coast blended seamlessly with the couple''s passionate, lively aesthetic.',
   true, 4),

  ('urban-chic', 'Șic Urban', 'Urban Chic', 'New York City', 'Mai 2025',
   '/placeholders/wedding-2.jpg',
   array['/placeholders/wedding-4.jpg','/placeholders/wedding-3.jpg','/placeholders/wedding-1.jpg'],
   'O petrecere elegantă și modernă într-un loft din Manhattan. Skyline-ul orașului a oferit un contrast arhitectural dramatic pentru romantismul delicat al serii.',
   'A sleek, modern affair in a Manhattan loft. The city skyline offered a dramatic, architectural contrast to the delicate romance of the evening.',
   true, 5)
on conflict (slug) do nothing;
