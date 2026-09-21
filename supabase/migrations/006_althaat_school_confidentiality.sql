-- Althaat: school tenancy and confidential student records.
CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  school_code text UNIQUE,
  education_type text NOT NULL DEFAULT 'التعليم العام',
  city text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  principal_name text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.school_members (
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin','manager','counselor','vice_principal','activity_supervisor','teacher','staff')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (school_id,user_id)
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.counseling_cases ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE;

INSERT INTO public.schools(name,school_code)
VALUES ('مدرسة الذات التجريبية','ALTHAAT-001')
ON CONFLICT (school_code) DO NOTHING;

DO $$
DECLARE sid uuid;
BEGIN
  SELECT id INTO sid FROM public.schools WHERE school_code='ALTHAAT-001' LIMIT 1;
  UPDATE public.students SET school_id=sid WHERE school_id IS NULL;
  UPDATE public.counseling_cases SET school_id=sid WHERE school_id IS NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.student_sensitive (
  student_id uuid PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  health_status text,
  social_status text,
  notes text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.counseling_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  case_id uuid REFERENCES public.counseling_cases(id) ON DELETE SET NULL,
  interview_date date NOT NULL DEFAULT current_date,
  interview_type text NOT NULL DEFAULT 'فردية',
  confidential_notes text NOT NULL DEFAULT '',
  action_plan text,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='students' AND column_name='health_status') THEN
    EXECUTE 'INSERT INTO public.student_sensitive(student_id,health_status)
             SELECT id,health_status FROM public.students WHERE health_status IS NOT NULL
             ON CONFLICT (student_id) DO UPDATE SET health_status=EXCLUDED.health_status';
    EXECUTE 'ALTER TABLE public.students DROP COLUMN health_status';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='students' AND column_name='social_status') THEN
    EXECUTE 'INSERT INTO public.student_sensitive(student_id,social_status)
             SELECT id,social_status FROM public.students WHERE social_status IS NOT NULL
             ON CONFLICT (student_id) DO UPDATE SET social_status=EXCLUDED.social_status';
    EXECUTE 'ALTER TABLE public.students DROP COLUMN social_status';
  END IF;
END $$;

ALTER TABLE public.student_sensitive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_interviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.student_sensitive, public.counseling_interviews FROM anon, PUBLIC;

CREATE OR REPLACE FUNCTION public.has_permission(p_module text,p_action text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,private AS $$
  SELECT public.is_admin() OR EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.permissions pm ON pm.role=p.role
    WHERE p.id=auth.uid() AND p.is_active
      AND pm.module_name=p_module
      AND CASE p_action WHEN 'view' THEN pm.can_view WHEN 'edit' THEN pm.can_edit WHEN 'delete' THEN pm.can_delete ELSE false END
  );
$$;

CREATE OR REPLACE FUNCTION public.is_counseling_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,private AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id=auth.uid() AND is_active AND role IN ('admin','counselor','manager')
  );
$$;

DROP POLICY IF EXISTS student_sensitive_read ON public.student_sensitive;
DROP POLICY IF EXISTS student_sensitive_write ON public.student_sensitive;
CREATE POLICY student_sensitive_read ON public.student_sensitive FOR SELECT TO authenticated
USING (public.is_admin() OR public.is_counseling_staff());
CREATE POLICY student_sensitive_write ON public.student_sensitive FOR ALL TO authenticated
USING (public.is_admin() OR public.is_counseling_staff())
WITH CHECK (public.is_admin() OR public.is_counseling_staff());

DROP POLICY IF EXISTS counseling_interviews_access ON public.counseling_interviews;
CREATE POLICY counseling_interviews_access ON public.counseling_interviews FOR ALL TO authenticated
USING (public.is_admin() OR public.is_counseling_staff())
WITH CHECK (public.is_admin() OR public.is_counseling_staff());

GRANT SELECT,INSERT,UPDATE,DELETE ON public.student_sensitive,public.counseling_interviews TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(text,text) TO authenticated;
