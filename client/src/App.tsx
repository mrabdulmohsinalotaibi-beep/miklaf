import { useMemo, useState } from "react";
import {
  Bell,
  BookOpenCheck,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Home,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  PanelRightClose,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import HomePage from "./pages/Home";
import { ThemeProvider } from "./contexts/ThemeContext";

export type NavItem = {
  label: string;
  icon: typeof Home;
  key: string;
  badge?: string;
};

const navGroups = [
  {
    title: "نظرة عامة",
    items: [
      { label: "لوحة المتابعة", icon: LayoutDashboard, key: "dashboard" },
      { label: "التقويم المدرسي", icon: CalendarDays, key: "calendar", badge: "3" },
    ],
  },
  {
    title: "المجتمع المدرسي",
    items: [
      { label: "سجل الطلاب", icon: Users, key: "students" },
      { label: "الإرشاد الطلابي", icon: LifeBuoy, key: "counseling" },
      { label: "التواصل والرسائل", icon: MessageSquareText, key: "messages", badge: "8" },
    ],
  },
  {
    title: "التشغيل والتوثيق",
    items: [
      { label: "الخطة التشغيلية", icon: ClipboardCheck, key: "plan" },
      { label: "النماذج والتقارير", icon: FileText, key: "reports" },
      { label: "الصلاحيات والأدوار", icon: ShieldCheck, key: "permissions" },
    ],
  },
];

function App() {
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const activeLabel = useMemo(() => {
    for (const group of navGroups) {
      const item = group.items.find((entry) => entry.key === active);
      if (item) return item.label;
    }
    return "لوحة المتابعة";
  }, [active]);

  const handleNavigation = (key: string, label: string) => {
    setActive(key);
    setSidebarOpen(false);
    if (key === "messages") {
      window.setTimeout(() => document.getElementById("messages-demo")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      return;
    }
    if (key !== "dashboard") toast.info(`قسم ${label} قيد التجهيز`, { description: "ستظهر لك تفاصيله بعد ربط قاعدة البيانات." });
  };

  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <div className="min-h-screen bg-[#f6f7f9] text-[#17212b]" dir="rtl">
          {sidebarOpen && <button className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="إغلاق القائمة" />}

          <aside className={`fixed inset-y-0 right-0 z-40 flex w-[286px] flex-col border-l border-slate-200/70 bg-[#142636] text-white shadow-2xl shadow-slate-950/10 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex items-center justify-between px-6 pb-7 pt-7">
              <div className="flex items-center gap-3">
                <div className="brand-mark"><span>ذ</span></div>
                <div>
                  <div className="text-[21px] font-black tracking-tight">مِكلاف</div>
                  <div className="mt-0.5 text-[10px] font-medium tracking-[0.18em] text-slate-300/75">منصة إدارة المدرسة</div>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 lg:hidden" aria-label="إغلاق القائمة"><X size={18} /></button>
            </div>

            <div className="mx-5 mb-7 rounded-2xl border border-white/10 bg-white/[0.07] p-3.5">
              <div className="flex items-center gap-3">
                <div className="avatar avatar-small">م</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">محمد العتيبي</div>
                  <div className="mt-0.5 truncate text-[11px] text-slate-300/70">مدير المدرسة</div>
                </div>
                <ChevronDown size={15} className="text-slate-400" />
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 pb-5">
              {navGroups.map((group) => (
                <div key={group.title} className="mb-6">
                  <div className="mb-2 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400/70">{group.title}</div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const selected = active === item.key;
                      return (
                        <button key={item.key} onClick={() => handleNavigation(item.key, item.label)} className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-right text-[13px] font-medium transition-all ${selected ? "bg-[#a94d5b] text-white shadow-lg shadow-[#a94d5b]/20" : "text-slate-300 hover:bg-white/[0.07] hover:text-white"}`}>
                          <Icon size={17} strokeWidth={selected ? 2.3 : 1.8} className={selected ? "text-[#ffe2a8]" : "text-slate-400 group-hover:text-slate-200"} />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${selected ? "bg-white/15 text-white" : "bg-[#b85f6c]/20 text-[#f6b8bd]"}`}>{item.badge}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="mt-auto border-t border-white/10 p-4">
              <button onClick={() => toast.info("الإعدادات متاحة بعد تفعيل الحساب")} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white"><Settings2 size={17} className="text-slate-400" /> الإعدادات العامة</button>
              <button onClick={() => toast.info("تم حفظ الجلسة بأمان")} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white"><LogOut size={17} className="text-slate-400" /> تسجيل الخروج</button>
            </div>
          </aside>

          <main className="min-h-screen lg:mr-[286px]">
            <header className="sticky top-0 z-20 flex h-[77px] items-center justify-between border-b border-slate-200/70 bg-[#f6f7f9]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
              <div className="flex min-w-0 items-center gap-3">
                <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="فتح القائمة"><Menu size={19} /></button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400"><Home size={12} /> <span>الرئيسية</span><span className="text-slate-300">/</span><span className="text-[#a94d5b]">{activeLabel}</span></div>
                  <h1 className="mt-1 truncate text-xl font-black tracking-tight text-[#182936] sm:text-[23px]">صباح الخير، محمد <span className="inline-block">👋</span></h1>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 ${searchOpen ? "w-[180px] px-3 sm:w-[250px]" : "w-10"}`}>
                  <button onClick={() => setSearchOpen((value) => !value)} className="shrink-0 p-2 text-slate-500" aria-label="بحث"><Search size={17} /></button>
                  {searchOpen && <input autoFocus className="w-full bg-transparent py-2 text-xs outline-none placeholder:text-slate-400" placeholder="ابحث في المنصة..." />}
                </div>
                <button onClick={() => toast.info("لديك 8 رسائل جديدة")} className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-slate-300 hover:text-[#a94d5b]" aria-label="الإشعارات"><Bell size={17} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#c76a72] ring-2 ring-white" /></button>
                <div className="hidden h-8 w-px bg-slate-200 sm:block" />
                <button onClick={() => toast.info("المدرسة الثانوية النموذجية")} className="hidden items-center gap-2 text-right sm:flex"><div className="text-left"><div className="text-xs font-bold text-[#273b47]">المدرسة الثانوية النموذجية</div><div className="mt-0.5 text-[10px] text-slate-400">العام الدراسي 1446 هـ</div></div><ChevronDown size={14} className="text-slate-400" /></button>
                <div className="avatar">م</div>
              </div>
            </header>

            <HomePage onNavigate={handleNavigation} />
          </main>
          <Toaster position="top-center" richColors />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
