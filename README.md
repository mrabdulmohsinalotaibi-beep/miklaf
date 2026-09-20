# مِكلاف — منصة إدارة المدرسة المستقلة

## المتطلبات

- Node.js 20+
- pnpm
- حساب Supabase مع مشروع جاهز

## التشغيل

1. انسخ الملف `.env.example` إلى `.env` ثم ضع قيمتك الحقيقية:

   ```bash
   cp .env.example .env
   ```

2. أضف قيم:

   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_APP_NAME=Miklaf
   ```

3. أنشئ قاعدة البيانات في Supabase ثم قم بتشغيل ملف migration:

   ```sql
   supabase/migrations/001_initial.sql
   ```

4. ثبّت الحزم:

   ```bash
   pnpm install
   ```

5. شغّل المشروع:

   ```bash
   pnpm dev
   ```

6. لبناء المشروع للإنتاج:

   ```bash
   pnpm build
   ```

## ملاحظات مهمة

- تم إزالة الاعتماد على إعدادات Lovable / Manus من `vite.config.ts`.
- نظام تسجيل الدخول/التسجيل مبني على Supabase Auth REST API عبر البريد وكلمة المرور.
- حماية الوصول داخل قاعدة البيانات مفعلة عبر RLS.
- لوحة التحكم محمية وتمنع الدخول بدون جلسة موجودة.

## هيكل المشروع

- `client/src/App.tsx` — تسجيل الدخول، إنشاء الحساب، إدارة الجلسة، لوحة التحكم.
- `client/src/lib/supabase.ts` — وظائف المصادقة عبر REST.
- `supabase/migrations/001_initial.sql` — مخطط قاعدة البيانات الكامل.
- `client/src/pages/*.tsx` — صفحات المدرسة: الطلاب، التقويم، الخطة، الرسائل، التقارير، الإعدادات، الصلاحيات.
