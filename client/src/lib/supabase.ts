export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  user: {
    id: string;
    email?: string | null;
    role?: string | null;
  };
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
    if (!parsed?.access_token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function persistSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;

  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function isSessionValid(session: AuthSession | null): boolean {
  if (!session?.access_token) return false;
  const expiresAt = session.expires_at ?? Date.now() + (session.expires_in || 3600) * 1000;
  return Date.now() < expiresAt;
}

async function readSupabaseError(response: Response) {
  const payload = await response.json().catch(() => ({}));
  return (
    payload?.error_description ||
    payload?.msg ||
    payload?.error ||
    payload?.message ||
    `طلب فشل مع الحالة ${response.status}`
  );
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) {
    throw new Error("أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف .env");
  }

  const response = await fetch(`${url}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      email,
      password,
      data: fullName ? { full_name: fullName } : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(await readSupabaseError(response));
  }

  return (await response.json()) as { user?: AuthSession["user"]; id?: string };
}

export async function signInWithPassword(email: string, password: string): Promise<AuthSession> {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) {
    throw new Error("أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف .env");
  }

  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await readSupabaseError(response));
  }

  const payload = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user?: AuthSession["user"];
  };

  return {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    expires_in: payload.expires_in,
    expires_at: Date.now() + (payload.expires_in || 3600) * 1000,
    user: payload.user ?? { id: "", email },
  };
}

export async function signOut(accessToken: string) {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey || !accessToken) {
    return;
  }

  await fetch(`${url}/auth/v1/logout`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}
