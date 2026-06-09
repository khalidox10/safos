DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    old_price NUMERIC,
    stock INT NOT NULL DEFAULT 5,
    image_url TEXT,
    category UUID REFERENCES categories(id) ON DELETE SET NULL,
    color TEXT,
    tag TEXT,
    description TEXT,
    description_en TEXT,
    description_fr TEXT,
    materials_dimensions TEXT,
    materials_dimensions_en TEXT,
    materials_dimensions_fr TEXT,
    care_guide TEXT,
    care_guide_en TEXT,
    care_guide_fr TEXT,
    additional_images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    show_video BOOLEAN DEFAULT true,
    show_gallery BOOLEAN DEFAULT true,
    show_care_guide BOOLEAN DEFAULT true,
    show_dimensions BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_city TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending', 
    payment_status TEXT NOT NULL DEFAULT 'unpaid', 
    items JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    rating INT NOT NULL DEFAULT 5,
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings DISABLE ROW LEVEL SECURITY;

INSERT INTO categories (id, name_ar, name_fr, name_en)
VALUES 
('11111111-2222-3333-4444-555555555551', 'مجموعة الكانفاس الكلاسيكية', 'Collection Classique', 'Classic Collection'),
('11111111-2222-3333-4444-555555555552', 'الحقائب الصغيرة (Mini Tote)', 'Mini Cabas', 'Mini Tote Bags'),
('11111111-2222-3333-4444-555555555553', 'مجموعة السفر والنزهات', 'Collection Voyage', 'Travel Collection');

INSERT INTO products (id, name, name_en, name_fr, price, old_price, stock, image_url, category, color, tag, description, description_en, description_fr, materials_dimensions, materials_dimensions_en, materials_dimensions_fr, care_guide, care_guide_en, care_guide_fr, additional_images, video_url)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'حقيبة SAFOS - الكانفاس المطرزة الكلاسيكية',
    'SAFOS Classic Embroidered Canvas Tote',
    'Cabas Classique en Canevas Brodé SAFOS',
    1850,
    NULL, 
    5,
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    '11111111-2222-3333-4444-555555555551',
    'بيج × أسود',
    'الأكثر مبيعاً',
    'حقيبة كانفاس من الطراز الأول مصنوعة من خيوط الكتان الثقيل والمقاوم للتلف، مطروزة يدوياً بتصميم هندسي ساحر ومزودة بمقابض جلدية فاخرة.',
    'A high-end canvas tote made of heavy-duty, durable linen, hand-embroidered with a charming geometric pattern and premium leather handles.',
    'Sac cabas en canevas de premier choix fabriqué en fils de lin lourds et résistants, brodé à la main avec un motif géométrique charmant.',
    'المقاس المتوسط (Medium): 36 سم × 27.5 سم × 16.5 سم (تتسع لهاتف آيفون Pro، محفظة متوسطة ومستحضرات تجميل)',
    'Medium Size: 36cm x 27.5cm x 16.5cm (Fits an iPhone Pro, medium wallet, and cosmetics)',
    'Taille Moyenne (Medium): 36cm x 27.5cm x 16.5cm (Convient pour iPhone Pro, portefeuille moyen et cosmétiques)',
    'يُنظف الكانفاس بلطف باستخدام قطعة قماش مبللة بماء دافئ وصابون لطيف. يرجى تجنب غسيل شبكة الكانفاس في الغسالة.',
    'Gently clean the canvas with a damp cloth, warm water, and mild soap. Please avoid machine washing the canvas grid.',
    'Nettoyez délicatement le canevas avec un chiffon humide, de l''eau tiède et du savon doux. Évitez de laver la grille de canevas en machine.',
    '["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"]'::jsonb,
    ''
);

