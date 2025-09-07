import { PurchaseListClient } from "@/components/purchase-list-client";

export const metadata = {
    title: "Lista de Compras | Panadería Inteligente",
    description: "Genera una lista de compras inteligente basada en tu stock.",
};

export default function PurchaseListPage() {
    return <PurchaseListClient />;
}
