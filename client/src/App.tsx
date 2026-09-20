import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Bell,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquareText,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeProvider } from "./contexts/ThemeContext";
import { getStoredSession, persistSession, signInWithPassword, signOut, signUpWithEmail, type AuthSession } from "@/lib/supabase";
import { DashboardPage } from "./pages/DashboardPage";
import { StudentsPage } from "./pages/StudentsPage";
import { CounselingPage } from "./pages/CounselingPage";
import { CalendarPage } from "./pages/CalendarPage";
import { PlanPage } from "./pages/PlanPage";
import { MessagesPage } from "./pages/MessagesPage";
import { ReportsPage } from "./pages/ReportsPage";
import { PermissionsPage } from "./pages/PermissionsPage";
import { SettingsPage } from "./pages/SettingsPage";

export type ViewName =
  | "dashboard"
  | "calendar"
  | "students"
  | "counseling"
  | "messages"
  | "plan"
  | "reports"
  | "permissions"
  | "settings";

type AuthMode = "login" | "register";

type UserRecord = {
  name: string;
  title: string;
};

const navGroups = [
  {
    title: "نظرة عامة",
    items: [
      { label: "لوحة المتابعة", icon: LayoutDashboard, key: "dashboard" as const },
      { label: "التقويم المدرسي", icon: CalendarDays, key: "calendar" as const },
    ],
  },
  {
    title: "المجتمع المدرسي",
    items: [
      { label: "سجل الطلاب", icon: Users, key: "students" as const },
      { label: "الإرشاد الطلابي", icon: LifeBuoy, key: "counseling" as const },
      { label: "التواصل والرسائل", icon: MessageSquareText, key: "messages" as const },
    ],
  },
  {
    title: "التشغيل والتوثيق",
    items: [
      { label: "الخطة التشغيلية", icon: ClipboardCheck, key: "plan" as const },
      { label: "التقارير", icon: FileText, key: "reports" as const },
      { label: "الصلاحيات والأدوار", icon: ShieldCheck, key: "permissions" as const },
      { label: "الإعدادات", icon: Settings, key: "settings" as const },
    ],
  },
];

const userCard: UserRecord = {
  name: "محمد العتيبي",
  title: "مدير المدرسة",
};

