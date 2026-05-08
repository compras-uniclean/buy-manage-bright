import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { DataTable, PageHeader } from "@/components/DataTable";
import { getCompras } from "@/lib/sheets.functions";

export const Route = createFileRoute("/compras")({ component: ComprasPage });

function ComprasPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ["compras"], queryFn: () => getCompras() });

  return (
    <AppLayout>
      <PageHeader title="Compras Realizadas" description="Ordens de compra emitidas e seu status de entrega" />
      {isLoading ? (
        <div className="text-muted-foreground">Carregando...</div>
      ) : (
        <DataTable
          data={data}
          searchKeys={["Ordem de Compra", "Código do Item", "Descrição do Item", "Nome Fornecedor"]}
          columns={[
            { key: "Ordem de Compra", label: "OC", className: "font-mono text-xs" },
            { key: "Código do Item", label: "Código", className: "font-mono text-xs" },
            { key: "Descrição do Item", label: "Item" },
            { key: "Quantidade a ser faturada", label: "Qtd", className: "text-right" },
            { key: "Nome Fornecedor", label: "Fornecedor" },
            { key: "Data Prevista", label: "Prevista" },
            {
              key: "Data Entrega",
              label: "Entrega",
              render: (r) => r["Data Entrega"] ? <span className="text-success-foreground">{r["Data Entrega"]}</span> : <span className="text-muted-foreground">Pendente</span>,
            },
            { key: "Status", label: "Status" },
          ]}
        />
      )}
    </AppLayout>
  );
}
