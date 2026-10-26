import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, ApiError, type Guide, type GuideInput } from './lib/api';

type Props = { onClose: () => void; onCreated: (guide: Guide) => void };

// Las restricciones HTML repiten las de la API para avisar antes de enviar;
// la API (y la DB) siguen siendo quienes validan.
export function NewGuideDialog({ onClose, onCreated }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const guide: GuideInput = {
      ...(f as unknown as GuideInput),
      valor_productos: Number(f.valor_productos),
      costo_envio: Number(f.costo_envio),
      observaciones: f.observaciones || undefined,
      linea_contacto: f.linea_contacto || undefined,
    };
    setBusy(true);
    setErrors([]);
    try {
      const [created] = await api.createGuides([guide]);
      onCreated(created);
    } catch (err) {
      setErrors(
        err instanceof ApiError && err.errors.length ? err.errors : [(err as Error).message],
      );
      setBusy(false);
    }
  }

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} aria-labelledby="new-guide-title">
      <form onSubmit={onSubmit}>
        <h2 id="new-guide-title">Confirmar guía</h2>

        <label className="field-wide">
          Número de guía
          <input name="guia" required minLength={5} maxLength={10} autoFocus />
        </label>

        <fieldset>
          <legend>Destino</legend>
          <label className="field-wide">
            Dirección
            <input name="ubicacion" required />
          </label>
          <label>
            Ciudad
            <input name="ciudad_destino" required />
          </label>
          <label>
            Departamento
            <input name="departamento_destino" required />
          </label>
          <label>
            Código postal
            <input
              name="codigo_postal"
              required
              pattern="[0-9]{6}"
              inputMode="numeric"
              title="6 dígitos"
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Contacto</legend>
          <label>
            Teléfono
            <input
              name="telefono_contacto"
              required
              pattern="[0-9]{10}"
              inputMode="numeric"
              title="10 dígitos"
            />
          </label>
          <label>
            <span>
              Línea de contacto <span className="optional">(opcional)</span>
            </span>
            <input name="linea_contacto" maxLength={50} />
          </label>
        </fieldset>

        <fieldset>
          <legend>Valores y proveedor</legend>
          <label>
            Valor de los productos (COP)
            <input name="valor_productos" type="number" required min={1} step="0.01" />
          </label>
          <label>
            Costo de envío (COP)
            <input name="costo_envio" type="number" required min={1} step="0.01" />
          </label>
          <label>
            ID del proveedor
            <input
              name="id_proveedor"
              required
              pattern="[0-9]+"
              inputMode="numeric"
              title="Solo dígitos"
            />
          </label>
          <label>
            Número de cuenta
            <input
              name="numero_cuenta"
              required
              pattern="[0-9]+"
              inputMode="numeric"
              title="Solo dígitos"
            />
          </label>
        </fieldset>

        <label className="field-wide">
          <span>
            Observaciones <span className="optional">(opcional)</span>
          </span>
          <textarea name="observaciones" maxLength={100} rows={2} />
        </label>

        {errors.length > 0 && (
          <ul className="form-error" role="alert">
            {errors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}

        <div className="dialog-actions">
          <button type="button" className="btn" onClick={() => ref.current?.close()}>
            Descartar
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Confirmando…' : 'Confirmar guía'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
