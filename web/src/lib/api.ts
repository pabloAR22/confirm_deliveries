import { createClient } from '@supabase/supabase-js';
import type { Status } from './status';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type GuideInput = {
  guia: string;
  ubicacion: string;
  ciudad_destino: string;
  departamento_destino: string;
  codigo_postal: string;
  telefono_contacto: string;
  valor_productos: number;
  costo_envio: number;
  id_proveedor: string;
  numero_cuenta: string;
  observaciones?: string;
  linea_contacto?: string;
};

export type Guide = GuideInput & {
  id: string;
  status: Status;
  created_at: string;
  updated_at: string;
};

export type HistoryEntry = {
  from_status: Status | null;
  to_status: Status;
  changed_at: string;
  changed_by: { username: string } | null;
};

export type GuideDetail = Guide & { history: HistoryEntry[] };

export class ApiError extends Error {
  errors: string[];
  constructor(message: string, errors: string[] = []) {
    super(message);
    this.errors = errors;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.session?.access_token}`,
      },
    });
  } catch {
    throw new ApiError('No se pudo conectar con la API. Revisa tu conexión e inténtalo de nuevo.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.message ?? `Error ${res.status}`, body.errors);
  return body as T;
}

export const api = {
  listGuides: () => request<Guide[]>('/guides'),
  getGuide: (id: string) => request<GuideDetail>(`/guides/${id}`),
  createGuides: (guides: GuideInput[]) =>
    request<Guide[]>('/guides', { method: 'POST', body: JSON.stringify(guides) }),
  updateStatus: (id: string, status: Status) =>
    request<Guide>(`/guides/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
