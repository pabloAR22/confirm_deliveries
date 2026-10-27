import { useState, type FormEvent } from 'react';
import { GuideLabel } from './GuideLabel';
import { auth, type GuideDetail } from './lib/api';

// Límite conocido: sin registro en la UI, solo la cuenta demo (evita basura en la demo pública).
// Para abrirlo: auth.signUp({ email, password, options: { data: { username } } }).
const DEMO = { email: 'demo@confirm-deliveries.dev', password: 'demo1234' };

// Etiqueta de ejemplo para mostrar el producto antes de entrar.
const SAMPLE: GuideDetail = {
  id: 'sample',
  guia: 'GU10001',
  ubicacion: 'Calle 10 # 43-12',
  ciudad_destino: 'Medellín',
  departamento_destino: 'Antioquia',
  codigo_postal: '050021',
  telefono_contacto: '3001234567',
  valor_productos: 200000,
  costo_envio: 8000,
  id_proveedor: '0123',
  numero_cuenta: '24500000123',
  observaciones: 'Portería principal',
  status: 'entregada',
  created_at: '2026-10-20T14:05:00Z',
  updated_at: '2026-10-22T16:40:00Z',
  history: [
    {
      from_status: null,
      to_status: 'confirmada',
      changed_at: '2026-10-20T14:05:00Z',
      changed_by: { username: 'demo' },
    },
    {
      from_status: 'confirmada',
      to_status: 'en_transito',
      changed_at: '2026-10-21T08:12:00Z',
      changed_by: { username: 'demo' },
    },
    {
      from_status: 'en_transito',
      to_status: 'entregada',
      changed_at: '2026-10-22T16:40:00Z',
      changed_by: { username: 'demo' },
    },
  ],
};

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function signIn(credentials: { email: string; password: string }) {
    setBusy(true);
    setError('');
    const { error } = await auth.signInWithPassword(credentials);
    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'El correo o la contraseña no coinciden.'
          : `No se pudo iniciar sesión: ${error.message}`,
      );
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    signIn({ email, password });
  }

  return (
    <main className="login">
      <section className="login-intro">
        <p className="brand">Confirm Deliveries</p>
        <h1>Confirma guías de envío y sigue cada entrega hasta su destino.</h1>

        <form className="login-form" onSubmit={onSubmit}>
          <label>
            Correo
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="demo-access">
          <p>
            ¿Solo quieres probarla? La cuenta demo es <strong>{DEMO.email}</strong> con contraseña{' '}
            <strong>{DEMO.password}</strong>.
          </p>
          <button className="btn" disabled={busy} onClick={() => signIn(DEMO)}>
            Entrar con la cuenta demo
          </button>
        </div>
      </section>

      <aside className="login-sample" aria-label="Ejemplo de guía">
        <GuideLabel guide={SAMPLE} />
      </aside>
    </main>
  );
}
