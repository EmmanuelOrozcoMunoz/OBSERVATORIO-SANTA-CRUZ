import type { Feature, FeatureCollection, Geometry } from "geojson";

export type TipoDato = "oficial" | "tercero" | "campo" | "demostrativo";

export type Props = Record<string, unknown>;
export type Coleccion = FeatureCollection<Geometry, Props>;
export type Elemento = Feature<Geometry, Props>;

export interface FichaBarrio {
  codigo: string;
  nombre: string;
  area_ha: number;
  poblacion_2018: number | null;
  viviendas_2018: number | null;
  hogares_2018: number | null;
  menores_10_2018: number | null;
  mayores_60_2018: number | null;
  densidad_hab_ha: number | null;
  equipamientos: number;
  equipamientos_por_grupo: Record<string, number>;
  sedes_educativas: number;
  sedes_educativas_oficiales: number;
  escenarios_deportivos: number;
  bibliotecas: number;
  espacio_publico_m2: number;
  espacio_publico_m2_hab: number | null;
  espacio_publico_proyectado_m2: number;
  tratamientos_pct: Record<string, number>;
  amenaza_alta_pct: number;
  amenaza_media_pct: number;
  amenaza_baja_pct: number;
  riesgo_no_mitigable_pct: number;
  siniestros_viales: number;
  atropellos: number;
  estacion_mas_cercana: string | null;
  estacion_distancia_lineal_m: number | null;
  ofertas_venta_vivienda: number;
  mediana_precio_m2_venta: number | null;
}

export interface SerieECV {
  nombre: string;
  mejor: "alto" | "bajo";
  serie: { anio: number; valor: number }[];
  ultimo_anio: number;
  ultimo_valor: number;
  posicion: number | null;
  de: number;
  mejor_valor_ciudad: number | null;
  mejor_territorio: string | null;
}

export interface Indicadores {
  generado: string;
  comuna: {
    nombre: string;
    codigo: string;
    area_ha: number;
    barrios: number;
    poblacion_2018: number;
    viviendas_2018: number;
    densidad_hab_ha: number | null;
    equipamientos: number;
    sedes_educativas: number;
    escenarios_deportivos: number;
    bibliotecas: number;
    espacio_publico_m2: number;
    espacio_publico_m2_hab: number | null;
    espacio_publico_proyectado_m2: number;
    estaciones_en_comuna: string[];
    rutas_bus: number;
    tratamientos_pct: Record<string, number>;
    amenaza_pct: Record<string, number>;
    riesgo_pct: Record<string, number>;
    siniestros_total: number;
    siniestros_por_anio: ({ anio: number; total: number } & Record<string, number>)[];
    ofertas_inmobiliarias: number;
    red_peatonal_inventariada_pct: number | null;
    tiempo_caminata_metro_min: number | null;
  };
  barrios: FichaBarrio[];
  ecv: Record<string, SerieECV>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accesibilidad?: any; // calculado en data-pipeline/red.py
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  infraestructura?: any;
}

export interface Fuente {
  id: string;
  nombre: string;
  entidad: string;
  tipo: TipoDato;
  url_servicio: string;
  consulta: string | null;
  formato_origen: string;
  cobertura: string;
  licencia: string;
  estado: string;
  registros: number;
  fecha_descarga: string | null;
  ultima_actualizacion_en_datos: string | null;
  error: string | null;
  unidad_espacial?: string;
  periodo_referencia?: string;
  crs?: string;
  campos_usados?: string[];
  transformaciones?: string;
  limitaciones?: string;
  clase?: string;
}

export interface IndicadorMetodo {
  id: string;
  nombre: string;
  nombre_en: string;
  formula: string;
  unidad: string;
  fuentes: string[];
  anio: string;
  metodo: string;
  clase: string;
  limitaciones: string;
}

export interface Metodologia {
  clases: Record<string, string>;
  indicadores: IndicadorMetodo[];
  glosario: { es: string; en: string }[];
}

export interface Calidad {
  por_verificar: { fuente: string; donde: string; para: string; estado: string }[];
  notas: { tema: string; nota: string }[];
}
