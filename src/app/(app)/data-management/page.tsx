import { DataManagementClient } from "@/components/data-management-client";

export const metadata = {
    title: "Gestión de Datos | Panadería Inteligente",
    description: "Importa y exporta los datos de tu aplicación.",
};

export default function DataManagementPage() {
    return <DataManagementClient />;
}
