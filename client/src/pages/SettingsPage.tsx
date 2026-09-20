import { getStoredSession } from "@/lib/supabase";
import { Bell, ChartPie, Database, LayoutGrid, Shield, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SchoolSettingsPage } from "./SchoolSettingsPage";

const statusPalette = { active: "bg-emerald-100 text-emerald-700", pending: "bg-amber-100 text-amber-700", critical: "bg-rose-100 text-rose-700" };

export function SettingsPage() {
  const session = getStoredSession();
  const settings = [
    { label: "إشعارات البريد", value: "مفعلة", tone: "active" },
    { label: "تكامل Supabase", value: "متصل", tone: "active" },
    { label: "حماية RLS", value: "مفعلة", tone: "active" },
    { label: "النسخ الاحتياطي", value: "تلقائي", tone: "pending" },
  ];
  return <div className="space-y-6">
    <div><div className="text-sm font-medium text-slate-500">إعدادات النظام</div><h2 className="mt-1 text-3xl font-black text-slate-900">إدارة الإعدادات</h2></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{settings.map((item) => <Card key={item.label}><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">{item.label}</CardTitle></CardHeader><CardContent><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusPalette[item.tone as keyof typeof statusPalette]}`}>{item.value}</span></CardContent></Card>)}</div>
    {session?.access_token ? <SchoolSettingsPage accessToken={session.access_token} /> : <Card><CardContent className="p-6 text-sm text-rose-700">انتهت الجلسة، يرجى تسجيل الدخول مجددًا.</CardContent></Card>}
    <Card><CardHeader><CardTitle>معلومات التكامل</CardTitle><CardDescription>قاعدة البيانات محمية عبر Supabase وRLS.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border bg-slate-50 p-4"><div className="mb-2 flex items-center gap-2 font-bold"><Database size={16}/> قاعدة البيانات</div><p className="text-sm text-slate-600">بيانات المدرسة والطلاب محفوظة في Supabase.</p></div><div className="rounded-2xl border bg-slate-50 p-4"><div className="mb-2 flex items-center gap-2 font-bold"><Shield size={16}/> الأمان</div><p className="text-sm text-slate-600">الوصول مقيد بالحساب المسجل.</p></div></CardContent></Card>
  </div>;
}

export function PermissionsPage() {
  const roles = [{ name: "مدير المدرسة", users: 2, access: "كامل", status: "active" }, { name: "مشرف الطلاب", users: 4, access: "طلاب وإرشاد", status: "active" }, { name: "الإدارة", users: 3, access: "تقارير", status: "pending" }, { name: "الموظف", users: 6, access: "قراءة فقط", status: "critical" }];
  return <div className="space-y-6"><div><div className="text-sm font-medium text-slate-500">الصلاحيات والأدوار</div><h2 className="mt-1 text-3xl font-black text-slate-900">إدارة الأدوار</h2></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{roles.map((role) => <Card key={role.name}><CardHeader><CardTitle className="text-base">{role.name}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between text-slate-500"><span>المستخدمون</span><b className="text-slate-800">{role.users}</b></div><div className="flex justify-between text-slate-500"><span>الصلاحية</span><b className="text-slate-800">{role.access}</b></div><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusPalette[role.status as keyof typeof statusPalette]}`}>{role.status === "active" ? "نشط" : role.status === "pending" ? "قيد المراجعة" : "محدود"}</span></CardContent></Card>)}</div></div>;
}

export function DashboardPage() {
  const cards = [{ label: "إجمالي الطلاب", value: "1,284", note: "+4.8%", icon: Users, tone: "rose" }, { label: "نسبة الحضور", value: "94.6%", note: "+2.1%", icon: LayoutGrid, tone: "blue" }, { label: "الحالات قيد المتابعة", value: "24", note: "-12.5%", icon: Bell, tone: "amber" }, { label: "المهام المكتملة", value: "86%", note: "+8.4%", icon: ChartPie, tone: "green" }];
  const tone = { rose: "bg-rose-100 text-rose-700", blue: "bg-sky-100 text-sky-700", amber: "bg-amber-100 text-amber-700", green: "bg-emerald-100 text-emerald-700" };
  return <div className="space-y-6"><section className="hero-panel relative overflow-hidden rounded-[26px] px-6 py-8 text-white sm:px-9"><div className="relative z-10"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-100"><Sparkles size={13}/> لوحة القيادة المدرسية</div><h2 className="text-3xl font-black">كل ما يهم مدرستك،<br/><span className="text-cyan-200">في مكان واحد.</span></h2><p className="mt-3 max-w-md text-sm leading-7 text-slate-200">تابع الأداء والطلاب والتقويم والرسائل من مكان واحد.</p></div></section><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <Card key={card.label}><CardHeader className="pb-2"><div className={`grid h-10 w-10 place-items-center rounded-xl ${tone[card.tone as keyof typeof tone]}`}><Icon size={18}/></div></CardHeader><CardContent><div className="text-sm text-slate-500">{card.label}</div><div className="mt-2 text-3xl font-black">{card.value}</div><span className={`mt-3 inline-flex rounded-full px-2 py-1 text-xs font-bold ${tone[card.tone as keyof typeof tone]}`}>{card.note}</span></CardContent></Card>; })}</section></div>;
}

const simple = (title: string, subtitle: string, items: string[]) => () => <div className="space-y-6"><div><div className="text-sm font-medium text-slate-500">{subtitle}</div><h2 className="mt-1 text-3xl font-black text-slate-900">{title}</h2></div><Card><CardContent className="space-y-3 p-6">{items.map((item) => <div key={item} className="rounded-2xl border bg-slate-50 p-4 font-bold text-slate-700">{item}</div>)}</CardContent></Card></div>;
export const StudentsPage = simple("إدارة الطلاب", "سجل الطلاب", ["ريم السعدي — الصف الثاني — حضور ممتاز", "عبدالله الحربي — الصف الرابع — يحتاج متابعة", "لينا العمر — الصف السادس — مستقر"]);
export const CounselingPage = simple("الحالات الإرشادية", "الإرشاد الطلابي", ["حالة ضعف في الحضور — قيد المتابعة", "توجيه أكاديمي — مكتمل", "مرافقة نفسية — جديد"]);
export const CalendarPage = simple("أحداث المدرسة", "التقويم المدرسي", ["12 سبتمبر — اجتماع أولياء الأمور", "15 سبتمبر — اختبار نهاية الفصل", "18 سبتمبر — مراجعة الخطة التشغيلية"]);
export const PlanPage = simple("مؤشرات التنفيذ", "الخطة التشغيلية", ["اعتماد خطة الإرشاد — اليوم", "مراجعة خطط الحضور — غدًا", "تجهيز تقارير الأسبوع — خلال 3 أيام"]);
export const MessagesPage = simple("مركز الرسائل", "التواصل والرسائل", ["واتساب — أولياء الأمور — مكتمل", "SMS — الطلاب — في الانتظار", "واتساب — المعلمين — مكتمل"]);
export const ReportsPage = simple("التقارير والملفات", "التقارير", ["تقرير الحضور الأسبوعي — 12 سبتمبر", "ملف الطلاب ذوي الاحتياج — 10 سبتمبر", "تقرير النشاط الإرشادي — 08 سبتمبر"]);
