import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { DataTable, PageHeader } from "@/components/DataTable";
import { getItens } from "@/lib/sheets.functions";

export const Route = createFileRoute("/itens")({ component: ItensPage });

function ItensPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ["itens"], queryFn: () => getItens() });
  return (
    <AppLayout>
      <PageHeader title="Itens" description="Catálogo de itens cadastrados" />
      {isLoading ? (
        <div className="text-muted-foreground">Carregando...</div>
      ) : (
        <DataTable
          data={data}
          searchKeys={["Código do Item", "Descrição do Item"]}
          columns={[
            { key: "Código do Item", label: "Código", className: "font-mono text-xs" },
            { key: "Descrição do Item", label: "Descrição" },
          ]}
        />
      )}
    </AppLayout>
  );
}
