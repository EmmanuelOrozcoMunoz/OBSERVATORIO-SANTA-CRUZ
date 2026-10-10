import type { ReactNode } from "react";
import type { Estado as EstadoDatos } from "../lib/datos";
import type { TipoDato } from "../lib/tipos";

export function Cargando({ texto = "Cargando datos" }: { texto?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 p-6 text-tinta-suave">
      <span className="h-3 w-3 animate-[suave_2.6s_ease-in-out_infinite] rounded-full bg-acento" aria-hidden="true" />
      {texto}
    </div>
  );
}

export function ErrorCarga({ error, reintentar }: { error: string; reintentar?: () => void }) {
  return (
    <div role="alert" className="m-4 rounded-md border border-ladrillo/40 bg-ladrillo-claro p-4 text-sm">
      <p className="font-semibold text-ladrillo">No se pudieron cargar los datos.</p>
      <p className="mt-1">{error}</p>
      <p className="mt-1 text-tinta-suave">
        Revise que la carpeta <code>public/data</code> exista. Si no existe, corra el pipeline (ver README).
      </p>
      {reintentar && (
        <button type="button" onClick={reintentar} className="mt-3 rounded-md bg-ladrillo px-3 py-1.5 text-papel">
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}

export function SinDatos({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-nivel bg-papel-hondo/60 p-4 text-sm">
      <p className="font-semibold">{titulo}</p>
      {children && <div className="mt-1 text-tinta-suave">{children}</div>}
    </div>
  );
}

/** Pinta el contenido solo cuando los datos están listos; si no, muestra carga o error. */
export function ConDatos<T>({ estado, children }: { estado: EstadoDatos<T>; children: (datos: T) => ReactNode }) {
  if (estado.estado === "cargando") return <Cargando />;
  if (estado.estado === "error") return <ErrorCarga error={estado.error} reintentar={estado.reintentar} />;
  return <>{children(estado.datos)}</>;
}

const ESTILO_TIPO: Record<TipoDato, string> = {
  oficial: "bg-menta text-marca",
  tercero: "bg-cable-claro text-cable",
  campo: "bg-ambar-claro text-ambar",
  demostrativo: "bg-ladrillo-claro text-ladrillo",
};

const NOMBRE_TIPO: Record<TipoDato, string> = {
  oficial: "Dato oficial",
  tercero: "Dato abierto de terceros",
  campo: "Levantado en campo",
  demostrativo: "Dato demostrativo",
};

export function EtiquetaTipo({ tipo }: { tipo: TipoDato }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-medium ${ESTILO_TIPO[tipo]}`}>{NOMBRE_TIPO[tipo]}</span>
  );
}
