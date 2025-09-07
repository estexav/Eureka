'use client';
import { useData } from '@/hooks/use-data';
import { PageHeader } from './page-header';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';

const saleSchema = z.object({
  recipeId: z.string().min(1, 'Selecciona una receta'),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser mayor a 0'),
});

export function SalesClient() {
  const { sales, recipes, addSale, getRecipeName, isInitialized } = useData();

  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: { recipeId: '', quantity: 1 },
  });

  const onSubmit = (values: z.infer<typeof saleSchema>) => {
    addSale(values);
    form.reset();
  };
  
  if (!isInitialized) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <PageHeader title="Ventas" description="Registra tus ventas y actualiza tu stock." />
          <Skeleton className="h-80" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
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

  const recentSales = [...sales].reverse().slice(0, 5);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <PageHeader title="Ventas" description="Registra tus ventas y actualiza tu stock." />
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nueva Venta</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="recipeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receta</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una receta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {recipes.map(rec => (
                            <SelectItem key={rec.id} value={rec.id}>{rec.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Registrar Venta</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ventas Recientes</CardTitle>
          <Button asChild variant="outline" size="sm">
              <Link href="/sales-history">Ver todo el historial</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receta</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSales.length > 0 ? recentSales.map(sale => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{getRecipeName(sale.recipeId)}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>{format(new Date(sale.date), "d MMM yyyy, HH:mm", { locale: es })}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No hay ventas registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
