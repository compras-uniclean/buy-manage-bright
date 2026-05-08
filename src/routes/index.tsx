import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/DataTable";
import { getEstoque, getCompras, getCotacoes, getFornecedores } from "@/lib/sheets.functions";
import { Package, ShoppingCart, FileText, Building2, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function StatCard({ icon: Icon, label, value, hint, tone = "default" }: { icon: any; label: string; value: string | number; hint?: string; tone?: "default" | "warning" | "success" }) {
  const toneClass =
    tone === "warning" ? "bg-warning/15 text-warning-foreground border-warning/30"
    : tone === "success" ? "bg-success/15 text-success-foreground border-success/30"
    : "bg-card border-border";
  return (
    <div className={`rounded-xl border p-5 ${toneClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Dashboard() {
  const estoque = useQuery({ queryKey: ["estoque"], queryFn: () => getEstoque() });
  const compras = useQuery({ queryKey: ["compras"], queryFn: () => getCompras() });
  const cotacoes = useQuery({ queryKey: ["cotacoes"], queryFn: () => getCotacoes() });
  const fornecedores = useQuery({ queryKey: ["fornecedores"], queryFn: () => getFornecedores() });

  const itensEstoque = estoque.data ?? [];
  const aComprar = itensEstoque.filter((r) => {
    const q = parseFloat(String(r["Qtd a comprar"] ?? "0").replace(",", "."));
    return q > 0;
  }).length;
  const atendidos = itensEstoque.filter((r) => String(r["Situação"]).toLowerCase().includes("atend")).length;

  const comprasAbertas = (compras.data ?? []).filter((r) => !r["Data Entrega"]).length;
  const cotacoesAbertas = (cotacoes.data ?? []).filter((r) => !String(r["Recebido"]).toLowerCase().includes("recebida")).length;

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        description="Visão geral integrada das planilhas de Compras e Estoque"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Itens em estoque" value={estoque.isLoading ? "…" : itensEstoque.length} hint="Relatório Estoque" />
        <StatCard icon={AlertTriangle} label="A comprar" value={estoque.isLoading ? "…" : aComprar} hint="Qtd a comprar > 0" tone={aComprar > 0 ? "warning" : "default"} />
        <StatCard icon={CheckCircle2} label="Atendidos" value={estoque.isLoading ? "…" : atendidos} tone="success" />
        <StatCard icon={Building2} label="Fornecedores" value={fornecedores.isLoading ? "…" : (fornecedores.data?.length ?? 0)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <StatCard icon={ShoppingCart} label="Compras em aberto" value={compras.isLoading ? "…" : comprasAbertas} hint="Sem data de entrega" />
        <StatCard icon={FileText} label="Cotações em aberto" value={cotacoes.isLoading ? "…" : cotacoesAbertas} hint="Aguardando retorno" />
      </div>

      <div className="mt-8 rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-3">Itens críticos (a comprar)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-left">
              <tr>
                <th className="py-2 pr-3">Código</th>
                <th className="py-2 pr-3">Descrição</th>
                <th className="py-2 pr-3 text-right">Estoque</th>
                <th className="py-2 pr-3 text-right">Mínimo</th>
                <th className="py-2 pr-3 text-right">Qtd a comprar</th>
              </tr>
            </thead>
            <tbody>
              {itensEstoque
                .filter((r) => parseFloat(String(r["Qtd a comprar"] ?? "0").replace(",", ".")) > 0)
                .slice(0, 12)
                .map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 pr-3 font-mono text-xs">{r["Código"]}</td>
                    <td className="py-2 pr-3">{r["Descrição"]}</td>
                    <td className="py-2 pr-3 text-right">{r["Estoque Atual"]}</td>
                    <td className="py-2 pr-3 text-right">{r["Mín."]}</td>
                    <td className="py-2 pr-3 text-right font-semibold text-warning-foreground">{r["Qtd a comprar"]}</td>
                  </tr>
                ))}
              {!estoque.isLoading && aComprar === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Nenhum item a comprar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
