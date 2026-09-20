import { Bell, CalendarRange, ChartPie, Database, FileText, LayoutGrid, ReceiptText, Shield, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const statusPalette = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  critical: "bg-rose-100 text-rose-700",
};

export function SettingsPage() {
  const settings = [
    { label: "إشعارات البريد", value: "مفعلة", tone: "active" },
    { label: "تكامل Supabase", value: "متصل", tone: "active" },
    { label: "حماية RLS", value: "مفعلة", tone: "active" },
    { label: "نسخة احتياطية", value: "تلقائي", tone: "pending" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-slate-500">إعدادات النظام</div>
          <h2 className="mt-1 text-3xl font-black text-slate-900">إدارة الإعدادات</h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {settings.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusPalette[item.tone as keyof typeof statusPalette]}`}>
                {item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات تكامل التطبيق</CardTitle>
          <CardDescription>يتم ربط التطبيق عبر Supabase Auth و REST API مع حماية الوصول عبر RLS.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"><Database size={16} /> قاعدة البيانات</div>
            <div className="text-sm text-slate-600">كل جدول تم تعريفه في supabase/migrations/001_initial.sql</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"><Shield size={16} /> سياسة الأمان</div>
            <div className="text-sm text-slate-600">RLS مفعّل مع صلاحيات مخصصة لكل دور.</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PermissionsPage() {
  const roles = [
    { name: "مدير المدرسة", users: 2, access: "كامل", status: "active" },
    { name: "مشرف الطلاب", users: 4, access: "طالب/إرشاد", status: "active" },
    { name: "الإدارة", users: 3, access: "تقارير", status: "pending" },
    { name: "الموظف", users: 6, access: "قراءة فقط", status: "critical" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-slate-500">الصلاحيات والأدوار</div>
        <h2 className="mt-1 text-3xl font-black text-slate-900">إدارة الأدوار</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roles.map((role) => (
          <Card key={role.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{role.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-500"><span>عدد المستخدمين</span><strong className="text-slate-800">{role.users}</strong></div>
              <div className="flex items-center justify-between text-sm text-slate-500"><span>الصلاحية</span><strong className="text-slate-800">{role.access}</strong></div>
              <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusPalette[role.status as keyof typeof statusPalette]}`}>
                {role.status === "active" ? "نشط" : role.status === "pending" ? "قيد المراجعة" : "محدود"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const cards = [
    { label: "إجمالي الطلاب", value: "1,284", note: "+4.8%", tone: "rose", icon: Users },
    { label: "نسبة الحضور", value: "94.6%", note: "+2.1%", tone: "blue", icon: LayoutGrid },
    { label: "الحالات قيد المتابعة", value: "24", note: "-12.5%", tone: "amber", icon: Bell },
    { label: "المهام المكتملة", value: "86%", note: "+8.4%", tone: "green", icon: ChartPie },
  ];

  const toneMap: Record<string, string> = {
    rose: "bg-rose-100 text-rose-700",
    blue: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="space-y-6">
      <section className="hero-panel relative overflow-hidden rounded-[26px] px-6 py-7 text-white shadow-xl shadow-[#213447]/10 sm:px-9 sm:py-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-[#f5dca9]">
              <Sparkles size={13} /> لوحة القيادة المدرسية
            </div>
            <h2 className="text-[27px] font-black leading-tight tracking-tight sm:text-[32px]">كل ما يهم مدرستك،<br /><span className="text-[#f4cf8e]">في مكان واحد.</span></h2>
            <p className="mt-3 max-w-md text-[13px] leading-7 text-slate-200/75">تابع الأداء ومتابعة الطلاب والتقويم والرسائل مع رؤية موحدة لكل النشاطات المدرسية.</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="text-xs text-slate-200">متوسط الأداء</div>
            <div className="mt-2 text-4xl font-black">92.4%</div>
            <div className="mt-2 text-xs text-emerald-300">+5.2% مقارنة بالأسبوع الماضي</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl ${toneMap[card.tone]}`}><Icon size={18} /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-500">{card.label}</div>
                <div className="mt-2 text-[28px] font-black text-slate-900">{card.value}</div>
                <div className={`mt-3 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${toneMap[card.tone]}`}>{card.note}</div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>تحليل الأداء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 items-end gap-2 rounded-2xl bg-slate-50 p-4">
              {[35, 48, 42, 60, 54, 69, 72, 81, 78, 90, 88, 95].map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-xl bg-gradient-to-t from-[#b85f6c] to-[#d399a1]" style={{ height: `${value}px` }} />
                  <span className="text-[10px] text-slate-400">{index + 1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أحدث الأنشطة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: "تم تحديث خطة الإرشاد", meta: "قبل 12 دقيقة" },
              { title: "تم اعتماد جدول الحصص", meta: "قبل 48 دقيقة" },
              { title: "تم إرسال رسالة للطلاب", meta: "قبل ساعتين" },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <div className="text-sm font-bold text-slate-800">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.meta}</div>
                </div>
                <div className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">مكتمل</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export const tableRowStyle = "border-b border-slate-200 last:border-b-0";

export function StudentsPage() {
  const students = [
    { name: "ريم السعدي", grade: "الصف الثاني", advisor: "سارة الزهراني", status: "حضور ممتاز" },
    { name: "عبدالله الحربي", grade: "الصف الرابع", advisor: "أحمد الفهيد", status: "يحتاج متابعة" },
    { name: "لينا العمر", grade: "الصف السادس", advisor: "نوف القحطاني", status: "مستقر" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-slate-500">سجل الطلاب</div>
        <h2 className="mt-1 text-3xl font-black text-slate-900">إدارة الطلاب</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلاب</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="px-3 py-3 font-medium">الاسم</th>
                <th className="px-3 py-3 font-medium">المرحلة</th>
                <th className="px-3 py-3 font-medium">الموجه</th>
                <th className="px-3 py-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.name} className={tableRowStyle}>
                  <td className="px-3 py-3 font-bold text-slate-800">{student.name}</td>
                  <td className="px-3 py-3">{student.grade}</td>
                  <td className="px-3 py-3">{student.advisor}</td>
                  <td className="px-3 py-3"><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">{student.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export function CounselingPage() {
  const cases = [
    { title: "حالة ضعف في الحضور", student: "عبدالله الحربي", priority: "عالية", status: "قيد المتابعة" },
    { title: "توجيه أكاديمي", student: "ريم السعدي", priority: "متوسطة", status: "مكتمل" },
    { title: "مرافقة نفسية", student: "سارة الناصر", priority: "عالية", status: "جديد" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-slate-500">الإرشاد الطلابي</div>
        <h2 className="mt-1 text-3xl font-black text-slate-900">الحالات الإرشادية</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cases.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-500">
              <div>الطالب: <span className="font-bold text-slate-800">{item.student}</span></div>
              <div>الأولوية: <span className="font-bold text-slate-800">{item.priority}</span></div>
              <div>الحالة: <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">{item.status}</span></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function CalendarPage() {
  const calendarItems = [
    { date: "12 سبتمبر", title: "اجتماع أولياء الأمور" },
    { date: "15 سبتمبر", title: "اختبار نهاية الفصل" },
    { date: "18 سبتمبر", title: "مراجعة الخطة التشغيلية" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-slate-500">التقويم</div>
        <h2 className="mt-1 text-3xl font-black text-slate-900">أحداث المدرسة</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الفعاليات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {calendarItems.map((item) => (
            <div key={item.date} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <div className="text-xs text-slate-500">{item.date}</div>
                <div className="mt-1 font-bold text-slate-800">{item.title}</div>
              </div>
              <div className="rounded-full bg-sky-100 px-2 py-1 text-xs font-bold text-sky-700">مجدول</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function PlanPage() {
  const planItems = [
    { title: "اعتماد خطة الإرشاد", owner: "مدير المدرسة", deadline: "اليوم" },
    { title: "مراجعة خطط الحضور", owner: "مشرف الطلاب", deadline: "غدًا" },
    { title: "تجهيز تقارير الأسبوع", owner: "الإدارة", deadline: "خلال 3 أيام" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-slate-500">الخطة التشغيلية</div>
        <h2 className="mt-1 text-3xl font-black text-slate-900">مؤشرات التنفيذ</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {planItems.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-500">
              <div>المالك: <span className="font-bold text-slate-800">{item.owner}</span></div>
              <div>الموعد: <span className="font-bold text-slate-800">{item.deadline}</span></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function MessagesPage() {
  const messages = [
    { channel: "واتساب", target: "أولياء الأمور", text: "تذكير بمواعيد اللقاء التربوي الأسبوعي", status: "مكتمل" },
    { channel: "SMS", target: "الطلاب", text: "إشعار بتغيير موعد الاختبار", status: "في الانتظار" },
    { channel: "واتساب", target: "المعلمين", text: "تحديثات الخطة التشغيلية", status: "مكتمل" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-slate-500">التواصل والرسائل</div>
        <h2 className="mt-1 text-3xl font-black text-slate-900">مركز الرسائل</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>آخر الرسائل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {messages.map((item) => (
            <div key={`${item.channel}-${item.target}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500">{item.channel}</div>
                  <div className="font-bold text-slate-800">{item.target}</div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">{item.status}</span>
              </div>
              <div className="mt-2 text-sm text-slate-600">{item.text}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function ReportsPage() {
  const reports = [
    { title: "تقرير الحضور الأسبوعي", date: "12 سبتمبر" },
    { title: "ملف الطلاب ذوي الاحتياج", date: "10 سبتمبر" },
    { title: "تقرير النشاط الإرشادي", date: "08 سبتمبر" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-slate-500">التقارير</div>
        <h2 className="mt-1 text-3xl font-black text-slate-900">التقارير والملفات</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.title}>
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm text-slate-500">
              <span>{report.date}</span>
              <FileText size={18} className="text-slate-400" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
