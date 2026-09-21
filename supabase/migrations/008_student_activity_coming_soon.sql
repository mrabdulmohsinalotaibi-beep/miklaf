-- Althaat: activity module foundation only.
-- No UI routes/pages are introduced by this migration.
-- The product UI should expose the module as "النشاط الطلابي — قريباً"
-- until its dedicated pages are implemented.

CREATE TABLE IF NOT EXISTS public.activity_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key text NOT NULL UNIQUE,
  display_name text NOT NULL,
  display_label text NOT NULL DEFAULT 'قريباً',
  enabled boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 50,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.activity_modules(module_key,display_name,display_label,enabled,sort_order,description)
VALUES (
  'student_activity',
  'النشاط الطلابي',
  'قريباً',
  false,
  50,
  'الخطة والأندية والبرامج والميزانية والمشاركون وملف الإنجاز — الواجهة قيد الإعداد.'
)
ON CONFLICT (module_key) DO UPDATE SET
  display_name=EXCLUDED.display_name,
  display_label=EXCLUDED.display_label,
  enabled=EXCLUDED.enabled,
  sort_order=EXCLUDED.sort_order,
  description=EXCLUDED.description,
  updated_at=now();

ALTER TABLE public.activity_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS activity_modules_read ON public.activity_modules;
CREATE POLICY activity_modules_read
ON public.activity_modules
FOR SELECT TO authenticated
USING (true);

REVOKE INSERT, UPDATE, DELETE ON public.activity_modules FROM authenticated;
GRANT SELECT ON public.activity_modules TO authenticated;

COMMENT ON TABLE public.activity_modules IS
'Navigation/catalog metadata only. Do not add activity pages or operational tables here until the activity UI is implemented.';

COMMENT ON COLUMN public.activity_modules.display_label IS
'UI badge shown beside the module name. Current value: قريباً.';
