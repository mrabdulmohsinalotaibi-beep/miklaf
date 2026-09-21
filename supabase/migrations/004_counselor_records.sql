-- Unified storage for the transferred Athaat counselor workspace.
CREATE TABLE IF NOT EXISTS public.counselor_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key text NOT NULL CHECK (module_key IN ('cases','interviews','attendance','behavior','referrals','committees','evidences','plan','programs','reports')),
  title text NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS counselor_records_module_idx ON public.counselor_records(module_key, created_at DESC);
CREATE INDEX IF NOT EXISTS counselor_records_student_idx ON public.counselor_records(student_id);
ALTER TABLE public.counselor_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.counselor_records FROM anon;
REVOKE ALL ON TABLE public.counselor_records FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.counselor_records TO authenticated;

CREATE OR REPLACE FUNCTION public.counselor_permission(p_module_key text, p_action text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT CASE p_module_key
    WHEN 'cases' THEN private.has_module_permission('counseling', p_action)
    WHEN 'interviews' THEN private.has_module_permission('counseling', p_action)
    WHEN 'attendance' THEN private.has_module_permission('students', p_action)
    WHEN 'behavior' THEN private.has_module_permission('counseling', p_action)
    WHEN 'referrals' THEN private.has_module_permission('counseling', p_action)
    WHEN 'committees' THEN private.has_module_permission('counseling', p_action)
    WHEN 'evidences' THEN private.has_module_permission('reports', p_action)
    WHEN 'plan' THEN private.has_module_permission('plan', p_action)
    WHEN 'programs' THEN private.has_module_permission('plan', p_action)
    WHEN 'reports' THEN private.has_module_permission('reports', p_action)
    ELSE false
  END;
$$;

CREATE POLICY counselor_records_select ON public.counselor_records
FOR SELECT TO authenticated USING (public.counselor_permission(module_key, 'view'));
CREATE POLICY counselor_records_insert ON public.counselor_records
FOR INSERT TO authenticated WITH CHECK (public.counselor_permission(module_key, 'edit') AND created_by = auth.uid());
CREATE POLICY counselor_records_update ON public.counselor_records
FOR UPDATE TO authenticated USING (public.counselor_permission(module_key, 'edit'))
WITH CHECK (public.counselor_permission(module_key, 'edit'));
CREATE POLICY counselor_records_delete ON public.counselor_records
FOR DELETE TO authenticated USING (public.counselor_permission(module_key, 'delete'));

CREATE TRIGGER counselor_records_set_updated_at BEFORE UPDATE ON public.counselor_records
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

REVOKE ALL ON FUNCTION public.counselor_permission(text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.counselor_permission(text,text) TO authenticated;
