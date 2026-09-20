export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  user: { id: string; email?: string | null; role?: string | null };
};

export type SchoolSettings = {
  id: string;
  school_name: string;
  school_code: string;
  education_type: string;
  city: string;
  phone: string;
  email: string;
  address: string;
  principal_name: string;
  updated_at?: string;
};

const STORAGE_KEY = "miklaf-auth-session";

export function getSupabaseConfig() {
  return {
    url: (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "",
    anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "",
  };
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    return parsed?.access_token ? parsed : null;
  } catch { return null; }
}

export function persistSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(STORAGE_KEY);
}

export function isSessionValid(session: AuthSession | null) {
  if (!session?.access_token) return false;
  return Date.now() < (session.expires_at ?? Date.now() + (session.expires_in || 3600) * 1000);
}

async function readSupabaseError(response: Response) {
  const payload = await response.json().catch(() => ({}));
  return payload?.error_description || payload?.msg || payload?.message || payload?.details || `طلب فشل مع الحالة ${response.status}`;
}

function assertConfig() {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) throw new Error("أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف .env");
  return config;
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const { url, anonKey } = assertConfig();
  const response = await fetch(`${url}/auth/v1/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    body: JSON.stringify({ email, password, data: fullName ? { full_name: fullName } : undefined }),
  });
  if (!response.ok) throw new Error(await readSupabaseError(response));
  return (await response.json()) as { user?: AuthSession["user"]; id?: string };
}

export async function signInWithPassword(email: string, password: string): Promise<AuthSession> {
  const { url, anonKey } = assertConfig();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: anonKey, Authorization: `Bearer ${anonKey}`, Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(await readSupabaseError(response));
  const payload = await response.json() as { access_token: string; refresh_token: string; expires_in: number; user?: AuthSession["user"] };
  return { ...payload, expires_at: Date.now() + (payload.expires_in || 3600) * 1000, user: payload.user ?? { id: "", email } };
}

export async function signOut(accessToken: string) {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !accessToken) return;
  await fetch(`${url}/auth/v1/logout`, { method: "POST", headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, Accept: "application/json" } });
}

async function rest<T>(path: string, accessToken: string, init: RequestInit = {}) {
  const { url, anonKey } = assertConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", Accept: "application/json", ...(init.headers || {}) },
  });
  if (!response.ok) throw new Error(await readSupabaseError(response));
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

export async function getSchoolSettings(accessToken: string) {
  const rows = await rest<SchoolSettings[]>("school_settings?select=*&id=eq.default-school&limit=1", accessToken);
  return rows?.[0] ?? null;
}

export async function saveSchoolSettings(accessToken: string, settings: SchoolSettings) {
  const rows = await rest<SchoolSettings[]>("school_settings?on_conflict=id", accessToken, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({ ...settings, id: "default-school" }),
  });
  return rows?.[0] ?? settings;
}
