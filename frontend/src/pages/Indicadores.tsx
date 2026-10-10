import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ConDatos } from "../components/Estado";
import FichaBarrio from "../components/FichaBarrio";
import { useDatos } from "../lib/datos";
import { dec, fecha, num, pct, dec2 } from "../lib/formato";
import type { FichaBarrio as Ficha, Indicadores as Ind } from "../lib/tipos";
import { BotonCabecera, Cabecera, Relacionados } from "../components/Pagina";

const C = {
  barra: "#2d6a4f",
  resaltada: "#1d2b2a",
  apagada: "#a8cbb6",
  rejilla: "#e2e5de",
  eje: "#6f7c7a",
};

// Paleta categórica validada (luz, contraste y daltonismo) para las clases de siniestro.
const CLASES_SINIESTRO: [string, string][] = [
  ["Atropello", "#a8452b"],
  ["Choque", "#1f63a8"],
  ["Caida ocupante", "#b7791f"],
  ["Volcamiento", "#7a4e9b"],
  ["Otro", "#16917f"],
];

function Panel({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-nivel bg-white p-4">
      <h3 className="font-bold [font-stretch:108%]">{titulo}</h3>
      {descripcion && <p className="mt-0.5 text-sm text-tinta-suave">{descripcion}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Cifra({ valor, etiqueta, nota, pendiente }: { valor: string; etiqueta: string; nota?: string; pendiente?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${pendiente ? "border border-dashed border-nivel" : "bg-papel-hondo"}`}>
      <p className={`text-2xl font-bold tabular-nums [font-stretch:105%] ${pendiente ? "text-tinta-tenue" : ""}`}>{valor}</p>
      <p className="text-sm">{etiqueta}</p>
      {nota && <p className="mt-0.5 text-xs text-tinta-tenue">{nota}</p>}
    </div>
  );
}

const estiloTooltip = {
  contentStyle: { borderRadius: 6, border: "1px solid #d4d9cf", fontSize: 13, fontFamily: "Archivo, sans-serif" },
  cursor: { fill: "rgba(45,106,79,0.08)" },
};

function BarrasBarrio({
  datos,
  clave,
  unidad,
  seleccionado,
  referencia,
  referenciaEtiqueta,
  formato = dec,
}: {
  datos: Ficha[];
  clave: keyof Ficha;
  unidad: string;
  seleccionado: string;
  referencia?: number | null;
  referenciaEtiqueta?: string;
  formato?: (v: number) => string;
}) {
  const filas = [...datos]
    .map((b) => ({ nombre: b.nombre, codigo: b.codigo, valor: (b[clave] as number | null) ?? 0 }))
    .sort((a, b) => b.valor - a.valor);
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={filas} layout="vertical" margin={{ left: 8, right: 28, top: 22, bottom: 4 }} barCategoryGap={4}>
          <CartesianGrid horizontal={false} stroke={C.rejilla} />
          <XAxis type="number" tick={{ fontSize: 12, fill: C.eje }} axisLine={false} tickLine={false} tickFormatter={(v: number) => dec2(v)} />
          <YAxis type="category" dataKey="nombre" width={150} tick={{ fontSize: 12, fill: "#1d2b2a" }} axisLine={false} tickLine={false} />
          <Tooltip {...estiloTooltip} formatter={(v: number) => [`${formato(v)} ${unidad}`.trim(), ""]} separator="" />
          {referencia != null && (
            <ReferenceLine
              x={referencia}
              stroke="#1d2b2a"
              strokeDasharray="4 3"
              label={{ value: referenciaEtiqueta, position: "top", fontSize: 11, fill: "#1d2b2a" }}
            />
          )}
          <Bar dataKey="valor" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {filas.map((f) => (
              <Cell key={f.codigo} fill={!seleccionado ? C.barra : f.codigo === seleccionado ? C.resaltada : C.apagada} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Contenido({ d }: { d: Ind }) {
  const [sel, setSel] = useState("");
  const { comuna, barrios, ecv } = d;
  const ficha = barrios.find((b) => b.codigo === sel);
  const atropellos = barrios.reduce((a, b) => a + b.atropellos, 0);

  const siniestros = useMemo(
    () =>
      comuna.siniestros_por_anio.map((r) => ({
        anio: String(r.anio),
        Atropello: r.Atropello ?? 0,
        Choque: r.Choque ?? 0,
        "Caida ocupante": r["Caida ocupante"] ?? 0,
        Volcamiento: r.Volcamiento ?? 0,
        Otro: (r.Otro ?? 0) + (r.Incendio ?? 0),
      })),
    [comuna],
  );

  const imcv = ecv.imcv;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 lg:px-8">
      <Cabecera etiqueta="Indicadores" icono="indicadores" titulo="Indicadores de Santa Cruz"
        texto={<>Calculados con datos oficiales de la Alcaldía de Medellín y del DANE. Última actualización del cálculo: {fecha(d.generado)}.</>}>
        <BotonCabecera to="/mapa">Verlos en el mapa</BotonCabecera>
        <BotonCabecera to="/accesibilidad" claro>Accesibilidad</BotonCabecera>
      </Cabecera>
      <div className="flex justify-end">
        <label className="text-sm">
          <span className="block font-semibold">Resaltar un barrio</span>
          <select value={sel} onChange={(e) => setSel(e.target.value)} className="mt-1 rounded-md border border-nivel bg-white px-2 py-1.5">
            <option value="">Toda la comuna</option>
            {barrios.map((b) => (
              <option key={b.codigo} value={b.codigo}>
                {b.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section aria-label="Cifras principales" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Cifra valor={num(comuna.poblacion_2018)} etiqueta="personas (Censo 2018)" nota={`${num(comuna.viviendas_2018)} viviendas`} />
        <Cifra valor={`${num(Math.round(comuna.densidad_hab_ha ?? 0))}`} etiqueta="habitantes por hectárea" nota={`${dec(comuna.area_ha)} ha en total`} />
        <Cifra valor={`${dec2(comuna.espacio_publico_m2_hab)} m²`} etiqueta="de espacio público por habitante" nota="Referencia nacional: 15 m²" />
        <Cifra valor={num(comuna.equipamientos)} etiqueta="equipamientos colectivos" nota={`${comuna.sedes_educativas} sedes educativas, ${comuna.escenarios_deportivos} escenarios deportivos`} />
        <Cifra
          valor={String(comuna.estaciones_en_comuna.length)}
          etiqueta={comuna.estaciones_en_comuna.length === 1 ? "estación de Metro o cable dentro de la comuna" : "estaciones de Metro o cable dentro de la comuna"}
          nota={comuna.estaciones_en_comuna.join(", ")}
        />
        <Cifra valor={num(atropellos)} etiqueta="atropellos entre 2019 y 2025" nota={`${num(comuna.siniestros_total)} siniestros viales en total`} />
        <Cifra
          valor={d.infraestructura ? `${dec(d.infraestructura.andenes.km)} km` : "Sin dato"}
          etiqueta="de andén en el inventario oficial"
          nota={d.infraestructura ? `Ancho mediano ${dec2(d.infraestructura.andenes.ancho_mediano_m)} m` : undefined}
        />
        <Cifra
          valor={d.accesibilidad ? `${dec(d.accesibilidad.comuna.transporte_masivo_promedio_min)} min` : "Sin dato"}
          etiqueta="caminando en promedio hasta una estación"
          nota="Estimación por la red de calles y con pendiente"
        />
      </section>

      {ficha && (
        <section className="rounded-lg border border-nivel bg-white p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-tinta-suave">Ficha del barrio seleccionado</p>
            <Link to={`/mapa?barrio=${ficha.codigo}`} className="rounded-md bg-ladera px-3 py-1.5 text-sm text-papel">
              Ver {ficha.nombre} en el mapa
            </Link>
          </div>
          <div className="max-w-xl">
            <FichaBarrio ficha={ficha} indicadores={d} />
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          titulo="Espacio público por habitante"
          descripcion="Metros cuadrados de espacio público existente por persona. La línea marca el promedio de la comuna."
        >
          <BarrasBarrio
            datos={barrios}
            clave="espacio_publico_m2_hab"
            unidad="m²/hab"
            seleccionado={sel}
            referencia={comuna.espacio_publico_m2_hab}
            referenciaEtiqueta={`Comuna: ${dec2(comuna.espacio_publico_m2_hab)}`}
            formato={(v) => dec2(v)}
          />
        </Panel>
        <Panel titulo="Densidad de población" descripcion="Habitantes por hectárea según el Censo 2018.">
          <BarrasBarrio
            datos={barrios}
            clave="densidad_hab_ha"
            unidad="hab/ha"
            seleccionado={sel}
            referencia={comuna.densidad_hab_ha}
            referenciaEtiqueta={`Comuna: ${num(Math.round(comuna.densidad_hab_ha ?? 0))}`}
            formato={(v) => num(Math.round(v))}
          />
        </Panel>
        <Panel titulo="Atropellos 2019 a 2025" descripcion="Atropellos registrados dentro de cada barrio.">
          <BarrasBarrio datos={barrios} clave="atropellos" unidad="" seleccionado={sel} formato={(v) => num(v)} />
        </Panel>
        <Panel titulo="Área con amenaza alta por movimientos en masa" descripcion="Porcentaje del área del barrio, según el POT.">
          <BarrasBarrio datos={barrios} clave="amenaza_alta_pct" unidad="%" seleccionado={sel} formato={(v) => dec(v)} />
        </Panel>
      </div>

      <Panel
        titulo="Siniestros viales por año en la comuna"
        descripcion="Secretaría de Movilidad. La forma de clasificar cambia entre años y 2025 puede estar incompleto: compare con cuidado."
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={siniestros} margin={{ left: 0, right: 8, top: 8, bottom: 0 }} barCategoryGap="22%">
              <CartesianGrid vertical={false} stroke={C.rejilla} />
              <XAxis dataKey="anio" tick={{ fontSize: 12, fill: C.eje }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: C.eje }} axisLine={false} tickLine={false} width={44} tickFormatter={(v: number) => num(v)} />
              <Tooltip {...estiloTooltip} />
              <Legend wrapperStyle={{ fontSize: 13 }} iconType="square" />
              {CLASES_SINIESTRO.map(([clase, color], i) => (
                <Bar
                  key={clase}
                  dataKey={clase}
                  name={clase === "Caida ocupante" ? "Caída de ocupante" : clase}
                  stackId="s"
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  radius={i === CLASES_SINIESTRO.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {imcv && (
        <Panel
          titulo="Índice Multidimensional de Condiciones de Vida"
          descripcion={`Encuesta de Calidad de Vida. En ${imcv.ultimo_anio} Santa Cruz quedó en el puesto ${imcv.posicion} de ${imcv.de} comunas y corregimientos (el mejor fue ${imcv.mejor_territorio}, con ${dec(imcv.mejor_valor_ciudad)}).`}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={imcv.serie} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={C.rejilla} />
                <XAxis dataKey="anio" tick={{ fontSize: 12, fill: C.eje }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[(min: number) => Math.floor(min - 1), (max: number) => Math.ceil(max + 1)]}
                  allowDecimals={false}
                  tickFormatter={(v: number) => num(v)}
                  tick={{ fontSize: 12, fill: C.eje }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip {...estiloTooltip} formatter={(v: number) => [dec(v), "IMCV"]} cursor={{ stroke: "#6f7c7a", strokeDasharray: "3 3" }} />
                <Line type="monotone" dataKey="valor" stroke="#2d6a4f" strokeWidth={2} dot={{ r: 4, fill: "#2d6a4f", stroke: "#fff", strokeWidth: 2 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-tinta-tenue">No hay dato publicado para 2020.</p>
        </Panel>
      )}

      <Panel titulo="Tabla por barrio" descripcion="Haga clic en el nombre de un barrio para abrir su ficha en el mapa.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-nivel text-left text-tinta-suave">
                <th className="py-2 pr-3 font-semibold">Barrio</th>
                <th className="py-2 pr-3 text-right font-semibold">Población 2018</th>
                <th className="py-2 pr-3 text-right font-semibold">hab/ha</th>
                <th className="py-2 pr-3 text-right font-semibold">Equipamientos</th>
                <th className="py-2 pr-3 text-right font-semibold">Espacio público m²/hab</th>
                <th className="py-2 pr-3 text-right font-semibold">Amenaza alta</th>
                <th className="py-2 pr-3 text-right font-semibold">Atropellos</th>
                <th className="py-2 text-right font-semibold">Estación más cercana (línea recta)</th>
              </tr>
            </thead>
            <tbody>
              {barrios.map((b) => (
                <tr key={b.codigo} className={`border-b border-nivel/70 ${b.codigo === sel ? "bg-ladera-claro" : ""}`}>
                  <td className="py-1.5 pr-3">
                    <Link to={`/mapa?barrio=${b.codigo}`} className="text-cable underline-offset-2 hover:underline">
                      {b.nombre}
                    </Link>
                  </td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{num(b.poblacion_2018)}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{num(b.densidad_hab_ha && Math.round(b.densidad_hab_ha))}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{num(b.equipamientos)}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{dec2(b.espacio_publico_m2_hab)}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{pct(b.amenaza_alta_pct)}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{num(b.atropellos)}</td>
                  <td className="py-1.5 text-right">
                    {b.estacion_mas_cercana} ({num(b.estacion_distancia_lineal_m)} m)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <section className="rounded-lg border border-dashed border-nivel p-4">
        <h2 className="font-bold">Indicadores que todavía no se pueden calcular</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-tinta-suave">
          <li>Estado de los andenes: el inventario oficial trae códigos sin diccionario publicado.</li>
          <li>Costos de obra: no hay precios unitarios públicos confiables; se pueden registrar con su fuente en Prioridad de obras.</li>
          <li>Reportes ciudadanos validados: se habilita con el servidor de la Fase 4.</li>
        </ul>
      </section>
      <Relacionados ids={["problematicas", "accesibilidad", "prioridades"]} />
    </div>
  );
}

export default function Indicadores() {
  const estado = useDatos<Ind>("indicadores.json");
  return <ConDatos estado={estado}>{(d) => <Contenido d={d} />}</ConDatos>;
}
