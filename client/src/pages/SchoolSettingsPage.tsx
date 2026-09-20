import { useEffect, useState } from "react";
import { Building2, CheckCircle2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSchoolSettings, saveSchoolSettings, type SchoolSettings } from "@/lib/supabase";

const initialSettings: SchoolSettings = {
  id: "default-school",
  school_name: "الثانوية النموذجية",
  school_code: "SCH-001",
  education_type: "التعليم العام",
  city: "الرياض",
  phone: "",
  email: "",
  address: "",
  principal_name: "محمد العتيبي",
};

export function SchoolSettingsPage({ accessToken }: { accessToken: string }) {
  const [form, setForm] = useState<SchoolSettings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getSchoolSettings(accessToken)
      .then((settings) => {
        if (active && settings) setForm({ ...initialSettings, ...settings });
      })
      .catch(() => toast.error("تعذر تحميل بيانات المدرسة"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [accessToken]);

  const update = (key: keyof SchoolSettings, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.school_name.trim()) {
      toast.error("اسم المدرسة مطلوب");
      return;
    }
    setSaving(true);
    try {
      const saved = await saveSchoolSettings(accessToken, form);
      setForm({ ...initialSettings, ...saved });
      toast.success("تم حفظ بيانات المدرسة بنجاح");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حفظ البيانات");
    } finally {
      setSaving(false);
    }
  };

  const fields: Array<[keyof SchoolSettings, string, string]> = [
    ["school_name", "اسم المدرسة", "مثال: الثانوية النموذجية"],
    ["school_code", "رمز المدرسة", "SCH-001"],
    ["education_type", "نوع التعليم", "التعليم العام"],
    ["city", "المدينة", "الرياض"],
    ["phone", "هاتف المدرسة", "0110000000"],
    ["email", "البريد الرسمي", "school@example.com"],
    ["address", "العنوان", "الحي والشارع"],
    ["principal_name", "اسم قائد المدرسة", "الاسم الكامل"],
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-slate-500">إعدادات المدرسة</div>
        <h2 className="mt-1 text-3xl font-black text-slate-900">بيانات المدرسة</h2>
        <p className="mt-2 text-sm text-slate-500">حدّث البيانات التي تظهر في لوحة المتابعة والتقارير.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 size={20} /> المعلومات الأساسية</CardTitle>
          <CardDescription>يمكن لمدير المدرسة تعديل هذه البيانات وحفظها مباشرة في قاعدة البيانات.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 className="animate-spin" size={18} /> جاري تحميل البيانات...</div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                {fields.map(([key, label, placeholder]) => (
                  <label key={key} className="space-y-1.5 text-sm font-medium text-slate-700">
                    <span>{label}{key === "school_name" && <b className="text-rose-600"> *</b>}</span>
                    <Input value={String(form[key] ?? "")} placeholder={placeholder} onChange={(event) => update(key, event.target.value)} />
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-xs text-emerald-700"><CheckCircle2 size={16} /> الحفظ محمي بصلاحيات الحساب</div>
                <Button type="submit" disabled={saving}><Save size={16} /> {saving ? "جاري الحفظ..." : "حفظ التغييرات"}</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SchoolSettingsPage;
