import { IngredientsClient } from "@/components/ingredients-client";

export const metadata = {
    title: "Ingredientes | Panadería Inteligente",
    description: "Gestiona el stock de tus ingredientes.",
};

export default function IngredientsPage() {
    return <IngredientsClient />;
}
