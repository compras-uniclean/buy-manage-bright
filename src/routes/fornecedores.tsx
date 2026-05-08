import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { DataTable, PageHeader } from "@/components/DataTable";
import { getFornecedores, updateFornecedor } from "@/lib/sheets.functions";
import { Pencil, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/fornecedores")({ component: FornecedoresPage });

function FornecedoresPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["fornecedores"], queryFn: () => getFornecedores() });
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (vars: { rowIndex: number; email: string; telefone: string; status: string; cidade: string }) =>
      updateFornecedor({ data: vars }),
    onSuccess: () => {
      toast.success("Fornecedor atualizado");
      qc.invalidateQueries({ queryKey: ["fornecedores"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(`Erro: ${e?.message ?? "falha ao atualizar"}`),
  });

  // augment data with original index for sheet row mapping
  const indexed = data.map((row, i) => ({ ...row, __idx: i }));

  const startEdit = (row: any) => {
    setEditing(row.__idx);
    setDraft({
      "E-mail": row["E-mail"] ?? "",
      Telefone: row["Telefone"] ?? "",
      Status: row["Status"] ?? "",
      Cidade: row["Cidade"] ?? "",
    });
  };

  const save = (row: any) => {
    mutation.mutate({
      rowIndex: row.__idx + 2, // +2 because sheet header is row 1, data starts at row 2
      email: draft["E-mail"] ?? "",
      telefone: draft["Telefone"] ?? "",
      status: draft["Status"] ?? "",
      cidade: draft["Cidade"] ?? "",
    });
  };

  return (
    <AppLayout>
      <PageHeader title="Fornecedores" description="Cadastro de fornecedores — clique no ícone para editar" />
      {isLoading ? (
        <div className="text-muted-foreground">Carregando...</div>
      ) : (
        <DataTable
          data={indexed as any[]}
          searchKeys={["Código Fornecedor", "Nome Fornecedor", "E-mail", "Cidade", "CNPJ Emitente"]}
          columns={[
            { key: "Código Fornecedor", label: "Cód.", className: "font-mono text-xs" },
            { key: "Nome Fornecedor", label: "Nome" },
            {
              key: "E-mail",
              label: "E-mail",
              render: (r: any) => editing === r.__idx
                ? <Input value={draft["E-mail"]} onChange={(e) => setDraft({ ...draft, "E-mail": e.target.value })} className="h-8" />
                : <span>{r["E-mail"]}</span>,
            },
            {
              key: "Telefone",
              label: "Telefone",
              render: (r: any) => editing === r.__idx
                ? <Input value={draft["Telefone"]} onChange={(e) => setDraft({ ...draft, Telefone: e.target.value })} className="h-8" />
                : <span>{r["Telefone"]}</span>,
            },
            {
              key: "Status",
              label: "Status",
              render: (r: any) => editing === r.__idx
                ? <Input value={draft["Status"]} onChange={(e) => setDraft({ ...draft, Status: e.target.value })} className="h-8" />
                : <span>{r["Status"]}</span>,
            },
            {
              key: "Cidade",
              label: "Cidade",
              render: (r: any) => editing === r.__idx
                ? <Input value={draft["Cidade"]} onChange={(e) => setDraft({ ...draft, Cidade: e.target.value })} className="h-8" />
                : <span>{r["Cidade"]}</span>,
            },
            { key: "CNPJ Emitente", label: "CNPJ", className: "font-mono text-xs" },
            {
              key: "__actions",
              label: "",
              render: (r: any) =>
                editing === r.__idx ? (
                  <div className="flex gap-1">
                    <button onClick={() => save(r)} disabled={mutation.isPending} className="p-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
                      <Save className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setEditing(null)} className="p-1.5 rounded-md border hover:bg-muted">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => startEdit(r)} className="p-1.5 rounded-md border hover:bg-muted">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                ),
            },
          ]}
        />
      )}
    </AppLayout>
  );
}
