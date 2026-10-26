// Tests de integración contra Supabase local: `npx supabase start && npx supabase db reset`.
import { createClient } from '@supabase/supabase-js';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

try {
  process.loadEnvFile();
} catch {
  // en CI las variables vienen del entorno
}
const { app } = await import('../src/app.js');

const api = request(app);
let auth;

const newGuide = (overrides = {}) => ({
  guia: `T${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`,
  ubicacion: 'Calle 1 # 2-3',
  ciudad_destino: 'Pereira',
  departamento_destino: 'Risaralda',
  codigo_postal: '660001',
  telefono_contacto: '3000000000',
  valor_productos: 150000,
  costo_envio: 9000,
  id_proveedor: '007',
  numero_cuenta: '0001234',
  ...overrides,
});

beforeAll(async () => {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'demo@confirm-deliveries.dev',
    password: 'demo1234',
  });
  if (error) throw error;
  auth = { Authorization: `Bearer ${data.session.access_token}` };
});

describe('público', () => {
  it('GET /health', async () => {
    await api.get('/health').expect(200, { status: 'ok' });
  });

  it('ruta inexistente → 404', async () => {
    await api.get('/nada').expect(404);
  });
});

describe('autenticación', () => {
  it('sin token → 401', async () => {
    const res = await api.get('/api/v1/guides').expect(401);
    expect(res.body.message).toBe('Token no enviado');
  });

  it('token inválido → 401', async () => {
    await api.get('/api/v1/guides').set('Authorization', 'Bearer abc.def.ghi').expect(401);
  });

  it('token sin prefijo Bearer → 401', async () => {
    await api.get('/api/v1/guides').set('Authorization', auth.Authorization.slice(7)).expect(401);
  });

  it('GET /me devuelve el perfil', async () => {
    const res = await api.get('/api/v1/me').set(auth).expect(200);
    expect(res.body).toMatchObject({ username: 'demo', email: 'demo@confirm-deliveries.dev' });
  });
});

describe('guías', () => {
  it('lista y filtra por estado', async () => {
    const all = await api.get('/api/v1/guides').set(auth).expect(200);
    expect(all.body.length).toBeGreaterThanOrEqual(5);

    const delivered = await api.get('/api/v1/guides?status=entregada').set(auth).expect(200);
    expect(delivered.body.length).toBeGreaterThan(0);
    expect(delivered.body.every((g) => g.status === 'entregada')).toBe(true);
  });

  it('filtro de estado inválido → 400', async () => {
    await api.get('/api/v1/guides?status=perdida').set(auth).expect(400);
  });

  it('crea guías confirmadas, conservando ceros a la izquierda', async () => {
    const res = await api
      .post('/api/v1/guides')
      .set(auth)
      .send([newGuide(), newGuide()])
      .expect(201);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ status: 'confirmada', numero_cuenta: '0001234' });
  });

  it('datos inválidos → 400 con todos los errores', async () => {
    const res = await api
      .post('/api/v1/guides')
      .set(auth)
      .send([newGuide({ telefono_contacto: '123', costo_envio: 0, extra: 1 })])
      .expect(400);
    expect(res.body.errors).toHaveLength(3);
  });

  it('body vacío o que no es array → 400', async () => {
    await api.post('/api/v1/guides').set(auth).send([]).expect(400);
    await api.post('/api/v1/guides').set(auth).send(newGuide()).expect(400);
  });

  it('guía duplicada → 409 y no se guarda nada del lote', async () => {
    const dup = newGuide();
    await api.post('/api/v1/guides').set(auth).send([dup]).expect(201);

    const fresh = newGuide();
    await api.post('/api/v1/guides').set(auth).send([fresh, dup]).expect(409);

    const list = await api.get('/api/v1/guides').set(auth);
    expect(list.body.some((g) => g.guia === fresh.guia)).toBe(false);
  });

  it('detalle con historial; 404 y 400 por id', async () => {
    const [created] = (await api.post('/api/v1/guides').set(auth).send([newGuide()])).body;

    const res = await api.get(`/api/v1/guides/${created.id}`).set(auth).expect(200);
    expect(res.body.history).toEqual([
      expect.objectContaining({
        from_status: null,
        to_status: 'confirmada',
        changed_by: { username: 'demo' },
      }),
    ]);

    await api.get('/api/v1/guides/00000000-0000-0000-0000-000000000000').set(auth).expect(404);
    await api.get('/api/v1/guides/no-es-uuid').set(auth).expect(400);
  });
});

describe('cambio de estado', () => {
  let id;
  beforeAll(async () => {
    id = (await api.post('/api/v1/guides').set(auth).send([newGuide()])).body[0].id;
  });

  it('transición válida actualiza y registra historial', async () => {
    const res = await api
      .patch(`/api/v1/guides/${id}/status`)
      .set(auth)
      .send({ status: 'en_transito' })
      .expect(200);
    expect(res.body.status).toBe('en_transito');

    const detail = await api.get(`/api/v1/guides/${id}`).set(auth);
    expect(detail.body.history.map((h) => h.to_status)).toEqual(['confirmada', 'en_transito']);
  });

  it('transición inválida → 400', async () => {
    const res = await api
      .patch(`/api/v1/guides/${id}/status`)
      .set(auth)
      .send({ status: 'cancelada' })
      .expect(400);
    expect(res.body.message).toMatch(/no permitida/);
  });

  it('estado desconocido → 400', async () => {
    await api
      .patch(`/api/v1/guides/${id}/status`)
      .set(auth)
      .send({ status: 'perdida' })
      .expect(400);
  });

  it('guía inexistente → 404', async () => {
    await api
      .patch('/api/v1/guides/00000000-0000-0000-0000-000000000000/status')
      .set(auth)
      .send({ status: 'en_transito' })
      .expect(404);
  });
});
