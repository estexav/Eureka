'use client';
import { useData } from '@/hooks/use-data';
import { PageHeader } from './page-header';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';

export function SalesHistoryClient() {
  const { sales, getRecipeName, isInitialized } = useData();

  if (!isInitialized) {
    return (
      <div>
        <PageHeader title="Historial de Ventas" description="Consulta el historial completo de todas tus ventas." />
        <Card>
          <CardHeader>
            <CardTitle>Todas las Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
        <PageHeader title="Historial de Ventas" description="Consulta el historial completo de todas tus ventas." />
        <Card>
            <CardHeader>
                <CardTitle>Todas las Ventas</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh]">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Receta</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Fecha</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {[...sales].reverse().map(sale => (
                            <TableRow key={sale.id}>
                            <TableCell className="font-medium">{getRecipeName(sale.recipeId)}</TableCell>
                            <TableCell>{sale.quantity}</TableCell>
                            <TableCell>{format(new Date(sale.date), "d MMM yyyy, HH:mm", { locale: es })}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                 {sales.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        No hay ventas registradas todavía.
                    </div>
                 )}
            </CardContent>
        </Card>
    </div>
  );
}
