/**
 * Posición aproximada del sol (fórmulas de la NOAA, error menor a 1°), para las sombras del mapa 3D.
 * Medellín está a 6,3° N, así que el sol pasa casi por encima al mediodía todo el año.
 */
const RAD = Math.PI / 180;

export interface PosicionSol {
  /** Grados desde el norte, en sentido horario (90 = oriente). */
  azimut: number;
  /** Grados sobre el horizonte. Negativo = de noche. */
  altura: number;
}

/** `hora` en hora local de Colombia (UTC-5), con decimales: 14.5 = 2:30 p. m. */
export function posicionSol(fecha: Date, hora: number, lat = 6.2995, lon = -75.5538): PosicionSol {
  const inicio = Date.UTC(fecha.getFullYear(), 0, 0);
  const dia = Math.floor((Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) - inicio) / 86400000);
  const g = ((2 * Math.PI) / 365) * (dia - 1 + (hora - 12) / 24);
  const ecTiempo = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl =
    0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const minutosSolares = hora * 60 + ecTiempo + 4 * lon - 60 * -5;
  const angHorario = (minutosSolares / 4 - 180) * RAD;
  const phi = lat * RAD;
  const cosZenit = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(angHorario);
  const zenit = Math.acos(Math.max(-1, Math.min(1, cosZenit)));
  const altura = 90 - zenit / RAD;
  // Azimut desde el norte, horario
  const az = Math.atan2(Math.sin(angHorario), Math.cos(angHorario) * Math.sin(phi) - Math.tan(decl) * Math.cos(phi)) / RAD + 180;
  return { azimut: (az + 360) % 360, altura };
}

/** Hora local de Colombia ahora mismo, con decimales. */
export function horaColombia(ahora = new Date()): number {
  const utc = ahora.getUTCHours() + ahora.getUTCMinutes() / 60;
  return (utc - 5 + 24) % 24;
}

export const textoHora = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const sufijo = hh < 12 ? "a. m." : "p. m.";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${sufijo}`;
};
