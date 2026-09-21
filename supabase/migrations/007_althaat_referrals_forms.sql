-- Althaat: referrals, attendance, behavior, notifications and generic forms.
CREATE TABLE IF NOT EXISTS public.student_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  referred_by uuid NOT NULL REFERENCES auth.users(id),
  referred_to uuid REFERENCES auth.users(id),
  source_role text NOT NULL CHECK (source_role IN ('vice_principal','activity_supervisor')),
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','responded','closed','returned')),
  counselor_response text,
  responded_by uuid REFERENCES auth.users(id),
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present','absent','late','excused')),
  minutes_late integer NOT NULL DEFAULT 0 CHECK (minutes_late >= 0),
  notes text,
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id,attendance_date)
);

CREATE TABLE IF NOT EXISTS public.student_behavior (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  event_date date NOT NULL DEFAULT current_date,
  category text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high')),
  description text NOT NULL,
  action_taken text,
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  cycle text NOT NULL CHECK (cycle IN ('daily','weekly','monthly','term','annual','on_demand')),
  module_key text NOT NULL,
  description text,
  schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_system boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.school_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.form_templates(id) ON DELETE SET NULL,
  title text NOT NULL,
  period_start date,
  period_end date,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','returned')),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  submitted_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  returned_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.form_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.form_templates(id) ON DELETE CASCADE,
  assignee_id uuid REFERENCES auth.users(id),
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','overdue','skipped')),
  form_id uuid REFERENCES public.school_forms(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plan_features (
  plan_code text NOT NULL,
  feature_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  PRIMARY KEY(plan_code,feature_key)
);

CREATE TABLE IF NOT EXISTS public.school_subscriptions (
  school_id uuid PRIMARY KEY REFERENCES public.schools(id) ON DELETE CASCADE,
  plan_code text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('trial','active','past_due','cancelled')),
  provider_reference text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referrals_idx ON public.student_referrals(school_id,created_at DESC);
CREATE INDEX IF NOT EXISTS attendance_idx ON public.student_attendance(student_id,attendance_date DESC);
CREATE INDEX IF NOT EXISTS behavior_idx ON public.student_behavior(student_id,event_date DESC);
CREATE INDEX IF NOT EXISTS notifications_idx ON public.notifications(recipient_id,created_at DESC);
CREATE INDEX IF NOT EXISTS forms_idx ON public.school_forms(school_id,status,created_at DESC);

INSERT INTO public.form_templates(name,cycle,module_key,description)
VALUES
('ملخص الأعمال اليومية','daily','reports','قالب عام'),('سجل المتابعة اليومية','daily','counseling','قالب عام'),
('حصر الحالات اليومية','daily','cases','قالب عام'),('متابعة الإحالات اليومية','daily','referrals','قالب عام'),
('متابعة الحضور اليومية','daily','attendance','قالب عام'),('سجل السلوك اليومي','daily','behavior','قالب عام'),
('تقرير التوجيه الأسبوعي','weekly','reports','قالب عام'),('متابعة الحالات الأسبوعية','weekly','cases','قالب عام'),
('ملخص المقابلات الأسبوعي','weekly','interviews','قالب عام'),('ملخص الإحالات الأسبوعي','weekly','referrals','قالب عام'),
('متابعة الغياب الأسبوعية','weekly','attendance','قالب عام'),('متابعة السلوك الأسبوعية','weekly','behavior','قالب عام'),
('خطة العمل الأسبوعية','weekly','plan','قالب عام'),('تقرير الأعمال الشهري','monthly','reports','قالب عام'),
('تقرير الحالات الشهري','monthly','cases','قالب عام'),('تقرير الإحالات الشهري','monthly','referrals','قالب عام'),
('تحليل الغياب الشهري','monthly','attendance','قالب عام'),('تحليل السلوك الشهري','monthly','behavior','قالب عام'),
('تقرير البرامج والأنشطة الشهري','monthly','activity','قالب عام'),('التقرير الفصلي للتوجيه','term','reports','قالب عام'),
('مؤشرات الحالات الفصلية','term','cases','قالب عام'),('مؤشرات الغياب والسلوك الفصلية','term','attendance','قالب عام'),
('تقرير إنجاز الخطة الفصلي','term','plan','قالب عام'),('التقرير السنوي للتوجيه','annual','reports','قالب عام'),
('ملف الإنجاز السنوي','annual','evidence','قالب عام'),('طلب نموذج مخصص','on_demand','custom','قالب عام'),
('نموذج مخصص مدفوع','on_demand','custom_builder','ميزة مدفوعة')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.plan_features(plan_code,feature_key,enabled) VALUES
('free','dashboard',true),('free','custom_forms',false),('free','smart_reports',false),
('free','whatsapp',false),('free','analytics',false),('pro','dashboard',true),
('pro','custom_forms',true),('pro','smart_reports',true),('pro','whatsapp',true),('pro','analytics',true)
ON CONFLICT (plan_code,feature_key) DO UPDATE SET enabled=EXCLUDED.enabled;

ALTER TABLE public.student_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY referrals_read ON public.student_referrals FOR SELECT TO authenticated
USING (public.is_admin() OR public.is_counseling_staff() OR referred_by=auth.uid());
CREATE POLICY referrals_insert ON public.student_referrals FOR INSERT TO authenticated
WITH CHECK (referred_by=auth.uid() AND public.has_permission('counseling','edit'));
CREATE POLICY referrals_counselor_update ON public.student_referrals FOR UPDATE TO authenticated
USING (public.is_admin() OR public.is_counseling_staff())
WITH CHECK (public.is_admin() OR public.is_counseling_staff());

CREATE POLICY attendance_access ON public.student_attendance FOR ALL TO authenticated
USING (public.has_permission('students','view'))
WITH CHECK (public.has_permission('students','edit'));
CREATE POLICY behavior_access ON public.student_behavior FOR ALL TO authenticated
USING (public.has_permission('counseling','view'))
WITH CHECK (public.has_permission('counseling','edit'));
CREATE POLICY notifications_read ON public.notifications FOR SELECT TO authenticated
USING (recipient_id=auth.uid() OR public.is_admin());
CREATE POLICY notifications_update ON public.notifications FOR UPDATE TO authenticated
USING (recipient_id=auth.uid() OR public.is_admin())
WITH CHECK (recipient_id=auth.uid() OR public.is_admin());
CREATE POLICY templates_read ON public.form_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY templates_admin ON public.form_templates FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY forms_access ON public.school_forms FOR ALL TO authenticated
USING (public.has_permission('reports','view') OR public.is_admin())
WITH CHECK (public.has_permission('reports','edit') OR public.is_admin());
CREATE POLICY tasks_access ON public.form_tasks FOR ALL TO authenticated
USING (public.is_admin() OR assignee_id=auth.uid() OR public.has_permission('reports','view'))
WITH CHECK (public.is_admin() OR assignee_id=auth.uid() OR public.has_permission('reports','edit'));
CREATE POLICY features_read ON public.plan_features FOR SELECT TO authenticated USING (true);
CREATE POLICY features_admin ON public.plan_features FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY subscriptions_admin ON public.school_subscriptions FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
