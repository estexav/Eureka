import { SalesHistoryClient } from "@/components/sales-history-client";

export const metadata = {
    title: "Historial de Ventas | Panadería Inteligente",
    description: "Consulta el historial completo de todas tus ventas.",
};

export default function SalesHistoryPage() {
    return <SalesHistoryClient />;
}
