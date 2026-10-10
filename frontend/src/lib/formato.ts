const nf = new Intl.NumberFormat("es-CO");
const nf1 = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 });
const pesos = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export const num = (v: number | null | undefined) => (v == null ? "Sin dato" : nf.format(v));
export const dec = (v: number | null | undefined) => (v == null ? "Sin dato" : nf1.format(v));
export const dec2 = (v: number | null | undefined) => (v == null ? "Sin dato" : nf2.format(v));
export const pct = (v: number | null | undefined) => (v == null ? "Sin dato" : `${nf1.format(v)} %`);
export const cop = (v: number | null | undefined) => (v == null ? "Sin dato" : pesos.format(v));

export function metros(v: number | null | undefined) {
  if (v == null) return "Sin dato";
  return v >= 1000 ? `${nf1.format(v / 1000)} km` : `${nf.format(Math.round(v))} m`;
}

export function fecha(iso: string | null | undefined) {
  if (!iso) return "Sin dato";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
}

export const texto = (v: unknown) => (v == null || v === "" ? "Sin dato" : String(v));
