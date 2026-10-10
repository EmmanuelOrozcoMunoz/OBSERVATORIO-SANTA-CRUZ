import type { DefCapa } from "../lib/capas";
import { useDatos } from "../lib/datos";
import { fecha, texto } from "../lib/formato";
import type { Fuente, Props } from "../lib/tipos";
import { EtiquetaTipo } from "./Estado";

export default function FichaElemento({ def, props }: { def: DefCapa; props: Props }) {
  const fuentes = useDatos<Fuente[]>("fuentes.json");
  const fuente = fuentes.estado === "listo" ? fuentes.datos.find((f) => f.id === def.fuente) : undefined;

  const filas = def.campos
    .map(([clave, etiqueta, formato]) => {
      const v = props[clave];
      const vacio = v == null || v === "";
      const fuera = clave === "barrio" && vacio && props.en_comuna === false;
      return { etiqueta, valor: fuera ? "Fuera de la comuna" : formato ? formato(v, props) : texto(v), vacio: vacio && !fuera };
    })
    .filter((f) => !f.vacio);

  const enlace = typeof props.enlace === "string" && props.enlace.startsWith("http") ? props.enlace : null;

  return (
    <article className="space-y-3">
      <header>
        <p className="text-sm text-tinta-suave">{def.nombre}</p>
        <h2 className="text-2xl font-semibold leading-tight [font-stretch:110%]">{def.titulo(props)}</h2>
      </header>

      {filas.length > 0 ? (
        <dl className="divide-y divide-nivel border-y border-nivel">
          {filas.map((f) => (
            <div key={f.etiqueta} className="flex items-baseline justify-between gap-3 py-2 text-base">
              <dt className="text-tinta-suave">{f.etiqueta}</dt>
              <dd className="text-right font-medium">{f.valor}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-tinta-suave">La fuente no trae más atributos para este elemento.</p>
      )}

      {def.nota && <p className="rounded-md bg-ambar-claro p-2.5 text-sm">{def.nota}</p>}

      {enlace && (
        <p className="text-sm">
          <a href={enlace} target="_blank" rel="noreferrer" className="text-cable underline underline-offset-2">
            Ver el anuncio original (de 2023, puede ya no estar publicado)
          </a>
        </p>
      )}

      <section className="border-t border-nivel pt-3 text-sm">
        <h3 className="mb-1 font-semibold">De dónde sale este dato</h3>
        {fuente ? (
          <>
            <p>{fuente.nombre}</p>
            <p className="text-tinta-suave">{fuente.entidad}</p>
            <p className="mt-1">
              <EtiquetaTipo tipo={fuente.tipo} />
            </p>
            <p className="mt-1 text-xs text-tinta-tenue">
              Descargado el {fecha(fuente.fecha_descarga)}.{" "}
              {fuente.ultima_actualizacion_en_datos
                ? `Última fecha registrada en la capa: ${fecha(fuente.ultima_actualizacion_en_datos)}.`
                : "La capa no informa su fecha de actualización."}
            </p>
            <a href={fuente.url_servicio} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-cable underline">
              Servicio de origen
            </a>
          </>
        ) : (
          <p className="text-tinta-suave">Cargando información de la fuente.</p>
        )}
      </section>
    </article>
  );
}
