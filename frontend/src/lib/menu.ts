/**
 * Estructura del menú del sitio: cinco categorías con sus módulos.
 * La barra lateral, el menú del celular y el buscador rápido (Ctrl + K) leen de aquí, así que para agregar un módulo
 * nuevo (por ejemplo "Mercado inmobiliario y POT" o "Riesgo de movimiento en masa") basta con sumarlo a su grupo.
 * Una categoría sin módulos no se muestra.
 */
export type ModuloMenu = { ruta: string; nombre: string; icono: string; detalle: string; fase?: string };
export type GrupoMenu = { id: string; titulo: string; modulos: ModuloMenu[] };

export const GRUPOS: GrupoMenu[] = [
  {
    id: "panorama",
    titulo: "Panorama",
    modulos: [
      { ruta: "/", nombre: "Inicio", icono: "inicio", detalle: "Portada" },
      { ruta: "/propuesta", nombre: "Propuesta de valor", icono: "corazon", detalle: "Por qué existe el observatorio" },
    ],
  },
  {
    id: "territorio",
    titulo: "Territorio",
    modulos: [
      { ruta: "/mapa", nombre: "Mapa territorial", icono: "mapa", detalle: "Todas las capas" },
      { ruta: "/barrios", nombre: "Mi barrio", icono: "personas", detalle: "Todo lo que se sabe de un barrio" },
    ],
  },
  {
    id: "movilidad",
    titulo: "Movilidad y accesibilidad",
    modulos: [
      { ruta: "/accesibilidad", nombre: "Accesibilidad", icono: "accesibilidad", detalle: "Minutos caminando" },
      { ruta: "/corredor-49", nombre: "Corredor Carrera 49", icono: "corredor", detalle: "¿Conviene ir por la 49?" },
      { ruta: "/prioridades", nombre: "Prioridad de obras", icono: "prioridades", detalle: "Dónde intervenir primero" },
    ],
  },
  // Pendientes (ver el plan de funcionalidades): "Inmobiliario y norma" y "Riesgo y ladera".
  {
    id: "comunidad",
    titulo: "Comunidad",
    modulos: [
      { ruta: "/problematicas", nombre: "Problemáticas", icono: "alerta", detalle: "Ocho problemas con datos" },
      { ruta: "/radar", nombre: "Radar de noticias", icono: "radar", detalle: "Lo que dicen los medios" },
      { ruta: "/participacion", nombre: "Participación", icono: "participacion", detalle: "Reportar un problema", fase: "Pronto" },
    ],
  },
  {
    id: "datos",
    titulo: "Datos y método",
    modulos: [
      { ruta: "/indicadores", nombre: "Indicadores", icono: "indicadores", detalle: "Cifras por barrio" },
      { ruta: "/datos", nombre: "Mis datos", icono: "subir", detalle: "Sube y mira tus datos" },
      { ruta: "/fuentes", nombre: "Fuentes y calidad", icono: "fuentes", detalle: "De dónde sale cada dato" },
      { ruta: "/identidad", nombre: "Manual de identidad", icono: "paleta", detalle: "Colores, letras, voz y reglas" },
    ],
  },
].filter((g) => g.modulos.length > 0);

/** Grupo al que pertenece una ruta (para abrirlo solo cuando se está en uno de sus módulos). */
export function grupoDeRuta(pathname: string): string | undefined {
  const g = GRUPOS.find((x) =>
    x.modulos.some((m) => (m.ruta === "/" ? pathname === "/" : pathname === m.ruta || pathname.startsWith(`${m.ruta}/`))),
  );
  return g?.id;
}