INSERT INTO store_settings (key, value)
VALUES 
('brand', '{"name_ar": "SAFOS", "name_fr": "SAFOS", "name_en": "SAFOS", "subtitle_ar": "ورشة التطريز الفني للكانفاس", "subtitle_fr": "Atelier Brodé", "subtitle_en": "Embroidered Atelier", "logo_letter": "S", "logo_url": ""}'::jsonb),
('colors', '{"primary": "#0A0A0A", "secondary": "#D4AF37", "accent": "#A37A3E", "title_color": "#FFFFFF", "text_color": "#A1A1AA", "card_bg": "#0F0F0F", "accordion_bg": "#0F0F0F", "image_bg": "#0F0F0F", "title_font": "Playfair Display", "body_font": "Montserrat", "admin_bg_color": "#FFFFFF", "admin_card_bg": "#F4F4F5", "admin_text_color": "#18181B", "admin_button_bg_color": "#18181B", "admin_button_text_color": "#FFFFFF", "button_bg_color": "#D4AF37", "button_text_color": "#000000"}'::jsonb),
('contact', '{"phone": "+212 600-000000", "whatsapp": "+212600000000", "email": "contact@safos.online", "address": "مراكش، المغرب", "instagram": "safos.atelier", "facebook": "safos", "tiktok": "safos", "currency": "MAD", "currency_symbol": "د.م"}'::jsonb),
('hero', '{"title_ar": "حقائب كانفاس فاخرة\\nمطروزة يدوياً بشغف مغربي", "title_fr": "Sacs en canevas de luxe\\nbrodés à la main", "title_en": "Luxury Canvas Bags\\nHand-Embroidered", "subtitle_ar": "تألقي بلمسة فنية فريدة", "subtitle_fr": "Sublimez votre style", "subtitle_en": "Elevate your style", "description_ar": "مجموعة حصرية تجمع بين ثوب الكانفاس المتين والتطريز اليدوي الفاخر لتقدم لك حقيبة ترافقك في كل لحظاتك الأنيقة.", "description_fr": "Une collection exclusive mêlant canevas robuste et broderie fine pour un style intemporel.", "description_en": "An exclusive collection combining robust canvas and fine hand-embroidery for a timeless look.", "image": "", "announcement_ar": "شحن مجاني وسريع لجميع المدن المغربية 🇲🇦", "announcement_fr": "Livraison gratuite et rapide partout au Maroc 🇲🇦", "announcement_en": "Free & fast shipping all over Morocco 🇲🇦"}'::jsonb),
('about', '{"title_ar": "قصة ورشتنا الفنية", "title_fr": "L''histoire de notre atelier", "title_en": "Our Atelier Story", "text_ar": "في SAFOS، نؤمن بأن الحقيبة ليست مجرد إكسسوار، بل هي تعبير عن الهوية. كل حقيبة كانفاس في ورشتنا تمر بمراحل غزل وتطريز يدوية دقيقة تأخذ ساعات من الحرفيين المغاربة المهرة لإنتاج تحفة فنية تليق بكِ.", "text_fr": "Chez SAFOS, nous croyons qu''un sac est une expression d''identité. Chaque sac en canevas passe par des étapes minutieuses de tissage et de broderie à la main.", "text_en": "At SAFOS, we believe a bag is not just an accessory, but an expression of identity. Every bag is carefully hand-embroidered by skilled artisans.", "image": ""}'::jsonb),
('pillars', '{"p1_title_ar": "كانفاس متين مقاوم للتلف", "p1_title_fr": "Canevas robuste et durable", "p1_title_en": "Heavy-Duty Canvas", "p1_desc_ar": "نستخدم أجود أنواع كتان الكانفاس الثقيل لضمان بقاء الحقيبة متماسكة لسنوات.", "p1_desc_fr": "Nous utilisons le meilleur lin lourd pour garantir la durabilité du sac.", "p1_desc_en": "We use the finest heavy linen canvas to ensure your bag keeps its shape for years.", "p2_title_ar": "تطريز يدوي فاخر بمراكش", "p2_title_fr": "Broderie fine à Marrakech", "p2_title_en": "Fine Marrakech Embroidery", "p2_desc_ar": "تطرز حقائبنا يدوياً قطعة بقطعة على يد حرفيين مغاربة مبدعين وبخيوط حريرية ممتازة.", "p2_desc_fr": "Chaque sac est brodé pièce par pièce par nos artisans talentueux.", "p2_desc_en": "Every single bag is hand-embroidered by highly skilled local artisans in Marrakech.", "p3_title_ar": "تصميم عملي وواسع", "p3_title_fr": "Design pratique et spacieux", "p3_title_en": "Spacious & Practical", "p3_desc_ar": "مساحة داخلية واسعة لتتسع لجميع أغراضك اليومية ومستلزمات السفر القصيرة.", "p3_desc_fr": "Un espace intérieur généreux pour tous vos essentiels quotidiens.", "p3_desc_en": "A generous interior space perfect for carrying your daily essentials and travel items."}'::jsonb),
('testimonials', '{"t1_name_ar": "أمينة من الدار البيضاء", "t1_name_fr": "Amina de Casablanca", "t1_name_en": "Amina from Casablanca", "t1_text_ar": "الحقيبة رائعة جداً، ثوب الكانفاس ثقيل والوقفة ديالها فخمة بزاف. التطريز متقن تبارك الله عليكم!", "t1_text_fr": "Le sac est magnifique, le tissu en canevas est lourd et le maintien est très luxueux. Félicitations!", "t1_text_en": "The bag is absolutely gorgeous, the canvas is heavy and sturdy. The embroidery is incredibly detailed!", "t1_rating": "5", "t2_name_ar": "سلمى من طنجة", "t2_name_fr": "Salma de Tanger", "t2_name_en": "Salma from Tangier", "t2_text_ar": "شريتها للسفر والعمل، كتهز كلشي وأنيقة بزاف فاللبسة. المعاملة ديالكم راقية وشكراً على التوصيل المجاني.", "t2_text_fr": "Acheté pour le voyage et le travail, il contient tout et est très élégant. Service client haut de gamme.", "t2_text_en": "Perfect for travel and work, it fits everything and is so elegant. Thank you for the free shipping!", "t2_rating": "5"}'::jsonb),
('policies', '{"shipping_ar": "نوفر شحن سريع ومجاني لجميع المدن المغربية. يستغرق التوصيل من 24 إلى 48 ساعة للمدن الكبرى، ومن 2 إلى 4 أيام لباقي المناطق.", "shipping_fr": "Livraison rapide et gratuite dans tout le Maroc sous 24 à 48 heures.", "shipping_en": "We provide free and fast express shipping all over Morocco (24-48h for main cities).", "refund_ar": "نضمن لكم حق استبدال أو استرجاع المنتوج في حالة وجود أي عيب مصنعي خلال 7 أيام من تاريخ الاستلام، بشرط أن تكون الحقيبة بحالتها الأصلية وغير مستعملة.", "refund_fr": "Retour ou échange garanti sous 7 jours en cas de défaut de fabrication.", "refund_en": "Exchange or return guaranteed within 7 days in case of any manufacturing defects.", "copyright": "جميع الحقوق محفوظة لعلامة SAFOS الفاخرة © 2026"}'::jsonb),
('templates', '{"cod_confirm_ar": "السلام عليكم لالة/سيدي *{name}*، نود تأكيد طلبكم رقم *{order_number}* بقيمة *{total}* درهم لحقيبة SAFOS المطرزة. هل العنوان بالمدينة *{city}* صحيح؟", "cod_confirm_fr": "Bonjour *{name}*, nous confirmons votre commande *{order_number}* pour *{total}* MAD. Votre adresse à *{city}* est-elle correctه?", "cod_confirm_en": "Hello *{name}*, we confirm your order *{order_number}* for *{total}* MAD. Is your shipping address in *{city}* correct?", "review_request_ar": "السلام عليكم لالة *{name}*، ممتنون جداً لثقتكِ ببراند SAFOS. نتمنى أن حقيبة الكانفاس قد نالت إعجابكِ. يسعدنا جداً تقييمكِ للحقيبة لتظهر مراجعتكِ في موقعنا: {review_url}", "review_request_fr": "Bonjour *{name}*, nous espérons que votre sac SAFOS vous plaît. Veuillez évaluer votre achat ici: {review_url}", "review_request_en": "Hello *{name}*, we hope you love your SAFOS bag. Please share your feedback and rate your purchase here: {review_url}"}'::jsonb),
('menu_links', '{"menu_p1_ar": "الرئيسية", "menu_p1_fr": "Accueil", "menu_p1_en": "Home", "menu_p1_visible": true, "menu_p2_ar": "حقائب الكانفاس", "menu_p2_fr": "Nos Sacs", "menu_p2_en": "Canvas Bags", "menu_p2_visible": true, "menu_p3_ar": "قصة ورشتنا", "menu_p3_fr": "Notre Atelier", "menu_p3_en": "Atelier Story", "menu_p3_visible": true, "menu_p4_ar": "لماذا نحن؟", "menu_p4_fr": "Pourquoi SAFOS", "menu_p4_en": "Why SAFOS", "menu_p4_visible": true, "menu_p5_ar": "تقييمات العميلات", "menu_p5_fr": "Témoignages", "menu_p5_en": "Testimonials", "menu_p5_visible": true}'::jsonb),
('checkout_fields', '{"field_name_ar": "الاسم الكامل *", "field_name_fr": "Nom complet *", "field_name_en": "Full Name *", "field_name_required": true, "field_name_visible": true, "field_phone_ar": "رقم الهاتف المغربي (10 أرقام) *", "field_phone_fr": "Téléphone (10 chiffres) *", "field_phone_en": "Phone Number (10 digits) *", "field_phone_required": true, "field_phone_visible": true, "field_city_ar": "المدينة وعنوان الشحن *", "field_city_fr": "Ville de livraison *", "field_city_en": "City *", "field_city_required": true, "field_city_visible": true, "field_address_ar": "العنوان بالتفصيل *", "field_address_fr": "Adresse complète *", "field_address_en": "Detailed Address *", "field_address_required": true, "field_address_visible": true, "field_notes_ar": "ملاحظات إضافية (اختياري)", "field_notes_fr": "Notes supplémentaires", "field_notes_en": "Order Notes (Optional)", "field_notes_required": false, "field_notes_visible": true}'::jsonb),
('visibility', '{"show_about_section": true, "show_pillars_section": true, "show_testimonials_section": true, "show_announcement_bar": true}'::jsonb);

INSERT INTO reviews (product_id, customer_name, rating, comment, is_approved)
VALUES ('11111111-1111-1111-1111-111111111111', 'غيثة التازي', 5, 'الحقيبة غزال بزاف وتطريز متقن للغاية، الألوان متناسقة وعجبتني فالسفر. شكراً سابفوس!', true);
