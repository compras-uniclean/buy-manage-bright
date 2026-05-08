import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Inbox,
  Building2,
  Boxes,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/estoque", label: "Estoque", icon: Package },
  { to: "/compras", label: "Compras Realizadas", icon: ShoppingCart },
  { to: "/cotacoes", label: "Cotações", icon: FileText },
  { to: "/retornos", label: "Retornos", icon: Inbox },
  { to: "/fornecedores", label: "Fornecedores", icon: Building2 },
  { to: "/itens", label: "Itens", icon: Boxes },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-6 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary grid place-items-center text-primary-foreground font-bold">S</div>
            <div>
              <div className="font-semibold tracking-tight">SupplyHub</div>
              <div className="text-xs text-sidebar-foreground/60">Compras &amp; Estoque</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 text-[11px] text-sidebar-foreground/50 border-t border-sidebar-border">
          Sincronizado via Google Sheets
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-sidebar text-sidebar-foreground p-4 flex gap-3 overflow-x-auto">
          {nav.map((item) => (
            <Link key={item.to} to={item.to} className="text-sm whitespace-nowrap" activeProps={{ className: "text-sm whitespace-nowrap font-semibold underline" }}>
              {item.label}
            </Link>
          ))}
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
