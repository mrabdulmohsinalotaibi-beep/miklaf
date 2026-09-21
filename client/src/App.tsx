import { useMemo, useState } from "react";
import {
  Bell, Building2, CalendarDays, ClipboardCheck, FileText, GraduationCap,
  LayoutDashboard, LifeBuoy, LogOut, Menu, MessageSquareText, Search,
  Settings, ShieldCheck, Users, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeProvider } from "./contexts/ThemeContext";
import { getStoredSession, persistSession, signInWithPassword, signOut, signUpWithEmail, type AuthSession } from "@/lib/supabase";
import DashboardPage from "./pages/DashboardPage";
import StudentsPage from "./pages/StudentsPage";
import CounselingPage from "./pages/CounselingPage";
import CalendarPage from "./pages/CalendarPage";
import PlanPage from "./pages/PlanPage";
import MessagesPage from "./pages/MessagesPage";
import ReportsPage from "./pages/ReportsPage";
import PermissionsPage from "./pages/PermissionsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SchoolSettingsPage } from "./pages/SchoolSettingsPage";

export type ViewName = "dashboard" | "calendar" | "students" | "counseling" | "messages" | "plan" | "reports" | "permissions" | "settings" | "school-settings";
type AuthMode = "login" | "register";
type UserRecord = { name: string; title: string };

const navGroups: { title: string; items: { label: string; icon: LucideIcon; key: ViewName }[] }[] = [
  { title: "نظرة عامة", items: [{ label: "لوحة المتابعة", icon: LayoutDashboard, key: "dashboard" as const }, { label: "التقويم المدرسي", icon: CalendarDays, key: "calendar" as const }] },
  { title: "المجتمع المدرسي", items: [{ label: "سجل الطلاب", icon: Users, key: "students" as const }, { label: "الإرشاد الطلابي", icon: LifeBuoy, key: "counseling" as const }, { label: "التواصل والرسائل", icon: MessageSquareText, key: "messages" as const }] },
  { title: "التشغيل والتوثيق", items: [{ label: "الخطة التشغيلية", icon: ClipboardCheck, key: "plan" as const }, { label: "التقارير", icon: FileText, key: "reports" as const }, { label: "الصلاحيات والأدوار", icon: ShieldCheck, key: "permissions" as const }, { label: "بيانات المدرسة", icon: Building2, key: "school-settings" as const }, { label: "الإعدادات", icon: Settings, key: "settings" as const }] },
];

