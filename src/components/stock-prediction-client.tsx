'use client';
import { useState } from 'react';
import { useData } from '@/hooks/use-data';
import { PageHeader } from './page-header';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { predictStockDepletion, PredictStockDepletionOutput } from '@/ai/flows/predict-stock-depletion';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type ParsedOutput = {
  ingredientDepletionEstimates: Record<string, number>;
  purchaseList: Record<string, number>;
  lowStockIngredients: Record<string, number>;
  suggestedIngredientQuantities: Record<string, number>;
}

export function StockPredictionClient() {
  const { ingredients, recipes, sales } = useData();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<ParsedOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    const salesData = sales.reduce((acc, sale) => {
      const recipeName = recipes.find(r => r.id === sale.recipeId)?.name || 'Unknown';
      acc[recipeName] = (acc[recipeName] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);

    const recipesData = recipes.reduce((acc, recipe) => {
      acc[recipe.name] = recipe.ingredients.reduce((ingAcc, ing) => {
        const ingName = ingredients.find(i => i.id === ing.ingredientId)?.name || 'Unknown';
        const unit = ingredients.find(i => i.id === ing.ingredientId)?.unit || '';
        ingAcc[ingName] = `${ing.quantity} ${unit}`;
        return ingAcc;
      }, {} as Record<string, string>);
      return acc;
    }, {} as Record<string, Record<string, string>>);

    const currentStockData = ingredients.reduce((acc, ing) => {
      acc[ing.name] = `${ing.stock} ${ing.unit}`;
      return acc;
    }, {} as Record<string, string>);
    
    try {
      const result = await predictStockDepletion({
        salesData: JSON.stringify(salesData, null, 2),
        recipes: JSON.stringify(recipesData, null, 2),
        currentStock: JSON.stringify(currentStockData, null, 2),
      });

      // Safely parse JSON strings
      const parseJson = (jsonString: string, defaultValue: any) => {
          try {
              return JSON.parse(jsonString);
          } catch {
              return defaultValue;
          }
      }

      setPrediction({
        ingredientDepletionEstimates: parseJson(result.ingredientDepletionEstimates, {}),
        purchaseList: parseJson(result.purchaseList, {}),
        lowStockIngredients: parseJson(result.lowStockIngredients, {}),
        suggestedIngredientQuantities: parseJson(result.suggestedIngredientQuantities, {}),
      });
      
    } catch (e) {
      console.error(e);
      setError('Ocurrió un error al generar la predicción. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Predicción de Stock con IA"
        description="Usa IA para analizar tus datos y obtener predicciones inteligentes."
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generar Predicción</CardTitle>
          <CardDescription>
            Haz clic en el botón para usar los datos actuales de ventas, recetas y stock para generar una predicción.
            Esto puede tardar unos segundos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handlePredict} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BrainCircuit className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Generando...' : 'Generar Predicción de Stock'}
          </Button>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {prediction && (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader><CardTitle>Lista de Compras Sugerida</CardTitle></CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                        {Object.entries(prediction.purchaseList).map(([name, quantity]) => (
                            <li key={name}><strong>{name}:</strong> {quantity}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Estimación de Agotamiento</CardTitle></CardHeader>
                <CardContent>
                     <ul className="list-disc pl-5 space-y-1">
                        {Object.entries(prediction.ingredientDepletionEstimates).map(([name, days]) => (
                            <li key={name}><strong>{name}:</strong> {days} días</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Ingredientes con Stock Bajo</CardTitle></CardHeader>
                <CardContent>
                     <ul className="list-disc pl-5 space-y-1">
                        {Object.entries(prediction.lowStockIngredients).map(([name, stock]) => (
                            <li key={name}><strong>{name}:</strong> {stock} restantes</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Cantidades Sugeridas para Recetas</CardTitle></CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                        {Object.entries(prediction.suggestedIngredientQuantities).map(([name, quantity]) => (
                            <li key={name}><strong>{name}:</strong> {quantity}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
      )}
    </>
  );
}
