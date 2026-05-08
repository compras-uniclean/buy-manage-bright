import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { DataTable, PageHeader } from "@/components/DataTable";
import { getEstoque } from "@/lib/sheets.functions";

export const Route = createFileRoute("/estoque")({ component: EstoquePage });

function EstoquePage() {
  const { data = [], isLoading } = useQuery({ queryKey: ["estoque"], queryFn: () => getEstoque() });

  return (
    <AppLayout>
      <PageHeader title="Estoque" description="Relatório completo de estoque com situação e necessidade de compra" />
      {isLoading ? (
        <div className="text-muted-foreground">Carregando...</div>
      ) : (
        <DataTable
          data={data}
          searchKeys={["Código", "Descrição", "Tipo", "Situação"]}
          columns={[
            { key: "Situação", label: "Situação", render: (r) => <SitBadge value={r["Situação"]} /> },
            { key: "Código", label: "Código", className: "font-mono text-xs" },
            { key: "Descrição", label: "Descrição" },
            { key: "Tipo", label: "Tipo" },
            { key: "Estoque Atual", label: "Estoque", className: "text-right" },
            { key: "Disponível", label: "Disp.", className: "text-right" },
            { key: "Reservado", label: "Reserv.", className: "text-right" },
            { key: "Mín.", label: "Mín.", className: "text-right" },
            { key: "Máx.", label: "Máx.", className: "text-right" },
            { key: "Qtd a comprar", label: "A comprar", className: "text-right font-semibold" },
          ]}
        />
      )}
    </AppLayout>
  );
}

function SitBadge({ value }: { value: string }) {
  const v = (value || "").toLowerCase();
  const cls = v.includes("atend")
    ? "bg-success/15 text-success-foreground border-success/30"
    : v.includes("comprar") || v.includes("crítico") || v.includes("critico")
    ? "bg-warning/15 text-warning-foreground border-warning/30"
    : "bg-muted text-muted-foreground border-border";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${cls}`}>{value || "—"}</span>;
}
