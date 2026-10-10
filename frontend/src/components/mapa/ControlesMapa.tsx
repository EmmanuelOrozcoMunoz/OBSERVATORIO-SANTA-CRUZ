import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Map as MapaML } from "maplibre-gl";
import { textoHora } from "../../lib/sol";

// --------------------------------------------------------------------- íconos
const svg = (d: ReactNode, cls = "h-6 w-6") => (
  <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);
const ICONOS = {
  mas: svg(<path d="M12 5v14M5 12h14" />),
  menos: svg(<path d="M5 12h14" />),
  camara: svg(<><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>),
  sol: svg(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>),
  luna: svg(<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />),
};

const boton =
  "grid h-12 w-12 place-items-center rounded-2xl bg-superficie/95 text-tinta shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-superficie focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a4d2e] disabled:opacity-50";

/** Sigue el giro y la inclinación del mapa para la brújula y el joystick. */
function useCamara(mapa: MapaML | null) {
  const [cam, setCam] = useState({ giro: 0, inclinacion: 0 });
  useEffect(() => {
    if (!mapa) return;
    const leer = () => setCam({ giro: mapa.getBearing(), inclinacion: mapa.getPitch() });
    leer();
    mapa.on("move", leer);
    return () => {
      mapa.off("move", leer);
    };
  }, [mapa]);
  return cam;
}

// --------------------------------------------------------------------- foto HD
const fechaArchivo = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * Foto del mapa sin botones ni paneles, de 2560 px de ancho (2K).
 * Sube la resolución del canvas, espera a que termine de dibujar y compone: degradado de fondo,
 * mapa, viñeta, nombres de barrio visibles y créditos de los datos.
 */
