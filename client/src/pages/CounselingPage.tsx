import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Download, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCounselorRecord, deleteCounselorRecord, getStoredSession, getCounselorRecords, updateCounselorRecord, type CounselorRecord } from "@/lib/supabase";

type Field = { key: string; label: string; type?: "text" | "date" | "textarea" | "select"; options?: string[] };
type Module = { key: string; title: string; singular: string; fields: Field[] };

const modules: Module[] = [
  { key: "cases", title: "الحالات الإرشادية", singular: "حالة", fields: [
    { key: "student_name", label: "اسم الطالب" }, { key: "domain", label: "المجال", type: "select", options: ["وقائي", "إنمائي", "علاجي", "أكاديمي", "سلوكي", "اجتماعي", "نفسي", "صحي"] },
    { key: "referral_source", label: "مصدر الإحالة", type: "select", options: ["الطالب نفسه", "ولي الأمر", "المعلم", "إدارة المدرسة", "لجنة التوجيه الطلابي"] }, { key: "status", label: "حالة الحالة", type: "select", options: ["مفتوحة", "قيد المتابعة", "مغلقة"] },
    { key: "priority", label: "الأولوية", type: "select", options: ["منخفضة", "متوسطة", "عالية"] }, { key: "summary", label: "ملخص الحالة", type: "textarea" }, { key: "followup_at", label: "موعد المتابعة", type: "date" },
  ] },
  { key: "interviews", title: "المقابلات والتواصل", singular: "مقابلة", fields: [{ key: "student_name", label: "اسم الطالب" }, { key: "date", label: "التاريخ", type: "date" }, { key: "type", label: "نوع المقابلة", type: "select", options: ["فردية", "جماعية", "ولي أمر", "معلم"] }, { key: "channel", label: "وسيلة التواصل", type: "select", options: ["مقابلة", "اتصال هاتفي", "رسالة نصية", "واتساب", "بريد إلكتروني"] }, { key: "topic", label: "موضوع اللقاء" }, { key: "result", label: "النتيجة", type: "textarea" }, { key: "recommendations", label: "التوصيات", type: "textarea" }] },
  { key: "attendance", title: "الحضور والمواظبة", singular: "سجل مواظبة", fields: [{ key: "student_name", label: "اسم الطالب" }, { key: "date", label: "التاريخ", type: "date" }, { key: "case_type", label: "نوع الحالة", type: "select", options: ["غياب", "تأخر", "هروب", "غياب بعذر"] }, { key: "count", label: "عدد الأيام/المرات" }, { key: "action", label: "الإجراء الإرشادي" }, { key: "notes", label: "ملاحظات", type: "textarea" }] },
  { key: "behavior", title: "السلوك والمتابعة", singular: "مخالفة", fields: [{ key: "student_name", label: "اسم الطالب" }, { key: "date", label: "التاريخ", type: "date" }, { key: "observation", label: "الملاحظة/المخالفة" }, { key: "action", label: "الإجراء" }, { key: "result", label: "النتيجة", type: "select", options: ["تحسن", "تحسن جزئي", "تحتاج متابعة", "تمت الإحالة", "أغلقت الحالة"] }, { key: "notes", label: "ملاحظات", type: "textarea" }] },
  { key: "referrals", title: "سجل الإحالات", singular: "إحالة", fields: [{ key: "student_name", label: "اسم الطالب" }, { key: "date", label: "تاريخ الإحالة", type: "date" }, { key: "referred_to", label: "الجهة المحال إليها" }, { key: "reason", label: "سبب الإحالة", type: "textarea" }, { key: "status", label: "الحالة", type: "select", options: ["مرسلة", "قيد المتابعة", "منتهية"] }, { key: "result", label: "نتيجة الإحالة", type: "textarea" }] },
  { key: "committees", title: "اللجان والاجتماعات", singular: "اجتماع", fields: [{ key: "date", label: "التاريخ", type: "date" }, { key: "meeting_type", label: "نوع الاجتماع" }, { key: "attendees", label: "الحضور", type: "textarea" }, { key: "topic", label: "موضوع الاجتماع" }, { key: "decisions", label: "القرارات والتوصيات", type: "textarea" }, { key: "due_date", label: "موعد التنفيذ", type: "date" }] },
  { key: "evidences", title: "الشواهد والتوثيق", singular: "شاهد", fields: [{ key: "name", label: "اسم الشاهد" }, { key: "type", label: "نوع الشاهد", type: "select", options: ["PDF", "صورة", "تقرير", "كشف حضور", "محضر"] }, { key: "linked_type", label: "مرتبط بنوع" }, { key: "linked_ref", label: "رقم السجل المرتبط" }, { key: "status", label: "حالة التوثيق", type: "select", options: ["ناقص", "قيد المراجعة", "معتمد"] }, { key: "description", label: "الوصف", type: "textarea" }] },
  { key: "plan", title: "الخطة التشغيلية", singular: "مهمة", fields: [{ key: "task", label: "المهمة/النشاط" }, { key: "domain", label: "المجال" }, { key: "target_group", label: "الفئة المستهدفة" }, { key: "status", label: "حالة التنفيذ", type: "select", options: ["لم يبدأ", "قيد التنفيذ", "مكتمل", "مؤجل"] }, { key: "due_date", label: "تاريخ الاستحقاق", type: "date" }, { key: "notes", label: "ملاحظات", type: "textarea" }] },
  { key: "programs", title: "البرامج والأنشطة", singular: "برنامج", fields: [{ key: "name", label: "اسم البرنامج" }, { key: "type", label: "النوع", type: "select", options: ["وقائي", "إنمائي", "علاجي"] }, { key: "target_group", label: "الفئة المستهدفة" }, { key: "goal", label: "الهدف", type: "textarea" }, { key: "start_date", label: "تاريخ البداية", type: "date" }, { key: "end_date", label: "تاريخ النهاية", type: "date" }, { key: "status", label: "حالة التنفيذ", type: "select", options: ["لم يبدأ", "قيد التنفيذ", "مكتمل", "مؤجل"] }] },
  { key: "reports", title: "سجل التقارير", singular: "تقرير", fields: [{ key: "name", label: "اسم التقرير" }, { key: "type", label: "نوع التقرير" }, { key: "period", label: "الفترة" }, { key: "status", label: "الحالة", type: "select", options: ["مسودة", "مراجعة", "معتمد"] }, { key: "summary", label: "الملخص", type: "textarea" }] },
];

