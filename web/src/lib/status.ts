export const STATUSES = [
  'confirmada',
  'en_transito',
  'entregada',
  'devuelta',
  'cancelada',
] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  confirmada: 'Confirmada',
  en_transito: 'En tránsito',
  entregada: 'Entregada',
  devuelta: 'Devuelta',
  cancelada: 'Cancelada',
};

// Espejo de public.guides_validate_status(): la DB es quien decide, esto solo evita
// mostrar botones que fallarían.
export const NEXT_STATUSES: Record<Status, Status[]> = {
  confirmada: ['en_transito', 'cancelada'],
  en_transito: ['entregada', 'devuelta'],
  entregada: [],
  devuelta: [],
  cancelada: [],
};

export const ACTION_LABEL: Record<Status, string> = {
  confirmada: 'Confirmar',
  en_transito: 'Marcar en tránsito',
  entregada: 'Marcar entregada',
  devuelta: 'Marcar devuelta',
  cancelada: 'Cancelar guía',
};

const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});
export const formatMoney = (value: number) => cop.format(value);

const dateTime = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

export const countByStatus = (items: { status: Status }[]) =>
  items.reduce(
    (acc, { status }) => ({ ...acc, [status]: acc[status] + 1 }),
    Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>,
  );
