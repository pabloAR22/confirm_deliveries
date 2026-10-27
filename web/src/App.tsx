import type { Session } from '@supabase/auth-js';
import { useEffect, useState } from 'react';
import { Deliveries } from './Deliveries';
import { auth } from './lib/api';
import { Login } from './Login';

export default function App() {
  // undefined = aún no sabemos si hay sesión (evita parpadeo del login)
  const [session, setSession] = useState<Session | null>();

  useEffect(() => {
    const { data } = auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;
  return session ? <Deliveries email={session.user.email ?? ''} /> : <Login />;
}
