import { StockPredictionClient } from "@/components/stock-prediction-client";

export const metadata = {
    title: "Predicción de Stock | Panadería Inteligente (Beta)",
    description: "Usa IA para predecir el agotamiento de stock y generar listas de compras.",
};

export default function StockPredictionPage() {
    return <StockPredictionClient />;
}
