import type { GuideDetail } from './lib/api';
import {
  ACTION_LABEL,
  formatDateTime,
  formatMoney,
  NEXT_STATUSES,
  STATUS_LABEL,
  type Status,
} from './lib/status';

type Props = {
  guide: GuideDetail;
  // Sin onChangeStatus la etiqueta es de solo lectura (p. ej. el ejemplo del login).
  onChangeStatus?: (status: Status) => void;
  busy?: boolean;
};

// La guía presentada como una etiqueta de envío: número grande, destino y ruta de estados.
export function GuideLabel({ guide, onChangeStatus, busy }: Props) {
  const next = NEXT_STATUSES[guide.status];

  return (
    <article className="label">
      <header className="label-head">
        <h2 className="label-number">{guide.guia}</h2>
        <span className={`status status-${guide.status}`}>{STATUS_LABEL[guide.status]}</span>
      </header>

      <section className="label-to">
        <h3>Destino</h3>
        <p className="label-address">{guide.ubicacion}</p>
        <p>
          {guide.ciudad_destino}, {guide.departamento_destino} {guide.codigo_postal}
        </p>
        <p>Tel. {guide.telefono_contacto}</p>
        {guide.linea_contacto && <p>Línea de contacto {guide.linea_contacto}</p>}
        {guide.observaciones && <p className="label-note">{guide.observaciones}</p>}
      </section>

      <dl className="label-facts">
        <div>
          <dt>Valor productos</dt>
          <dd>{formatMoney(guide.valor_productos)}</dd>
        </div>
        <div>
          <dt>Costo de envío</dt>
          <dd>{formatMoney(guide.costo_envio)}</dd>
        </div>
        <div>
          <dt>Proveedor</dt>
          <dd>{guide.id_proveedor}</dd>
        </div>
        <div>
          <dt>Cuenta</dt>
          <dd>{guide.numero_cuenta}</dd>
        </div>
      </dl>

      {onChangeStatus && next.length > 0 && (
        <div className="label-actions">
          {next.map((s) => (
            <button
              key={s}
              className={s === 'cancelada' || s === 'devuelta' ? 'btn' : 'btn btn-primary'}
              disabled={busy}
              onClick={() => onChangeStatus(s)}
            >
              {ACTION_LABEL[s]}
            </button>
          ))}
        </div>
      )}

      <section className="label-route">
        <h3>Recorrido</h3>
        <ol>
          {guide.history.map((h) => (
            <li key={h.changed_at + h.to_status} className={`stop stop-${h.to_status}`}>
              <span className="stop-status">{STATUS_LABEL[h.to_status]}</span>
              <time dateTime={h.changed_at}>{formatDateTime(h.changed_at)}</time>
              {h.changed_by && <span className="stop-by">por {h.changed_by.username}</span>}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
