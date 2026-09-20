import { useState } from "react";
import {
  ArrowUpLeft,
  BookOpenCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  CircleAlert,
  ClipboardList,
  FileText,
  GraduationCap,
  MoreHorizontal,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "إجمالي الطلاب", value: "1,284", delta: "+4.8%", note: "مقارنة بالفصل السابق", icon: Users, tone: "rose", bars: [35, 43, 40, 55, 48, 63, 70, 68, 82, 78, 91, 96] },
  { label: "نسبة الحضور اليوم", value: "94.6%", delta: "+2.1%", note: "من أصل 1,284 طالب", icon: GraduationCap, tone: "blue", bars: [55, 48, 62, 58, 70, 65, 74, 71, 78, 85, 80, 91] },
  { label: "الحالات قيد المتابعة", value: "24", delta: "-12.5%", note: "8 حالات تحتاج إجراء", icon: CircleAlert, tone: "amber", bars: [82, 78, 75, 70, 68, 63, 58, 54, 52, 44, 38, 31] },
  { label: "المهام المكتملة", value: "86%", delta: "+8.4%", note: "هذا الشهر", icon: ClipboardList, tone: "green", bars: [28, 32, 40, 38, 45, 51, 50, 61, 66, 72, 78, 86] },
];

const tasks = [
  { title: "اعتماد خطة التوجيه والإرشاد", meta: "الخطة التشغيلية · اليوم", status: "عاجل", color: "rose", icon: FileText },
  { title: "مراجعة حالات الغياب المتكرر", meta: "شؤون الطلاب · غدًا", status: "قيد التنفيذ", color: "amber", icon: Users },
  { title: "تجهيز تقرير الأسبوع الأول", meta: "التقارير · 18 سبتمبر", status: "مجدول", color: "blue", icon: BookOpenCheck },
];

const activities = [
  { name: "نورة القحطاني", action: "أضافت ملاحظة إرشادية جديدة", time: "منذ 12 دقيقة", initials: "ن", color: "#c76a72" },
  { name: "عبدالله الحربي", action: "اعتمد خطة النشاط الطلابي", time: "منذ 48 دقيقة", initials: "ع", color: "#587f9b" },
  { name: "سارة المطيري", action: "رفعت شاهدًا إلى ملف الإنجاز", time: "منذ ساعتين", initials: "س", color: "#be9760" },
];

