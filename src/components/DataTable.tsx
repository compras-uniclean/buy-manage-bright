import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T | string)[];
  emptyMessage?: string;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKeys,
  emptyMessage = "Nenhum registro",
  pageSize = 50,
}: DataTableProps<T>) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!q.trim()) return data;
    const needle = q.toLowerCase();
    const keys = searchKeys ?? columns.map((c) => c.key);
    return data.filter((row) =>
      keys.some((k) => String(row[k as string] ?? "").toLowerCase().includes(needle))
    );
  }, [data, q, searchKeys, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const slice = filtered.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar..."
            className="pl-9 bg-card"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              {columns.map((c) => (
                <th key={String(c.key)} className={`text-left font-medium px-3 py-2.5 whitespace-nowrap ${c.className ?? ""}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {slice.map((row, i) => (
              <tr key={i} className="border-t hover:bg-muted/30">
                {columns.map((c) => (
                  <td key={String(c.key)} className={`px-3 py-2 align-top ${c.className ?? ""}`}>
                    {c.render ? c.render(row) : String(row[c.key as string] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <button
            className="px-3 py-1.5 rounded-md border bg-card disabled:opacity-50"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            Anterior
          </button>
          <span className="text-muted-foreground">
            Página {current} de {totalPages}
          </span>
          <button
            className="px-3 py-1.5 rounded-md border bg-card disabled:opacity-50"
            disabled={current === totalPages}
            onClick={() => setPage(current + 1)}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
