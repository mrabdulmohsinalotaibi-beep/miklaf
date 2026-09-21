-- Miklaf security hardening.
-- Run after 001_initial.sql and 002_school_settings.sql.
-- Removes broad authenticated-user access from all application tables.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_module_permission(
  p_module_name text,
  p_action text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.profiles pr
    JOIN public.permissions pm ON pm.role = pr.role
    WHERE pr.id = auth.uid()
      AND pr.is_active = true
      AND pm.module_name = p_module_name
      AND CASE p_action
        WHEN 'view' THEN pm.can_view
        WHEN 'edit' THEN pm.can_edit
        WHEN 'delete' THEN pm.can_delete
        ELSE false
      END
  );
$$;

-- Remove every current policy from the application tables. This is
-- intentional: it also removes permissive policies added under other names.
DO $$
DECLARE
  t text;
  p record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'permissions', 'students', 'counseling_cases',
    'school_calendar', 'operational_plans', 'messages', 'reports',
    'audit_logs', 'school_settings'
  ] LOOP
    FOR p IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
    END LOOP;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', t);
  END LOOP;
END $$;

-- Never expose application tables to unauthenticated API calls.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon;

-- Profiles: users may read their own profile; only an admin may manage others.
CREATE POLICY profiles_select_own_or_admin
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY profiles_update_own_or_admin
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (
  public.is_admin()
  OR (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
);

CREATE POLICY profiles_admin_insert
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY profiles_admin_delete
ON public.profiles FOR DELETE TO authenticated
USING (public.is_admin());

-- Permission catalog: users see only their own role's entries; admins manage it.
CREATE POLICY permissions_role_read
ON public.permissions FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR role = (SELECT pr.role FROM public.profiles pr WHERE pr.id = auth.uid() AND pr.is_active = true)
);

CREATE POLICY permissions_admin_manage
ON public.permissions FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Student records.
CREATE POLICY students_view_by_role
ON public.students FOR SELECT TO authenticated
USING (public.has_module_permission('students', 'view'));

CREATE POLICY students_edit_by_role
ON public.students FOR INSERT TO authenticated
WITH CHECK (public.has_module_permission('students', 'edit'));

CREATE POLICY students_update_by_role
ON public.students FOR UPDATE TO authenticated
USING (public.has_module_permission('students', 'edit'))
WITH CHECK (public.has_module_permission('students', 'edit'));

CREATE POLICY students_delete_by_role
ON public.students FOR DELETE TO authenticated
USING (public.has_module_permission('students', 'delete'));

-- Counselor records.
CREATE POLICY counseling_view_by_role
ON public.counseling_cases FOR SELECT TO authenticated
USING (public.has_module_permission('counseling', 'view'));

CREATE POLICY counseling_insert_by_role
ON public.counseling_cases FOR INSERT TO authenticated
WITH CHECK (public.has_module_permission('counseling', 'edit'));

CREATE POLICY counseling_update_by_role
ON public.counseling_cases FOR UPDATE TO authenticated
USING (public.has_module_permission('counseling', 'edit'))
WITH CHECK (public.has_module_permission('counseling', 'edit'));

CREATE POLICY counseling_delete_by_role
ON public.counseling_cases FOR DELETE TO authenticated
USING (public.has_module_permission('counseling', 'delete'));

-- Calendar, operational plans, messages, and reports use the same explicit
-- role permission model. Message recipients are not visible to users without
-- the messages view permission.
CREATE POLICY calendar_view_by_role ON public.school_calendar
FOR SELECT TO authenticated USING (public.has_module_permission('calendar', 'view'));
CREATE POLICY calendar_insert_by_role ON public.school_calendar
FOR INSERT TO authenticated WITH CHECK (public.has_module_permission('calendar', 'edit'));
CREATE POLICY calendar_update_by_role ON public.school_calendar
FOR UPDATE TO authenticated USING (public.has_module_permission('calendar', 'edit'))
WITH CHECK (public.has_module_permission('calendar', 'edit'));
CREATE POLICY calendar_delete_by_role ON public.school_calendar
FOR DELETE TO authenticated USING (public.has_module_permission('calendar', 'delete'));

CREATE POLICY plan_view_by_role ON public.operational_plans
FOR SELECT TO authenticated USING (public.has_module_permission('plan', 'view'));
CREATE POLICY plan_insert_by_role ON public.operational_plans
FOR INSERT TO authenticated WITH CHECK (public.has_module_permission('plan', 'edit'));
CREATE POLICY plan_update_by_role ON public.operational_plans
FOR UPDATE TO authenticated USING (public.has_module_permission('plan', 'edit'))
WITH CHECK (public.has_module_permission('plan', 'edit'));
CREATE POLICY plan_delete_by_role ON public.operational_plans
FOR DELETE TO authenticated USING (public.has_module_permission('plan', 'delete'));

CREATE POLICY messages_view_by_role ON public.messages
FOR SELECT TO authenticated USING (public.has_module_permission('messages', 'view'));
CREATE POLICY messages_insert_by_role ON public.messages
FOR INSERT TO authenticated WITH CHECK (public.has_module_permission('messages', 'edit'));
CREATE POLICY messages_update_by_role ON public.messages
FOR UPDATE TO authenticated USING (public.has_module_permission('messages', 'edit'))
WITH CHECK (public.has_module_permission('messages', 'edit'));
CREATE POLICY messages_delete_by_role ON public.messages
FOR DELETE TO authenticated USING (public.has_module_permission('messages', 'delete'));

CREATE POLICY reports_view_by_role ON public.reports
FOR SELECT TO authenticated USING (public.has_module_permission('reports', 'view'));
CREATE POLICY reports_insert_by_role ON public.reports
FOR INSERT TO authenticated WITH CHECK (public.has_module_permission('reports', 'edit'));
CREATE POLICY reports_update_by_role ON public.reports
FOR UPDATE TO authenticated USING (public.has_module_permission('reports', 'edit'))
WITH CHECK (public.has_module_permission('reports', 'edit'));
CREATE POLICY reports_delete_by_role ON public.reports
FOR DELETE TO authenticated USING (public.has_module_permission('reports', 'delete'));

-- Audit logs are administrator-only and cannot be changed from the client.
CREATE POLICY audit_logs_admin_read
ON public.audit_logs FOR SELECT TO authenticated
USING (public.is_admin());

-- School settings are administrator-only; remove the seeded public-client path.
CREATE POLICY school_settings_admin_read
ON public.school_settings FOR SELECT TO authenticated
USING (public.is_admin());
CREATE POLICY school_settings_admin_insert
ON public.school_settings FOR INSERT TO authenticated
WITH CHECK (public.is_admin());
CREATE POLICY school_settings_admin_update
ON public.school_settings FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY school_settings_admin_delete
ON public.school_settings FOR DELETE TO authenticated
USING (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_module_permission(text, text) TO authenticated;

COMMENT ON FUNCTION public.has_module_permission(text, text)
IS 'RLS helper: grants access only when the signed-in active profile has the requested module permission.';