export async function capturarFoto(mapa: MapaML, noche: boolean): Promise<void> {
  const lienzo = mapa.getCanvas();
  const ancho = lienzo.clientWidth || 1;
  const original = mapa.getPixelRatio();
  mapa.setPixelRatio(Math.min(2560 / ancho, 4));
  try {
    await new Promise<void>((r) => mapa.once("idle", () => r()));
    // La letra de los nombres; si no llega en 1,5 s se sigue con la de respaldo
    await Promise.race([document.fonts?.load?.('600 32px "Inter"').catch(() => undefined), new Promise((r) => setTimeout(r, 1500))]);
    const salida = document.createElement("canvas");
    await new Promise<void>((r) => {
      mapa.once("render", () => {
        salida.width = lienzo.width;
        salida.height = lienzo.height;
        const g = salida.getContext("2d")!;
        const fondo = g.createLinearGradient(0, 0, salida.width, salida.height);
        fondo.addColorStop(0, noche ? "#0b1310" : "#f8f6f1");
        fondo.addColorStop(1, noche ? "#12201a" : "#e8f0e8");
        g.fillStyle = fondo;
        g.fillRect(0, 0, salida.width, salida.height);
        g.drawImage(lienzo, 0, 0); // dentro del evento "render" el buffer todavía tiene el cuadro
        r();
      });
      mapa.triggerRepaint();
    });
    const g = salida.getContext("2d")!;
    const W = salida.width, H = salida.height, k = W / ancho;
    // Viñeta
    const v = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.72);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, noche ? "rgba(4,9,7,0.55)" : "rgba(232,240,232,0.6)");
    g.fillStyle = v;
    g.fillRect(0, 0, W, H);
    // Nombres de barrio que se ven en pantalla
    const caja = lienzo.getBoundingClientRect();
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `600 ${Math.round(15 * k)}px Inter, Archivo, sans-serif`;
    document.querySelectorAll<HTMLElement>(".etiqueta-barrio.visible").forEach((el) => {
      const r = el.getBoundingClientRect();
      const x = (r.left + r.width / 2 - caja.left) * k, y = (r.top + r.height / 2 - caja.top) * k;
      if (x < 0 || y < 0 || x > W || y > H) return;
      g.shadowColor = noche ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,1)";
      g.shadowBlur = 4 * k;
      g.fillStyle = noche ? "#e8f3ec" : "#1a4d2e";
      for (let i = 0; i < 3; i++) g.fillText(el.textContent ?? "", x, y);
    });
    g.shadowBlur = 0;
    // Créditos
    const pie = Math.round(13 * k);
    g.font = `600 ${Math.round(18 * k)}px Inter, Archivo, sans-serif`;
    g.textAlign = "left";
    g.fillStyle = noche ? "rgba(232,243,236,0.92)" : "rgba(26,77,46,0.92)";
    g.fillText("Santa Cruz · Comuna 2, Medellín", 24 * k, H - 44 * k);
    g.font = `400 ${pie}px Inter, Archivo, sans-serif`;
    g.fillText(`Observatorio Santa Cruz · ${new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}`, 24 * k, H - 22 * k);
    g.textAlign = "right";
    g.fillText("Datos: Alcaldía de Medellín, DANE · © OpenStreetMap, OpenMapTiles, OpenFreeMap", W - 24 * k, H - 22 * k);
    const blob = await new Promise<Blob | null>((r) => salida.toBlob(r, "image/png"));
    if (!blob) throw new Error("No se pudo crear la imagen");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `santa-cruz-mapa-${fechaArchivo()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } finally {
    mapa.setPixelRatio(original);
  }
}

// --------------------------------------------------------------------- joystick
/**
 * Control 3D: mover la perilla a los lados gira el mapa (360°, sin tope) y arriba/abajo lo inclina
 * de 0° a 60°. Mientras se sostiene, la cámara sigue moviéndose. Doble clic vuelve al norte.
 */
export function Joystick({ mapa, className = "" }: { mapa: MapaML | null; className?: string }) {
  const base = useRef<HTMLDivElement>(null);
  const [perilla, setPerilla] = useState({ x: 0, y: 0 });
  const empuje = useRef({ x: 0, y: 0, activo: false });
  const cam = useCamara(mapa);
  const R = 40;

  useEffect(() => {
    if (!mapa) return;
    let id = 0;
    const paso = () => {
      const e = empuje.current;
      if (e.activo && (e.x || e.y)) {
        const giro = mapa.getBearing() + (e.x / R) * 2.4;
        const inclinacion = Math.max(0, Math.min(60, mapa.getPitch() - (e.y / R) * 1.4));
        mapa.jumpTo({ bearing: giro, pitch: inclinacion });
      }
      id = requestAnimationFrame(paso);
    };
    id = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(id);
  }, [mapa]);

  const mover = (cx: number, cy: number) => {
    const r = base.current!.getBoundingClientRect();
    let x = cx - (r.left + r.width / 2), y = cy - (r.top + r.height / 2);
    const d = Math.hypot(x, y);
    if (d > R) { x = (x / d) * R; y = (y / d) * R; }
    empuje.current = { x, y, activo: true };
    setPerilla({ x, y });
  };
  const soltar = () => {
    empuje.current = { x: 0, y: 0, activo: false };
    setPerilla({ x: 0, y: 0 });
  };
  const teclado = (e: React.KeyboardEvent) => {
    if (!mapa) return;
    const t: Record<string, () => void> = {
      ArrowLeft: () => mapa.easeTo({ bearing: mapa.getBearing() - 15, duration: 300 }),
      ArrowRight: () => mapa.easeTo({ bearing: mapa.getBearing() + 15, duration: 300 }),
      ArrowUp: () => mapa.easeTo({ pitch: Math.min(60, mapa.getPitch() + 10), duration: 300 }),
      ArrowDown: () => mapa.easeTo({ pitch: Math.max(0, mapa.getPitch() - 10), duration: 300 }),
    };
    if (t[e.key]) { e.preventDefault(); t[e.key](); }
  };

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div
        ref={base}
        role="application"
        tabIndex={0}
        aria-label={`Control 3D. Giro ${Math.round(((cam.giro % 360) + 360) % 360)} grados, inclinación ${Math.round(cam.inclinacion)} grados. Use las flechas del teclado. Doble clic vuelve al norte.`}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); mover(e.clientX, e.clientY); }}
        onPointerMove={(e) => empuje.current.activo && mover(e.clientX, e.clientY)}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onDoubleClick={() => mapa?.easeTo({ bearing: 0, duration: 700 })}
        onKeyDown={teclado}
        className="joystick relative grid h-[7.5rem] w-[7.5rem] touch-none select-none place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a4d2e]"
      >
        {/* marcas de giro e inclinación */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-2 rounded-full border border-dashed border-marca/25" />
        <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 text-[10px] font-bold text-marca/70">INCLINAR</span>
        <span aria-hidden="true" className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 text-base font-bold text-marca/60">⟲</span>
        <span aria-hidden="true" className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-base font-bold text-marca/60">⟳</span>
        <span
          aria-hidden="true"
          className="joystick-perilla pointer-events-none h-12 w-12 rounded-full"
          style={{ transform: `translate(${perilla.x}px, ${perilla.y}px)`, transition: empuje.current.activo ? "none" : "transform 220ms cubic-bezier(.2,1.4,.4,1)" }}
        />
      </div>
      <p className="rounded-full bg-superficie/90 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-tinta shadow">
        {Math.round(((cam.giro % 360) + 360) % 360)}° · {Math.round(cam.inclinacion)}° incl.
      </p>
    </div>
  );
}

// --------------------------------------------------------------------- columna de botones
export function Brujula({ mapa }: { mapa: MapaML | null }) {
  const cam = useCamara(mapa);
  return (
    <button
      type="button"
      className={boton}
      title="Brújula: volver al norte"
      aria-label="Volver al norte"
      onClick={() => mapa?.easeTo({ bearing: 0, duration: 700 })}
      disabled={!mapa}
    >
      <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true" style={{ transform: `rotate(${-cam.giro}deg)`, transition: "transform 80ms linear" }}>
        <path d="M12 2 15.5 12H8.5z" fill="#c2463a" />
        <path d="M12 22 8.5 12h7z" fill="#1a4d2e" opacity="0.35" />
        <text x="12" y="7.6" textAnchor="middle" fontSize="4.6" fontWeight="700" fill="#fff">N</text>
      </svg>
    </button>
  );
}

export function BotonesCamara({
  mapa,
  noche,
  onNoche,
  conNoche = true,
  onAviso,
}: {
  mapa: MapaML | null;
  noche: boolean;
  onNoche?: () => void;
  conNoche?: boolean;
  onAviso?: (t: string) => void;
}) {
  const [tomando, setTomando] = useState(false);
  const foto = async () => {
    if (!mapa || tomando) return;
    setTomando(true);
    onAviso?.("Preparando la foto en alta resolución…");
    try {
      await capturarFoto(mapa, noche);
      onAviso?.("Foto descargada");
    } catch {
      onAviso?.("No se pudo tomar la foto. Intente de nuevo.");
    } finally {
      setTomando(false);
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col overflow-hidden rounded-2xl bg-superficie/95 shadow-lg backdrop-blur">
        <button type="button" aria-label="Acercar" title="Acercar" disabled={!mapa} onClick={() => mapa?.zoomIn()} className="grid h-12 w-12 place-items-center text-tinta hover:bg-papel-hondo">
          {ICONOS.mas}
        </button>
        <span className="mx-2 h-px bg-nivel" />
        <button type="button" aria-label="Alejar" title="Alejar" disabled={!mapa} onClick={() => mapa?.zoomOut()} className="grid h-12 w-12 place-items-center text-tinta hover:bg-papel-hondo">
          {ICONOS.menos}
        </button>
      </div>
      <Brujula mapa={mapa} />
      {conNoche && onNoche && (
        <button type="button" className={`${boton} ${noche ? "!bg-[#16241d] !text-[#ffd66b]" : ""}`} aria-pressed={noche} aria-label={noche ? "Cambiar a día" : "Cambiar a noche"} title={noche ? "Ver de día" : "Ver de noche"} onClick={onNoche}>
          {noche ? ICONOS.luna : ICONOS.sol}
        </button>
      )}
      <button type="button" className={boton} aria-label="Capturar foto HD del mapa" title="Capturar foto HD (PNG 2K)" disabled={!mapa || tomando} onClick={foto}>
        {tomando ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-marca border-t-transparent" /> : ICONOS.camara}
      </button>
    </div>
  );
}

/** Deslizador de la hora del sol (mueve luz y sombras de los edificios). */
export function HoraSol({ hora, onHora }: { hora: number; onHora: (h: number) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-2xl bg-superficie/95 px-3 py-2 text-sm font-semibold text-tinta shadow-lg backdrop-blur">
      <span aria-hidden="true" className="text-[#c98a1a]">{ICONOS.sol}</span>
      <span className="w-[4.6rem] tabular-nums">{textoHora(hora)}</span>
      <input
        type="range"
        min={6}
        max={18}
        step={0.25}
        value={hora}
        onChange={(e) => onHora(Number(e.target.value))}
        aria-label="Hora del sol para las sombras"
        className="rango-verde w-28"
      />
    </label>
  );
}