const userCard: UserRecord = { name: "محمد العتيبي", title: "مدير المدرسة" };

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

  const pageTitle = useMemo(() => navGroups.flatMap((group) => group.items).find((item) => item.key === view)?.label ?? "لوحة المتابعة", [view]);
  const navigate = (nextView: ViewName) => { setView(nextView); setSidebarOpen(false); };

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setIsSubmitting(true); setAuthMessage(null);
    try {
      if (authMode === "register") {
        if (!fullName.trim()) throw new Error("يرجى إدخال الاسم الكامل");
        await signUpWithEmail(email, password, fullName.trim());
        setAuthMessage("تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول."); setAuthMode("login"); setFullName("");
      } else {
        const nextSession = await signInWithPassword(email, password); persistSession(nextSession); setSession(nextSession);
      }
    } catch (error) { setAuthMessage(error instanceof Error ? error.message : "حدث خطأ غير متوقع"); }
    finally { setIsSubmitting(false); }
  };

  const handleLogout = async () => { try { if (session?.access_token) await signOut(session.access_token); } catch { /* clear local session even if remote logout fails */ } persistSession(null); setSession(null); setView("dashboard"); };

  const renderContent = () => {
    switch (view) {
      case "calendar": return <CalendarPage />;
      case "students": return <StudentsPage />;
      case "counseling": return <CounselingPage />;
      case "messages": return <MessagesPage />;
      case "plan": return <PlanPage />;
      case "reports": return <ReportsPage />;
      case "permissions": return <PermissionsPage />;
      case "settings": return <SettingsPage />;
      case "school-settings": return <SchoolSettingsPage accessToken={session?.access_token ?? ""} />;
      default: return <DashboardPage />;
    }
  };

  if (!session) return <ThemeProvider defaultTheme="light"><div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8" dir="rtl"><div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl lg:grid-cols-[1.15fr_0.85fr]"><div className="login-hero hidden p-8 text-white lg:flex lg:flex-col lg:justify-between"><div><div className="mb-8 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-lg font-black">م</div><div><div className="text-2xl font-black">مِكلاف</div><div className="text-[10px] tracking-[0.22em] text-teal-100">منصة إدارة المدرسة</div></div></div><div className="max-w-md"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-amber-100"><GraduationCap size={14}/> النظام المركزي للمدرسة</div><h1 className="text-4xl font-black leading-tight">إدارة مدرسية أوضح، وأثر تعليمي أكبر.</h1><p className="mt-4 text-sm leading-7 text-teal-50/80">أدر الطلاب والفعاليات والخطط والتقارير والصلاحيات من منصة واحدة.</p></div></div><div className="grid gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm"><div className="flex justify-between"><span>المصادقة الآمنة</span><span className="text-emerald-200">مفعلة</span></div><div className="flex justify-between"><span>حماية البيانات</span><span className="text-emerald-200">RLS</span></div></div></div><div className="p-6 sm:p-10"><div className="mb-8"><div className="text-sm text-slate-500">مرحبًا</div><div className="text-2xl font-black text-slate-900">{authMode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}</div></div><form className="space-y-4" onSubmit={handleAuth}>{authMode === "register" && <label className="block text-sm font-medium text-slate-700">الاسم الكامل<Input className="mt-1" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="مثال: محمد العتيبي" /></label>}<label className="block text-sm font-medium text-slate-700">البريد الإلكتروني<Input className="mt-1" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></label><label className="block text-sm font-medium text-slate-700">كلمة المرور<Input className="mt-1" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" /></label>{authMessage && <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{authMessage}</div>}<Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "جاري المعالجة..." : authMode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}</Button></form><div className="mt-6 text-center text-sm text-slate-500"><span>{authMode === "login" ? "ليس لديك حساب؟" : "لديك حساب؟"} </span><button type="button" className="font-bold text-primary" onClick={() => setAuthMode((previous) => previous === "login" ? "register" : "login")}>{authMode === "login" ? "إنشاء حساب" : "تسجيل الدخول"}</button></div></div></div></div></ThemeProvider>;

  return <ThemeProvider defaultTheme="light"><div className="min-h-screen bg-background text-foreground" dir="rtl">{sidebarOpen && <button className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" aria-label="إغلاق القائمة" onClick={() => setSidebarOpen(false)} />}<aside className="sidebar fixed inset-y-0 right-0 z-40 flex w-[286px] flex-col text-white shadow-2xl"><div className="flex items-center justify-between px-6 pb-7 pt-7"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-500 text-lg font-black">م</div><div><div className="text-[21px] font-black">مِكلاف</div><div className="text-[10px] tracking-[0.18em] text-teal-100/70">منصة إدارة المدرسة</div></div></div><button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-teal-100 lg:hidden" aria-label="إغلاق القائمة"><X size={18}/></button></div><div className="mx-5 mb-7 rounded-2xl border border-white/10 bg-white/[0.07] p-3.5"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-300 text-xs font-black text-teal-950">م</div><div><div className="text-sm font-bold">{userCard.name}</div><div className="text-[11px] text-teal-100/70">{userCard.title}</div></div></div></div><nav className="flex-1 overflow-y-auto px-4 pb-5">{navGroups.map((group) => <div key={group.title} className="mb-6"><div className="mb-2 px-3 text-[10px] font-bold tracking-[0.16em] text-teal-100/50">{group.title}</div><div className="space-y-1">{group.items.map((item) => { const Icon = item.icon; const selected = view === item.key; return <button key={item.key} onClick={() => navigate(item.key)} className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-right text-[13px] transition ${selected ? "bg-teal-500/25 text-white" : "text-teal-50/70 hover:bg-white/10 hover:text-white"}`}><Icon size={17} className={selected ? "text-amber-200" : "text-teal-100/60"}/><span className="flex-1">{item.label}</span></button>; })}</div></div>)}</nav><div className="border-t border-white/10 p-4"><button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-teal-50/80 hover:bg-white/10"><LogOut size={16}/> تسجيل الخروج</button></div></aside><main className="min-h-screen lg:mr-[286px]"><header className="sticky top-0 z-20 flex h-[77px] items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10"><div className="flex items-center gap-3"><button className="rounded-xl border border-border bg-card p-2.5 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="فتح القائمة"><Menu size={18}/></button><div><div className="text-[11px] text-muted-foreground">الرئيسية / {pageTitle}</div><h1 className="mt-1 text-xl font-black sm:text-[23px]">صباح الخير، {userCard.name.split(" ")[0]} 👋</h1></div></div><div className="flex items-center gap-2"><div className={`flex items-center overflow-hidden rounded-xl border border-border bg-card transition-all ${searchOpen ? "w-[220px] px-3" : "w-10"}`}><button onClick={() => setSearchOpen((value) => !value)} className="shrink-0 p-2 text-muted-foreground" aria-label="بحث"><Search size={17}/></button>{searchOpen && <input autoFocus className="w-full bg-transparent py-2 text-xs outline-none" placeholder="ابحث في المنصة..."/>}</div><button className="rounded-xl border border-border bg-card p-2.5 text-muted-foreground" aria-label="الإشعارات"><Bell size={17}/></button></div></header><div className="px-5 pb-12 pt-7 sm:px-8 lg:px-10 lg:pt-9">{renderContent()}</div></main><Toaster position="top-center" richColors/></div></ThemeProvider>;
}
export default App;
