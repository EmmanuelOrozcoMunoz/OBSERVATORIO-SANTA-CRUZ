/**
 * Pruebas de la interfaz en un navegador real (Playwright).
 * Instalar una vez:  npm i -D playwright  y  npx playwright install chromium
 */
import { chromium } from "playwright";
// Uso: npm run build && npm run preview  (en otra terminal)  y luego  node pruebas/navegador.mjs
const BASE = process.env.BASE ?? "http://localhost:4173/";
const browser = await chromium.launch();
const ok = (c, m) => console.log(`${c ? "OK   " : "FALLA"} ${m}`);
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
const p = await ctx.newPage();
const errores = [];
p.on("pageerror", (e) => errores.push(e.message));

// 1. Participación: validación
await p.goto(BASE + "#/participacion", { waitUntil: "networkidle" });
await p.getByRole("button", { name: "Guardar reporte" }).click();
ok(await p.getByText("Elija qué tipo de problema").isVisible(), "valida categoría vacía");
ok(await p.getByText("Describa el problema con al menos 10").isVisible(), "valida descripción corta");
ok(await p.getByText("Marque en el mapa dónde está el problema").isVisible(), "valida ubicación faltante");
// punto fuera de la comuna (esquina del mapa)
const mapa = p.locator(".leaflet-container");
const caja = await mapa.boundingBox();
await mapa.click({ position: { x: 15, y: caja.height - 15 } });
ok(await p.getByText("queda fuera de la Comuna 2").isVisible(), "rechaza punto fuera de la comuna");
// punto dentro (centro)
await mapa.click({ position: { x: caja.width / 2, y: caja.height / 2 } });
ok(await p.getByText(/Punto marcado/).isVisible(), "acepta punto dentro de la comuna");
await p.getByLabel("Tipo de problema").selectOption("anden_danado");
await p.getByLabel("Descripción").fill("Mi teléfono es 3001234567");
await p.getByRole("button", { name: "Guardar reporte" }).click();
ok(await p.getByText("No escriba teléfonos ni correos").isVisible(), "bloquea datos personales");
await p.getByLabel("Descripción").fill("El andén está roto y la gente baja a la calle.");
await p.getByRole("button", { name: "Guardar reporte" }).click();
ok(await p.getByText(/Reporte guardado/).isVisible(), "guarda el reporte");
ok(await p.getByText("El andén está roto y la gente baja a la calle.").isVisible(), "reporte aparece en la lista");
// duplicado
await mapa.click({ position: { x: caja.width / 2 + 2, y: caja.height / 2 + 2 } });
await p.getByLabel("Tipo de problema").selectOption("anden_danado");
ok(await p.getByText(/Ya hay un reporte de este tipo a menos de 30 m/).isVisible(), "detecta posible duplicado");
await p.getByLabel("Descripción").fill("Otro problema en el mismo andén, más abajo.");
await p.getByRole("button", { name: "Guardar reporte" }).click();
ok(await p.getByText("Confirme que es un problema distinto").isVisible(), "exige confirmar duplicado");
// persiste tras recargar
await p.reload({ waitUntil: "networkidle" });
ok(await p.getByText("El andén está roto y la gente baja a la calle.").isVisible(), "el reporte persiste al recargar");
await p.getByRole("button", { name: "Borrar" }).first().click();
ok(await p.getByText("Todavía no hay reportes").isVisible(), "borrar funciona");

// 2. Mapa: ficha por URL y cierre
await p.goto(BASE + "#/mapa?barrio=0210", { waitUntil: "networkidle" });
await p.waitForTimeout(800);
ok(await p.getByRole("heading", { name: "Santa Cruz", exact: true }).isVisible(), "abre ficha del barrio desde la URL");
await p.getByRole("button", { name: "Cerrar ficha" }).click();
ok(!(await p.getByRole("button", { name: "Cerrar ficha" }).isVisible()), "cierra la ficha");
// activar capa de oferta y verificar que carga
await p.getByLabel("Oferta inmobiliaria publicada (OIME, 2023)").check();
await p.waitForTimeout(800);
ok((await p.locator(".leaflet-puntos-pane path, .leaflet-pane path").count()) > 0, "capas dibujadas en el mapa");

// 3. Indicadores: resaltar barrio
await p.goto(BASE + "#/indicadores", { waitUntil: "networkidle" });
await p.getByLabel("Resaltar un barrio").selectOption("0201");
ok(await p.getByText("Ficha del barrio seleccionado").isVisible(), "muestra ficha al resaltar barrio");

// 4. Estado de error: simular que falta indicadores.json
const ctx2 = await browser.newContext({ ignoreHTTPSErrors: true });
const p2 = await ctx2.newPage();
await p2.route("**/data/indicadores.json", (r) => r.fulfill({ status: 404, body: "" }));
await p2.goto(BASE + "#/indicadores", { waitUntil: "networkidle" });
ok(await p2.getByText("No se pudieron cargar los datos.").isVisible(), "muestra error si faltan datos");
ok(await p2.getByRole("button", { name: "Intentar de nuevo" }).isVisible(), "ofrece reintentar");
// 5. Ruta inexistente
await p2.goto(BASE + "#/no-existe", { waitUntil: "networkidle" });
ok(await p2.getByText("Esta página no existe").isVisible(), "página no encontrada");

console.log(errores.length ? "Errores JS: " + errores.join(" | ") : "Sin errores de JavaScript");
await browser.close();
