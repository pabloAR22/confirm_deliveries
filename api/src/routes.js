import { Router } from 'express';
import { authenticate, validate } from './middlewares.js';
import { createGuides, listQuery, updateStatus } from './schemas.js';

// Los handlers hablan directamente con Supabase: el query builder ya es la capa de datos
// y la DB (constraints, triggers, RLS) concentra las reglas de negocio.

const HISTORY =
  'history:guide_status_history(from_status, to_status, changed_at, changed_by:profiles(username))';

export const router = Router();
router.use(authenticate);

router.get('/me', async (req, res) => {
  const { data, error } = await req.db.from('profiles').select().eq('id', req.user.sub).single();
  if (error) throw error;
  res.json({ ...data, email: req.user.email });
});

router.get('/guides', validate(listQuery, 'query'), async (req, res) => {
  // Límite conocido: sin paginación; añadir range() cuando haya más de unos cientos de guías
  let query = req.db.from('guides').select().order('created_at', { ascending: false });
  if (req.query.status) query = query.eq('status', req.query.status);
  const { data, error } = await query;
  if (error) throw error;
  res.json(data);
});

router.get('/guides/:id', async (req, res) => {
  const { data, error } = await req.db
    .from('guides')
    .select(`*, ${HISTORY}`)
    .eq('id', req.params.id)
    .order('changed_at', { referencedTable: 'history' })
    .single();
  if (error) throw error;
  res.json(data);
});

// Un solo INSERT: o se guardan todas las guías o ninguna (el legacy guardaba hasta el primer error).
router.post('/guides', validate(createGuides), async (req, res) => {
  const { data, error } = await req.db.from('guides').insert(req.body).select();
  if (error) throw error;
  res.status(201).json(data);
});

router.patch('/guides/:id/status', validate(updateStatus), async (req, res) => {
  const { data, error } = await req.db
    .from('guides')
    .update({ status: req.body.status })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) throw error;
  res.json(data);
});
