'use client';
import { usePurchaseList } from '@/hooks/use-purchase-list';
import { PageHeader } from './page-header';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export function PurchaseListClient() {
  const { purchaseList, loading, error, generateList, addStock, generatedAt } = usePurchaseList();

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
                  <TableHead>Cantidad a Comprar</TableHead>
                  <TableHead>Razón</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseList.map(item => (
                  <TableRow key={item.ingredientId}>
                    <TableCell className="font-medium">{item.ingredientName}</TableCell>
                    <TableCell>{item.quantityToBuy} {item.unit}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.reason}</TableCell>
                    <TableCell className="text-right">
                       <Button 
                        size="sm" 
                        onClick={() => addStock(item.ingredientId, item.quantityToBuy)}
                        >
                          Marcar como Comprado
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
