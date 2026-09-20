
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

async function readSupabaseError(response: Response) {
  const payload = await response.json().catch(() => ({}));
  return payload?.message || payload?.hint || payload?.details || payload?.error_description || `طلب فشل مع الحالة ${response.status}`;
}

async function supabaseRest<T>(path: string, accessToken: string, init: RequestInit = {}): Promise<T> {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) throw new Error("أضف إعدادات Supabase في ملف .env");
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers || {}),
    },
  });
  if (!response.ok) throw new Error(await readSupabaseError(response));
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

export async function getSchoolSettings(accessToken: string): Promise<SchoolSettings | null> {
  const rows = await supabaseRest<SchoolSettings[]>("school_settings?select=*&id=eq.default-school&limit=1", accessToken);
  return rows?.[0] ?? null;
}

export async function saveSchoolSettings(accessToken: string, settings: SchoolSettings): Promise<SchoolSettings> {
  const rows = await supabaseRest<SchoolSettings[]>("school_settings?on_conflict=id", accessToken, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({ ...settings, id: "default-school" }),
  });
  return rows?.[0] ?? settings;
}
