import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { DataTable, PageHeader } from "@/components/DataTable";
import { getRetornos } from "@/lib/sheets.functions";

export const Route = createFileRoute("/retornos")({ component: RetornosPage });

function RetornosPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ["retornos"], queryFn: () => getRetornos() });
  return (
    <AppLayout>
      <PageHeader title="Retornos dos Fornecedores" description="Respostas recebidas com preços e condições" />
      {isLoading ? (
        <div className="text-muted-foreground">Carregando...</div>
      ) : (
        <DataTable
          data={data}
          searchKeys={["Código do Item", "Descrição do Item", "Nome Fornecedor", "Código da Cotação"]}
          columns={[
            { key: "Carimbo de data/hora", label: "Data" },
            { key: "Código da Cotação", label: "Cotação", className: "font-mono text-xs" },
            { key: "Código do Item", label: "Código", className: "font-mono text-xs" },
            { key: "Descrição do Item", label: "Item" },
            { key: "Quantidade", label: "Qtd", className: "text-right" },
            { key: "Valor por kg ou por unidade, em reais (R$)", label: "Valor R$", className: "text-right font-medium" },
            { key: "ICMS", label: "ICMS", className: "text-right" },
            { key: "IPI", label: "IPI", className: "text-right" },
            { key: "Condição de Pagamento", label: "Pagamento" },
            { key: "Tipo Frete", label: "Frete" },
            { key: "Nome Fornecedor", label: "Fornecedor" },
          ]}
        />
      )}
    </AppLayout>
  );
}
