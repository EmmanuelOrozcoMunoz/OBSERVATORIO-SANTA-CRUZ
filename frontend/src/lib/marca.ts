/**
 * Identidad del Observatorio Santa Cruz: un color de acento por módulo.
 * Cada acento trae tres tonos (oscuro, medio, vivo) que se usan en la cabecera, el menú y los chips.
 * Todos cumplen contraste de texto blanco sobre el tono medio de al menos 5,9:1 (se muestra en /identidad).
 */
export type Acento = { id: string; nombre: string; oscuro: string; medio: string; vivo: string };

export const ACENTOS: Record<string, Acento> = {
  ladera: { id: "ladera", nombre: "Ladera", oscuro: "#0f2a1a", medio: "#1a4d2e", vivo: "#2d6a4f" },
  cable: { id: "cable", nombre: "Cable", oscuro: "#0f2a44", medio: "#1d4f7a", vivo: "#2d6a9a" },
  ambar: { id: "ambar", nombre: "Ámbar", oscuro: "#3d2604", medio: "#8a5a00", vivo: "#c98a1a" },
  barro: { id: "barro", nombre: "Barro", oscuro: "#3d160d", medio: "#8a3320", vivo: "#c0583a" },
  agua: { id: "agua", nombre: "Agua", oscuro: "#0b2e2e", medio: "#1a5f5f", vivo: "#2a8a8a" },
  uva: { id: "uva", nombre: "Uva", oscuro: "#241640", medio: "#4a3a8a", vivo: "#7a4e9b" },
  indigo: { id: "indigo", nombre: "Índigo", oscuro: "#131c40", medio: "#2a3a8a", vivo: "#4a5ab8" },
};

/** Qué acento tiene cada ruta. Lo que no aparece usa el verde de la marca. */
const POR_RUTA: [string, keyof typeof ACENTOS][] = [
  ["/accesibilidad", "cable"],
  ["/corredor-49", "ambar"],
  ["/problematicas", "barro"],
  ["/radar", "agua"],
  ["/barrios", "uva"],
  ["/datos", "indigo"],
];

export function acentoDeRuta(pathname: string): Acento {
  const hallado = POR_RUTA.find(([r]) => pathname.startsWith(r));
  return ACENTOS[hallado ? hallado[1] : "ladera"];
}

/** Semáforo único del sitio: bien, ojo, mal. Siempre con texto además del color. */
export const SEMAFORO = { bien: "#2d9a5a", ojo: "#e0a526", mal: "#c0583a" } as const;
