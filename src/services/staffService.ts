import { auth } from '../firebase';
import { API_BASE } from '../config/api';

// Editör atama: yetki Firestore `admins/{uid}` kaydıyla gelir. Bu kayda istemci yazamaz;
// atama / geri alma / listeleme yalnızca yönetici için Worker üzerinden yapılır.
export interface EditorKaydi {
  uid: string;
  name: string;
  email: string;
  phone: string;
  duties: string[];
  assignedAtMs: number;
  assignedByName: string;
}

async function call(action: 'list' | 'assign' | 'revoke', body: Record<string, unknown> = {}): Promise<any> {
  const user = auth.currentUser;
  if (!user) throw new Error('Giriş yapmalısınız.');
  const token = await user.getIdToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/staff/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Bağlantı kurulamadı. İnternetinizi kontrol edin.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) throw new Error(data?.error || 'İşlem yapılamadı. Lütfen tekrar deneyin.');
  return data;
}

export const listEditors = async (): Promise<EditorKaydi[]> => (await call('list')).editors as EditorKaydi[];

export const assignEditor = async (input: { email: string; name: string; phone: string; duties: string[] }): Promise<EditorKaydi> =>
  (await call('assign', input)).editor as EditorKaydi;

export const revokeEditor = async (uid: string): Promise<void> => {
  await call('revoke', { uid });
};
