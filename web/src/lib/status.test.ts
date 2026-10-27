// ponytail: solo se prueba la lógica pura; las pantallas se verificaron a mano en el navegador.
// Si crecen, añadir @testing-library/react para login, cambio de estado y alta de guías.
import { describe, expect, it } from 'vitest';
import { countByStatus, formatMoney, NEXT_STATUSES, STATUSES } from './status';

describe('status', () => {
  it('las transiciones coinciden con la regla de la DB', () => {
    expect(NEXT_STATUSES).toEqual({
      confirmada: ['en_transito', 'cancelada'],
      en_transito: ['entregada', 'devuelta'],
      entregada: [],
      devuelta: [],
      cancelada: [],
    });
  });

  it('cuenta guías por estado, incluidos los vacíos', () => {
    const counts = countByStatus([
      { status: 'confirmada' },
      { status: 'confirmada' },
      { status: 'entregada' },
    ]);
    expect(counts).toEqual({
      confirmada: 2,
      en_transito: 0,
      entregada: 1,
      devuelta: 0,
      cancelada: 0,
    });
    expect(Object.keys(counts)).toEqual([...STATUSES]);
  });

  it('formatea pesos colombianos sin decimales', () => {
    expect(formatMoney(1250000).replace(/\s/g, ' ')).toBe('$ 1.250.000');
  });
});
