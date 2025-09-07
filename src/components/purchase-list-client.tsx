'use client';
import { usePurchaseList } from '@/hooks/use-purchase-list';
import { PageHeader } from './page-header';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, PackagePlus, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function PurchaseListClient() {
  const { purchaseList, loading, error, generateList, addStock, generatedAt } = usePurchaseList();
  const [purchasedQuantities, setPurchasedQuantities] = useState<Record<string, number | string>>({});
  const { toast } = useToast();

  useEffect(() => {
    // Initialize quantities when purchase list changes
    const initialQuantities = purchaseList.reduce((acc, item) => {
      acc[item.ingredientId] = item.quantityToBuy;
      return acc;
    }, {} as Record<string, number | string>);
    setPurchasedQuantities(initialQuantities);
  }, [purchaseList]);

  const handleQuantityChange = (ingredientId: string, value: string) => {
    setPurchasedQuantities(prev => ({
      ...prev,
      [ingredientId]: value,
    }));
  };

  const handleAddStock = (ingredientId: string, name: string) => {
    const quantity = purchasedQuantities[ingredientId];
    const parsedQuantity = typeof quantity === 'string' ? parseFloat(quantity) : quantity;

    if (!parsedQuantity || parsedQuantity <= 0) {
      toast({
        title: 'Cantidad Inválida',
        description: 'Por favor, introduce una cantidad mayor que cero.',
        variant: 'destructive',
      });
      return;
    }
    
    addStock(ingredientId, parsedQuantity);
  }

  return (
    <>
      <PageHeader
        title="Lista de Compras Inteligente"
        description="Genera una lista de compras para los ingredientes que están por agotarse."
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generar Lista de Compras</CardTitle>
          <CardDescription>
            La IA analizará tu stock, puntos de pedido y ventas recientes para crear una lista de compras optimizada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateList} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Generando...' : 'Generar Nueva Lista'}
          </Button>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {purchaseList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Compras Sugerida</CardTitle>
             <CardDescription>
              Generada el: {generatedAt ? new Date(generatedAt).toLocaleString('es-ES') : 'N/A'}. 
              Esta lista se basa en los ingredientes que están por debajo de su punto de pedido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingrediente</TableHead>
                  <TableHead className="w-[250px]">Cantidad Comprada</TableHead>
                  <TableHead>Razón</TableHead>
                  <TableHead className="w-[180px] text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseList.map(item => (
                  <TableRow key={item.ingredientId}>
                    <TableCell className="font-medium">{item.ingredientName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <Input 
                          type="number"
                          value={purchasedQuantities[item.ingredientId] || ''}
                          onChange={(e) => handleQuantityChange(item.ingredientId, e.target.value)}
                          className="w-24 h-9"
                          placeholder="0"
                        />
                        <span className="text-sm text-muted-foreground">
                          (Sugerido: {item.quantityToBuy} {item.unit})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.reason}</TableCell>
                    <TableCell className="text-right">
                       <Button 
                        size="sm" 
                        onClick={() => handleAddStock(item.ingredientId, item.ingredientName)}
                        >
                          <PackagePlus className="mr-2 h-4 w-4" />
                          Agregar al Stock
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
