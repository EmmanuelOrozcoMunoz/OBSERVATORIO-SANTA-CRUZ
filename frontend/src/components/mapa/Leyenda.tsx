import type { ItemLeyenda } from "../../lib/capas";

export interface BloqueLeyenda {
  titulo: string;
  items: ItemLeyenda[];
  nota?: string;
}

function Muestra({ item }: { item: ItemLeyenda }) {
  const f = item.forma ?? "area";
  if (f === "punto")
    return <span className="inline-block h-3 w-3 shrink-0 rounded-full border border-white" style={{ background: item.color }} />;
  if (f === "linea") return <span className="inline-block h-[3px] w-4 shrink-0 rounded" style={{ background: item.color }} />;
  if (f === "borde")
    return <span className="inline-block h-3 w-4 shrink-0 rounded-sm border-2" style={{ borderColor: item.color }} />;
  return <span className="inline-block h-3 w-4 shrink-0 rounded-sm" style={{ background: item.color }} />;
}

export default function Leyenda({ bloques }: { bloques: BloqueLeyenda[] }) {
  if (bloques.length === 0) return <p className="text-xs text-tinta-suave">Active una capa para ver su leyenda.</p>;
  return (
    <div className="space-y-3">
      {bloques.map((b) => (
        <div key={b.titulo}>
          <p className="text-xs font-semibold">{b.titulo}</p>
          <ul className="mt-1 space-y-0.5">
            {b.items.map((i) => (
              <li key={i.etiqueta} className="flex items-center gap-2 text-xs">
                <Muestra item={i} />
                {i.etiqueta}
              </li>
            ))}
          </ul>
          {b.nota && <p className="mt-1 text-xs text-tinta-tenue">{b.nota}</p>}
        </div>
      ))}
    </div>
  );
}
