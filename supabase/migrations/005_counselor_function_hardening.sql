-- Keep the counselor permission helper out of the public Supabase API schema.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;
ALTER FUNCTION public.counselor_permission(text, text) SET SCHEMA private;
ALTER FUNCTION private.counselor_permission(text, text) SET search_path = public, private;
REVOKE ALL ON FUNCTION private.counselor_permission(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.counselor_permission(text, text) TO authenticated;
DROP POLICY IF EXISTS counselor_records_select ON public.counselor_records;
DROP POLICY IF EXISTS counselor_records_insert ON public.counselor_records;
DROP POLICY IF EXISTS counselor_records_update ON public.counselor_records;
DROP POLICY IF EXISTS counselor_records_delete ON public.counselor_records;
CREATE POLICY counselor_records_select ON public.counselor_records FOR SELECT TO authenticated USING (private.counselor_permission(module_key, 'view'));
CREATE POLICY counselor_records_insert ON public.counselor_records FOR INSERT TO authenticated WITH CHECK (private.counselor_permission(module_key, 'edit') AND created_by = auth.uid());
CREATE POLICY counselor_records_update ON public.counselor_records FOR UPDATE TO authenticated USING (private.counselor_permission(module_key, 'edit')) WITH CHECK (private.counselor_permission(module_key, 'edit'));
CREATE POLICY counselor_records_delete ON public.counselor_records FOR DELETE TO authenticated USING (private.counselor_permission(module_key, 'delete'));
