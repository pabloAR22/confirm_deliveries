import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('Faltan SUPABASE_URL o SUPABASE_PUBLISHABLE_KEY');

const options = { auth: { persistSession: false, autoRefreshToken: false } };

// Solo para verificar tokens (getClaims usa el JWKS del proyecto, cacheado).
export const authClient = createClient(url, key, options);

// Cliente que actúa como el usuario: RLS, created_by y changed_by dependen de su token.
export const clientFor = (token) =>
  createClient(url, key, { ...options, global: { headers: { Authorization: `Bearer ${token}` } } });