function App() {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());
  const [view, setView] = useState<ViewName>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("admin@miklaf.school");
  const [password, setPassword] = useState("Pass123456");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const pageTitle = useMemo(() => {
    const flat = navGroups.flatMap((group) => group.items);
    return flat.find((item) => item.key === view)?.label ?? "لوحة المتابعة";
  }, [view]);

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthMessage(null);

    try {
      if (authMode === "register") {
        if (!fullName.trim()) {
          throw new Error("يرجى إدخال الاسم الكامل");
        }
        await signUpWithEmail(email, password, fullName.trim());
        setAuthMessage("تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول باستخدام البريد وكلمة المرور.");
        setAuthMode("login");
        setFullName("");
      } else {
        const nextSession = await signInWithPassword(email, password);
        persistSession(nextSession);
        setSession(nextSession);
      }
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (session?.access_token) {
        await signOut(session.access_token);
      }
    } catch {
      // Ignore logout errors, we still clear session locally.
    }
    persistSession(null);
    setSession(null);
    setView("dashboard");
  };

  const renderContent = () => {
    switch (view) {
      case "calendar":
        return <CalendarPage />;
      case "students":
        return <StudentsPage />;
      case "counseling":
        return <CounselingPage />;
      case "messages":
        return <MessagesPage />;
      case "plan":
        return <PlanPage />;
      case "reports":
        return <ReportsPage />;
      case "permissions":
        return <PermissionsPage />;
      case "settings":
        return <SettingsPage />;
      case "dashboard":
      default:
        return <DashboardPage />;
    }
  };

  if (!session) {
    return (
      <ThemeProvider defaultTheme="light">
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8" dir="rtl">
          <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.12)] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="hidden bg-[#142636] p-8 text-white lg:flex lg:flex-col lg:justify-between">
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-lg font-black">م</div>
                  <div>
                    <div className="text-2xl font-black">مِكلاف</div>
                    <div className="text-[10px] tracking-[0.22em] text-slate-300">منصة إدارة المدرسة</div>
                  </div>
                </div>

                <div className="max-w-md">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-amber-200">
                    <GraduationCap size={12} /> النظام المركزي للمدرسة
                  </div>
                  <h1 className="text-4xl font-black leading-tight">إدارة تعليمية فعالة، موثوقة، وتحليلات دقيقة.</h1>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    تتبع الطلاب، الأحوال الإرشادية، التقويم، الرسائل، التقارير، والصلاحيات من مكان واحد في بيئة آمنة.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <div className="flex items-center justify-between"><span>التسجيل عبر Supabase Auth</span><span className="text-emerald-300">مفعل</span></div>
                <div className="flex items-center justify-between"><span>حماية الوصول</span><span className="text-emerald-300">RLS</span></div>
                <div className="flex items-center justify-between"><span>إدارة الجلسة</span><span className="text-emerald-300">محمي</span></div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500">مرحبًا</div>
                  <div className="text-2xl font-black text-slate-900">{authMode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600">
                  {authMode === "login" ? "حساب موجود" : "مستخدم جديد"}
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleAuth}>
                {authMode === "register" && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">الاسم الكامل</label>
                    <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="مثال: محمد العتيبي" />
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
                  <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">كلمة المرور</label>
                  <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
                </div>

                {authMessage && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{authMessage}</div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "جاري المعالجة..." : authMode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
                <span>{authMode === "login" ? "ليس لديك حساب؟" : "لديك حساب؟"}</span>
                <button type="button" className="font-bold text-[#a94d5b]" onClick={() => setAuthMode((prev) => (prev === "login" ? "register" : "login"))}>
                  {authMode === "login" ? "إنشاء حساب" : "تسجيل الدخول"}
                </button>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                <div className="mb-2 font-bold text-slate-700">ملاحظات التشغيل</div>
                <div>1. أضف متغيرات Supabase إلى ملف .env</div>
                <div>2. استخدم البريد وكلمة المرور الحقيقيين في مشروع Supabase</div>
                <div>3. قم بإنشاء جداول قاعدة البيانات من ملف migration</div>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen bg-[#f6f7f9] text-[#17212b]" dir="rtl">
        {sidebarOpen && <button className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm lg:hidden" aria-label="إغلاق القائمة" onClick={() => setSidebarOpen(false)} />}

        <aside className={`fixed inset-y-0 right-0 z-40 flex w-[286px] flex-col border-l border-slate-200/70 bg-[#142636] text-white shadow-2xl shadow-slate-950/10 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
          <div className="flex items-center justify-between px-6 pb-7 pt-7">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#d9838f] via-[#b85f6c] to-[#7a3345] text-lg font-black shadow-lg shadow-[#b85f6c]/40">م</div>
              <div>
                <div className="text-[21px] font-black tracking-tight">مِكلاف</div>
                <div className="mt-0.5 text-[10px] font-medium tracking-[0.18em] text-slate-300/75">منصة إدارة المدرسة</div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 lg:hidden" aria-label="إغلاق القائمة"><X size={18} /></button>
          </div>

          <div className="mx-5 mb-7 rounded-2xl border border-white/10 bg-white/[0.07] p-3.5">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e9b86c] text-xs font-black text-[#1a1b1f]">م</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{userCard.name}</div>
                <div className="mt-0.5 truncate text-[11px] text-slate-300/70">{userCard.title}</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 pb-5">
            {navGroups.map((group) => (
              <div key={group.title} className="mb-6">
                <div className="mb-2 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400/70">{group.title}</div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const selected = view === item.key;
                    return (
                      <button key={item.key} onClick={() => { setView(item.key); setSidebarOpen(false); }} className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-right text-[13px] font-medium transition ${selected ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                        <Icon size={17} strokeWidth={selected ? 2.3 : 1.8} className={selected ? "text-[#ffe2a8]" : "text-slate-400 group-hover:text-slate-200"} />
                        <span className="flex-1">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/10 p-4">
            <button onClick={() => setView("settings")} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium text-slate-200 transition hover:bg-white/5">
              <Settings size={16} />
              <span>الإعدادات</span>
            </button>
            <button onClick={handleLogout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium text-slate-200 transition hover:bg-white/5">
              <LogOut size={16} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        <main className="min-h-screen lg:mr-[286px]">
          <header className="sticky top-0 z-20 flex h-[77px] items-center justify-between border-b border-slate-200/70 bg-[#f6f7f9]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="فتح القائمة">
                <Menu size={18} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400"><LayoutDashboard size={12} /> <span>الرئيسية</span><span className="text-slate-300">/</span><span className="text-slate-500">{pageTitle}</span></div>
                <h1 className="mt-1 truncate text-xl font-black tracking-tight text-[#182936] sm:text-[23px]">صباح الخير، {userCard.name.split(" ")[0]} <span className="inline-block">👋</span></h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 ${searchOpen ? "w-[180px] px-3 sm:w-[250px]" : "w-10"}`}>
                <button onClick={() => setSearchOpen((value) => !value)} className="shrink-0 p-2 text-slate-500" aria-label="بحث"><Search size={17} /></button>
                {searchOpen && <input autoFocus className="w-full bg-transparent py-2 text-xs outline-none placeholder:text-slate-400" placeholder="ابحث في المنصة..." />}
              </div>
              <button className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-slate-300">
                <Bell size={17} />
              </button>
              <div className="hidden h-8 w-px bg-slate-200 sm:block" />
              <div className="hidden items-center gap-2 text-right sm:flex">
                <div className="text-left">
                  <div className="text-[10px] font-medium text-slate-400">المدرسة</div>
                  <div className="text-[12px] font-bold text-slate-700">الثانوية النموذجية</div>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#d9a26c] text-xs font-black text-white">م</div>
              </div>
            </div>
          </header>

          <div className="px-5 pb-12 pt-7 sm:px-8 lg:px-10 lg:pt-9">
            {renderContent()}
          </div>
        </main>
        <Toaster position="top-center" richColors />
      </div>
    </ThemeProvider>
  );
}

export default App;