const emptyRecord = (module: Module) => Object.fromEntries(module.fields.map((field) => [field.key, ""]));

export default function CounselingPage() {
  const session = getStoredSession();
  const [activeKey, setActiveKey] = useState("cases");
  const [rows, setRows] = useState<CounselorRecord[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CounselorRecord | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const active = modules.find((item) => item.key === activeKey) ?? modules[0];

  async function refresh() {
    if (!session?.access_token) return;
    setLoading(true);
    try { setRows(await getCounselorRecords(session.access_token, active.key)); }
    catch (error) { toast.error(error instanceof Error ? error.message : "تعذر تحميل السجلات"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, [activeKey, session?.access_token]);

  const filtered = useMemo(() => rows.filter((row) => `${row.title} ${Object.values(row.data).join(" ")}`.includes(query.trim())), [rows, query]);
  const openNew = () => { setEditing({ id: "", module_key: active.key, title: "", data: {}, created_by: "", created_at: "", updated_at: "" }); setDraft(emptyRecord(active)); };
  const openEdit = (row: CounselorRecord) => { setEditing(row); setDraft({ ...emptyRecord(active), ...row.data }); };
  const save = async () => {
    if (!session?.access_token || !draft[active.fields[0].key]?.trim()) { toast.error(`أدخل ${active.fields[0].label}`); return; }
    try {
      const title = draft[active.fields[0].key].trim();
      if (editing?.id) await updateCounselorRecord(session.access_token, editing.id, title, draft);
      else await createCounselorRecord(session.access_token, active.key, title, draft);
      toast.success("تم حفظ السجل في Supabase"); setEditing(null); await refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر حفظ السجل"); }
  };
  const remove = async (id: string) => { if (!session?.access_token || !window.confirm("هل تريد حذف السجل؟")) return; try { await deleteCounselorRecord(session.access_token, id); toast.success("تم حذف السجل"); await refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر الحذف"); } };
  const exportCsv = () => { const header = active.fields.map((field) => field.label); const lines = [header, ...filtered.map((row) => active.fields.map((field) => row.data[field.key] ?? ""))].map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")); const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${active.key}-records.csv`; a.click(); URL.revokeObjectURL(url); };

  return <div className="space-y-5" dir="rtl"><div className="flex flex-wrap items-end justify-between gap-3"><div><div className="text-sm text-slate-500">الموجّه الطلابي</div><h2 className="mt-1 text-3xl font-black text-slate-900">سجلات الإرشاد الطلابي</h2><p className="mt-2 text-sm text-slate-500">تم نقل وحدات الحالات والمقابلات والمواظبة والسلوك والإحالات واللجان والشواهد والخطة والبرامج والتقارير.</p></div><div className="flex gap-2"><Button onClick={openNew}><Plus size={16}/> إضافة {active.singular}</Button><Button variant="outline" onClick={exportCsv}><Download size={16}/> تصدير CSV</Button></div></div><div className="flex gap-2 overflow-x-auto pb-1">{modules.map((item) => <button key={item.key} onClick={() => { setActiveKey(item.key); setQuery(""); setEditing(null); }} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold ${activeKey === item.key ? "bg-teal-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>{item.title}</button>)}</div><Card><CardHeader className="flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><ClipboardList size={18}/> {active.title} <span className="text-sm font-normal text-slate-400">({filtered.length})</span></CardTitle><div className="relative w-full max-w-xs"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="بحث في السجلات..." className="pr-9"/></div></CardHeader><CardContent>{loading ? <div className="p-8 text-center text-slate-500">جاري تحميل السجلات...</div> : filtered.length === 0 ? <div className="rounded-2xl border border-dashed p-10 text-center text-slate-500">لا توجد سجلات بعد. ابدأ بإضافة أول سجل.</div> : <div className="space-y-3">{filtered.map((row) => <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-slate-50 p-4"><div><div className="font-bold text-slate-800">{row.title}</div><div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">{active.fields.slice(1, 4).map((field) => row.data[field.key] && <span key={field.key} className="rounded-full bg-white px-2 py-1">{field.label}: {row.data[field.key]}</span>)}</div></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => openEdit(row)}><Pencil size={14}/> تعديل</Button><Button variant="outline" size="sm" onClick={() => void remove(row.id)}><Trash2 size={14}/> حذف</Button></div></div>)}</div>}</CardContent></Card>{editing && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"><Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto"><CardHeader className="flex-row items-center justify-between"><CardTitle>{editing.id ? "تعديل" : "إضافة"} {active.singular}</CardTitle><button onClick={() => setEditing(null)} aria-label="إغلاق"><X size={18}/></button></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{active.fields.map((field) => <label key={field.key} className={`block text-sm font-bold text-slate-700 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>{field.label}{field.type === "textarea" ? <Textarea className="mt-1" value={draft[field.key] ?? ""} onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}/> : field.type === "select" ? <select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft[field.key] ?? ""} onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}><option value="">اختر...</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <Input className="mt-1" type={field.type === "date" ? "date" : "text"} value={draft[field.key] ?? ""} onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}/>}</label>)}<div className="flex justify-end gap-2 sm:col-span-2"><Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button><Button onClick={() => void save()}>حفظ السجل</Button></div></CardContent></Card></div>}</div>;
}
