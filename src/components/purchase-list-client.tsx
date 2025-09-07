'use client';
import { usePurchaseList } from '@/hooks/use-purchase-list';
import { PageHeader } from './page-header';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, PackagePlus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function PurchaseListClient() {
  const { purchaseList, loading, addStock, generatedAt } = usePurchaseList();
  const [purchasedQuantities, setPurchasedQuantities] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    const initialQuantities = purchaseList.reduce((acc, item) => {
      acc[item.ingredientId] = '';
      return acc;
    }, {} as Record<string, string>);
    setPurchasedQuantities(initialQuantities);
  }, [purchaseList]);

  const handleQuantityChange = (ingredientId: string, value: string) => {
    setPurchasedQuantities(prev => ({
      ...prev,
      [ingredientId]: value,
    }));
  };

  const handleAddStock = (ingredientId: string) => {
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
    
    // Clear the input after adding stock
    setPurchasedQuantities(prev => ({
      ...prev,
      [ingredientId]: '',
    }));
  }

  return (
    <>
      <PageHeader
        title="Lista de Compras"
        description="Ingredientes que están por debajo de su punto de pedido."
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Ingredientes a Comprar</CardTitle>
                <CardDescription>
                Última actualización: {generatedAt ? new Date(generatedAt).toLocaleString('es-ES') : 'Calculando...'}
                </CardDescription>
            </div>
            {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </CardHeader>
        <CardContent>
          {purchaseList.length > 0 ? (
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
                        onClick={() => handleAddStock(item.ingredientId)}
                        disabled={!purchasedQuantities[item.ingredientId]}
                        >
                          <PackagePlus className="mr-2 h-4 w-4" />
                          Agregar al Stock
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-10 text-muted-foreground">
                {loading ? 'Analizando tu inventario...' : '¡Todo en orden! No hay ingredientes por debajo del punto de pedido.'}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
