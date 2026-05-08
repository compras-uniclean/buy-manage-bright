import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { DataTable, PageHeader } from "@/components/DataTable";
import { getCotacoes } from "@/lib/sheets.functions";

export const Route = createFileRoute("/cotacoes")({ component: CotacoesPage });

function CotacoesPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ["cotacoes"], queryFn: () => getCotacoes() });
  return (
    <AppLayout>
      <PageHeader title="Cotações" description="Solicitações de cotação enviadas a fornecedores" />
      {isLoading ? (
        <div className="text-muted-foreground">Carregando...</div>
      ) : (
        <DataTable
          data={data}
          searchKeys={["Código do Item", "Descrição do Item", "Fornecedor", "Código da Cotação"]}
          columns={[
            { key: "Código da Cotação", label: "Cotação", className: "font-mono text-xs" },
            { key: "Código do Item", label: "Código", className: "font-mono text-xs" },
            { key: "Descrição do Item", label: "Item" },
            { key: "Quantidade", label: "Qtd", className: "text-right" },
            { key: "Fornecedor", label: "Fornecedor" },
            { key: "Envio", label: "Envio" },
            {
              key: "Recebido",
              label: "Recebido",
              render: (r) => {
                const v = r["Recebido"];
                const ok = v?.toLowerCase().includes("recebida");
                return v ? (
                  <span className={ok ? "text-success-foreground" : "text-muted-foreground"}>{v}</span>
                ) : <span className="text-muted-foreground">—</span>;
              },
            },
          ]}
        />
      )}
    </AppLayout>
  );
}
