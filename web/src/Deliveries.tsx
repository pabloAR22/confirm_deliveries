import { useCallback, useEffect, useState } from 'react';
import { GuideLabel } from './GuideLabel';
import { api, auth, type Guide, type GuideDetail } from './lib/api';
import {
  countByStatus,
  formatDateTime,
  formatMoney,
  STATUS_LABEL,
  STATUSES,
  type Status,
} from './lib/status';
import { NewGuideDialog } from './NewGuideDialog';

const message = (e: unknown) => (e instanceof Error ? e.message : 'Error inesperado');

export function Deliveries({ email }: { email: string }) {
  const [guides, setGuides] = useState<Guide[] | null>(null);
  const [filter, setFilter] = useState<Status | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<GuideDetail | null>(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [waking, setWaking] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadGuides = useCallback(async () => {
    // En el plan gratuito de Render la API duerme: avisar si la primera respuesta tarda.
    const timer = setTimeout(() => setWaking(true), 4000);
    try {
      setGuides(await api.listGuides());
      setError('');
    } catch (e) {
      setError(message(e));
    } finally {
      clearTimeout(timer);
      setWaking(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    try {
      setDetail(await api.getGuide(id));
    } catch (e) {
      setActionError(message(e));
    }
  }, []);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- carga inicial: los setState ocurren tras el await
    loadGuides();
  }, [loadGuides]);

  function select(id: string | null) {
    setSelectedId(id);
    setDetail(null);
    setActionError('');
    if (id) loadDetail(id);
  }

  async function changeStatus(status: Status) {
    if (!selectedId) return;
    setBusy(true);
    setActionError('');
    try {
      await api.updateStatus(selectedId, status);
      await Promise.all([loadDetail(selectedId), loadGuides()]);
    } catch (e) {
      setActionError(message(e));
    } finally {
      setBusy(false);
    }
  }

  const counts = countByStatus(guides ?? []);
  const visible = (guides ?? []).filter((g) => !filter || g.status === filter);

  return (
    <div className="app">
      <header className="topbar">
        <p className="brand">Confirm Deliveries</p>
        <span className="topbar-user">{email}</span>
        <button className="btn btn-quiet" onClick={() => auth.signOut()}>
          Cerrar sesión
        </button>
      </header>

      <div className={`workspace ${selectedId ? 'has-selection' : ''}`}>
        <section className="ledger">
          <div className="ledger-head">
            <h1>Guías</h1>
            <button className="btn btn-primary" onClick={() => setCreating(true)}>
              Confirmar guía
            </button>
          </div>

          <div className="filters" role="group" aria-label="Filtrar por estado">
            <button aria-pressed={!filter} onClick={() => setFilter(null)}>
              Todas <span>{guides?.length ?? 0}</span>
            </button>
            {STATUSES.map((s) => (
              <button key={s} aria-pressed={filter === s} onClick={() => setFilter(s)}>
                {STATUS_LABEL[s]} <span>{counts[s]}</span>
              </button>
            ))}
          </div>

          {waking && (
            <p className="notice" role="status">
              La API está despertando (el plan gratuito la pausa cuando no se usa). Puede tardar
              hasta un minuto.
            </p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}{' '}
              <button className="btn-link" onClick={loadGuides}>
                Reintentar
              </button>
            </p>
          )}

          {guides && visible.length === 0 && (
            <p className="empty">
              {filter
                ? `No hay guías en estado «${STATUS_LABEL[filter]}».`
                : 'Aún no hay guías. Confirma la primera con el botón de arriba.'}
            </p>
          )}

          {visible.length > 0 && (
            <table className="guides">
              <thead>
                <tr>
                  <th>Guía</th>
                  <th>Destino</th>
                  <th className="num col-optional">Valor</th>
                  <th>Estado</th>
                  <th className="col-optional">Actualizada</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((g) => (
                  <tr key={g.id} aria-selected={g.id === selectedId} onClick={() => select(g.id)}>
                    <td>
                      {/* el click (o Enter) del botón burbujea al onClick de la fila */}
                      <button className="guide-link">{g.guia}</button>
                    </td>
                    <td>
                      {g.ciudad_destino}
                      <span className="sub">{g.departamento_destino}</span>
                    </td>
                    <td className="num col-optional">{formatMoney(g.valor_productos)}</td>
                    <td>
                      <span className={`status status-${g.status}`}>{STATUS_LABEL[g.status]}</span>
                    </td>
                    <td className="col-optional">{formatDateTime(g.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <aside className="detail" aria-label="Detalle de la guía">
          {selectedId && (
            <button className="btn btn-quiet detail-back" onClick={() => select(null)}>
              Volver a la lista
            </button>
          )}
          {actionError && (
            <p className="form-error" role="alert">
              {actionError}
            </p>
          )}
          {detail && detail.id === selectedId ? (
            <GuideLabel guide={detail} onChangeStatus={changeStatus} busy={busy} />
          ) : (
            !selectedId && (
              <p className="empty">Elige una guía para ver su etiqueta y su recorrido.</p>
            )
          )}
        </aside>
      </div>

      {creating && (
        <NewGuideDialog
          onClose={() => setCreating(false)}
          onCreated={(guide) => {
            setCreating(false);
            setFilter(null);
            loadGuides();
            select(guide.id);
          }}
        />
      )}
    </div>
  );
}