export default function Home({ onNavigate }: { onNavigate?: (key: string, label: string) => void }) {
  const [period, setPeriod] = useState("هذا الشهر");
  const [showAllTasks, setShowAllTasks] = useState(false);

  return (
    <div className="px-5 pb-12 pt-7 sm:px-8 lg:px-10 lg:pt-9">
      <section className="hero-panel relative overflow-hidden rounded-[26px] px-6 py-7 text-white shadow-xl shadow-[#213447]/10 sm:px-9 sm:py-8">
        <div className="hero-glow hero-glow-one" /><div className="hero-glow hero-glow-two" />
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-[#f5dca9]"><Sparkles size={13} /> ملخصك اليومي جاهز</div>
            <h2 className="text-[27px] font-black leading-tight tracking-tight sm:text-[32px]">كل ما يهم مدرستك،<br /><span className="text-[#f4cf8e]">في مكان واحد.</span></h2>
            <p className="mt-3 max-w-md text-[13px] leading-7 text-slate-200/75">تابع أداء المدرسة، ووزّع المهام، وابقَ قريبًا من احتياجات طلابك بوضوح وطمأنينة.</p>
          </div>
          <div className="relative flex shrink-0 items-center justify-center lg:ml-8">
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
            <div className="hero-emblem"><BookOpenCheck size={39} strokeWidth={1.35} /><span>إدارة<br />بأثر</span></div>
          </div>
        </div>
        <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5 text-[11px] text-slate-200/75"><span className="inline-flex items-center gap-2"><span className="status-dot bg-emerald-400" /> النظام يعمل بكفاءة</span><span className="h-3 w-px bg-white/15" /><span>آخر مزامنة: منذ 4 دقائق</span><span className="mr-auto hidden items-center gap-1.5 text-[#f4cf8e] sm:flex">العام الدراسي 1446 هـ <ArrowUpLeft size={13} /></span></div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return <article key={stat.label} className="stat-card group">
            <div className="flex items-start justify-between"><div className={`stat-icon ${stat.tone}`}><Icon size={18} /></div><button className="rounded-lg p-1 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600" onClick={() => toast.info(stat.label)} aria-label={`تفاصيل ${stat.label}`}><MoreHorizontal size={17} /></button></div>
            <div className="mt-5 flex items-end justify-between gap-3"><div><div className="text-[12px] font-medium text-slate-500">{stat.label}</div><div className="mt-1 text-[28px] font-black tracking-tight text-[#192c38]">{stat.value}</div></div><div className="sparkline">{stat.bars.map((height, index) => <span key={index} style={{ height: `${height}%` }} className={stat.tone} />)}</div></div>
            <div className="mt-4 flex items-center gap-2 text-[10px]"><span className={`delta ${stat.tone}`}>{stat.delta}</span><span className="text-slate-400">{stat.note}</span></div>
          </article>;
        })}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <article className="panel-card overflow-hidden">
          <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6 sm:px-7"><div><div className="eyebrow">نظرة تحليلية</div><h3 className="mt-1 text-[18px] font-black text-[#192c38]">الحضور والانضباط</h3></div><div className="flex items-center gap-3"><div className="hidden items-center gap-4 text-[10px] text-slate-400 sm:flex"><span className="inline-flex items-center gap-1.5"><i className="legend-dot bg-[#b85e69]" /> الحضور</span><span className="inline-flex items-center gap-1.5"><i className="legend-dot bg-[#e8d5b1]" /> الغياب</span></div><select value={period} onChange={(event) => setPeriod(event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 outline-none"><option>هذا الشهر</option><option>هذا الفصل</option><option>هذا العام</option></select></div></div>
          <div className="px-6 pb-6 pt-3 sm:px-7"><div className="chart-wrap"><div className="chart-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className="chart-area"><div className="chart-grid"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 640 210" preserveAspectRatio="none" className="chart-line"><defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b85e69" stopOpacity=".22" /><stop offset="100%" stopColor="#b85e69" stopOpacity="0" /></linearGradient></defs><path d="M0,101 C37,92 55,111 83,102 S129,69 159,78 S205,97 235,80 S280,37 314,58 S349,84 380,69 S420,41 446,50 S487,75 520,53 S569,31 640,20 L640,210 L0,210 Z" fill="url(#areaFill)" /><path d="M0,101 C37,92 55,111 83,102 S129,69 159,78 S205,97 235,80 S280,37 314,58 S349,84 380,69 S420,41 446,50 S487,75 520,53 S569,31 640,20" fill="none" stroke="#b85e69" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-tooltip"><span>الأحد، 15 سبتمبر</span><strong>94.6%</strong></div><div className="chart-x"><span>1 سبتمبر</span><span>5 سبتمبر</span><span>10 سبتمبر</span><span>15 سبتمبر</span><span>20 سبتمبر</span><span>25 سبتمبر</span><span>30 سبتمبر</span></div></div></div><div className="mt-5 flex items-center justify-between rounded-xl bg-[#faf6ef] px-4 py-3"><div className="flex items-center gap-2 text-[11px] font-medium text-slate-600"><span className="rounded-lg bg-[#f0e2c8] p-1.5 text-[#a47739]"><CalendarDays size={14} /></span> أفضل تحسن كان في الأسبوع الثاني</div><button onClick={() => toast.info("تقرير الحضور قيد التجهيز")} className="text-[11px] font-bold text-[#a94d5b] hover:underline">عرض التقرير <ChevronLeft className="mr-1 inline" size={12} /></button></div></div>
        </article>

        <article className="panel-card">
          <div className="flex items-start justify-between px-6 pb-2 pt-6 sm:px-7"><div><div className="eyebrow">صندوق العمل</div><h3 className="mt-1 text-[18px] font-black text-[#192c38]">المهام القادمة</h3></div><button onClick={() => setShowAllTasks((value) => !value)} className="text-[11px] font-bold text-[#a94d5b] hover:underline">{showAllTasks ? "إخفاء" : "عرض الكل"}</button></div>
          <div className="space-y-2 px-6 pb-4 pt-3 sm:px-7">{(showAllTasks ? [...tasks, { title: "تحديث بيانات فريق المدرسة", meta: "الإدارة · 22 سبتمبر", status: "مجدول", color: "green", icon: ClipboardList }] : tasks).map((task) => { const Icon = task.icon; return <div key={task.title} className="task-row group"><div className={`task-icon ${task.color}`}><Icon size={16} /></div><div className="min-w-0 flex-1"><div className="truncate text-[12px] font-bold text-[#2a3b45]">{task.title}</div><div className="mt-1 text-[10px] text-slate-400">{task.meta}</div></div><span className={`task-status ${task.color}`}>{task.status}</span><button onClick={() => toast.success("تم تحديد المهمة كمكتملة")} className="mr-1 hidden rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 group-hover:block" aria-label="إكمال المهمة"><Check size={13} /></button></div>; })}</div>
          <button onClick={() => onNavigate?.("plan", "الخطة التشغيلية")} className="mx-6 mb-6 flex w-[calc(100%-3rem)] items-center justify-center gap-2 rounded-xl border border-dashed border-[#d6b27a]/60 bg-[#fffbf5] py-3 text-[11px] font-bold text-[#a47739] transition hover:border-[#a47739] hover:bg-[#fff7e9] sm:mx-7 sm:w-[calc(100%-3.5rem)]"><Plus size={15} /> إضافة مهمة جديدة</button>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="panel-card p-6 sm:p-7"><div className="flex items-start justify-between"><div><div className="eyebrow">التقويم</div><h3 className="mt-1 text-[18px] font-black text-[#192c38]">هذا الأسبوع</h3></div><button onClick={() => onNavigate?.("calendar", "التقويم المدرسي")} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal size={18} /></button></div><div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400"><span>أحد</span><span>اثن</span><span>ثلا</span><span>أرب</span><span>خمي</span><span>جمع</span><span>سبت</span></div><div className="mt-2 grid grid-cols-7 gap-1.5 text-center">{[15, 16, 17, 18, 19, 20, 21].map((day, index) => <button onClick={() => toast.info(`مواعيد يوم ${day} سبتمبر`)} key={day} className={`calendar-day ${index === 2 ? "selected" : ""} ${index === 4 ? "has-event" : ""}`}><span>{day}</span>{index === 2 && <small>اليوم</small>}</button>)}</div><div className="mt-5 border-t border-slate-100 pt-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#f8e8e8] p-2.5 text-[#b85e69]"><CalendarDays size={16} /></div><div><div className="text-[11px] font-bold text-[#2a3b45]">اجتماع لجنة التوجيه</div><div className="mt-1 text-[10px] text-slate-400">الثلاثاء، 10:00 صباحًا</div></div><span className="mr-auto h-2 w-2 rounded-full bg-[#b85e69]" /></div></div></article>

        <article className="panel-card overflow-hidden"><div className="flex items-start justify-between px-6 pb-2 pt-6 sm:px-7"><div><div className="eyebrow">آخر المستجدات</div><h3 className="mt-1 text-[18px] font-black text-[#192c38]">نشاط فريق المدرسة</h3></div><button onClick={() => toast.info("سجل التدقيق الكامل قيد التجهيز")} className="text-[11px] font-bold text-[#a94d5b] hover:underline">سجل التدقيق</button></div><div className="divide-y divide-slate-100 px-6 pb-2 pt-3 sm:px-7">{activities.map((activity) => <div key={activity.name} className="flex items-center gap-3 py-3.5"><div className="avatar" style={{ backgroundColor: activity.color }}>{activity.initials}</div><div className="min-w-0 flex-1"><div className="text-[12px] text-[#31424c]"><strong className="font-bold">{activity.name}</strong> <span className="text-slate-500">{activity.action}</span></div><div className="mt-1 text-[10px] text-slate-400">{activity.time}</div></div><button onClick={() => toast.info("تفاصيل النشاط قيد التجهيز")} className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600"><ChevronLeft size={15} /></button></div>)}</div><div className="mx-6 mb-5 rounded-xl bg-[#f5f8fa] px-4 py-3 text-[11px] text-slate-500 sm:mx-7"><span className="font-bold text-[#273b47]">ملاحظة:</span> لديك 3 تحديثات جديدة تحتاج اعتمادك اليوم.</div></article>
      </section>

      <footer className="mt-9 flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 pt-5 text-[10px] text-slate-400 sm:flex-row"><span>© 2025 الذات · منصة إدارة المدرسة بوضوح وأثر</span><span className="inline-flex items-center gap-1.5"><span className="status-dot bg-emerald-500" /> بياناتك محمية ومشفرة</span></footer>
    </div>
  );
}
