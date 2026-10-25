-- Datos de demo para desarrollo local (`supabase db reset`).
-- Usuario: demo@confirm-deliveries.dev / demo1234

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'demo@confirm-deliveries.dev',
  extensions.crypt('demo1234', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"demo"}',
  now(), now(), '', '', '', ''
);

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"demo@confirm-deliveries.dev"}',
  'email', now(), now(), now()
);

-- Simula la sesión del usuario demo para que auth.uid() funcione en los triggers.
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', false);

insert into public.guides (
  guia, ubicacion, ciudad_destino, departamento_destino, codigo_postal, telefono_contacto,
  valor_productos, costo_envio, id_proveedor, numero_cuenta, observaciones, linea_contacto
) values
  ('GU10001', 'Calle 10 # 43-12',      'Medellín',     'Antioquia',       '050021', '3001234567', 200000, 8000,  '0123', '24500000123', 'Portería principal', null),
  ('GU10002', 'Carrera 7 # 72-41',     'Bogotá',       'Cundinamarca',    '110231', '3109876543', 450000, 12000, '0123', '24500000123', null,                 '6015550101'),
  ('GU10003', 'Avenida 6N # 23-50',    'Cali',         'Valle del Cauca', '760045', '3204567890', 89000,  9500,  '0456', '24500000456', 'Llamar antes',       null),
  ('GU10004', 'Calle 84 # 51B-210',    'Barranquilla', 'Atlántico',       '080020', '3157654321', 1250000, 15000, '0456', '24500000456', null,                null),
  ('GU10005', 'Carrera 27 # 36-14',    'Bucaramanga',  'Santander',       '680003', '3012223344', 64000,  7000,  '0789', '24500000789', null,                 null);

-- Recorridos de estado para que el historial tenga contenido.
update public.guides set status = 'en_transito' where guia in ('GU10001', 'GU10002', 'GU10003');
update public.guides set status = 'entregada'   where guia = 'GU10001';
update public.guides set status = 'devuelta'    where guia = 'GU10002';
update public.guides set status = 'cancelada'   where guia = 'GU10004';

select set_config('request.jwt.claims', null, false);
