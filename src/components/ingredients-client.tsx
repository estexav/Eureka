'use client';
import { useState } from 'react';
import { useData } from '@/hooks/use-data';
import { PageHeader } from './page-header';
import { Button } from './ui/button';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, PackagePlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import type { Ingredient } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';

const ingredientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  stock: z.coerce.number().min(0, 'El stock no puede ser negativo'),
  unit: z.string().min(1, 'La unidad es requerida'),
  reorderPoint: z.coerce.number().min(0, 'El punto de pedido no puede ser negativo'),
});

const restockSchema = z.object({
  ingredientId: z.string().min(1, 'Selecciona un ingrediente'),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser mayor a 0'),
});

const unitOptions = ['gr', 'Kg', 'ml', 'L', 'Unidades'];

export function IngredientsClient() {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, isInitialized } = useData();
  const [open, setOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ingredientSchema>>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: { name: '', stock: 0, unit: '', reorderPoint: 0 },
  });

  const restockForm = useForm<z.infer<typeof restockSchema>>({
    resolver: zodResolver(restockSchema),
    defaultValues: { ingredientId: '', quantity: 1 },
  });

  const handleOpenDialog = (ingredient: Ingredient | null = null) => {
    setEditingIngredient(ingredient);
    if (ingredient) {
      form.reset(ingredient);
    } else {
      form.reset({ name: '', stock: 0, unit: '', reorderPoint: 0 });
    }
    setOpen(true);
  };

  const onSubmit = (values: z.infer<typeof ingredientSchema>) => {
    if (editingIngredient) {
      updateIngredient({ ...editingIngredient, ...values });
    } else {
      addIngredient(values);
    }
    setOpen(false);
  };

  const onRestockSubmit = (values: z.infer<typeof restockSchema>) => {
    const ingredient = ingredients.find(i => i.id === values.ingredientId);
    if (ingredient) {
      updateIngredient({ ...ingredient, stock: ingredient.stock + values.quantity });
      toast({
        title: 'Stock Actualizado',
        description: `Se agregaron ${values.quantity} ${ingredient.unit} de ${ingredient.name}.`,
      });
      restockForm.reset({ ingredientId: '', quantity: 1 });
    }
  };
  
  const handleDelete = async () => {
    if (deletingId) {
      await deleteIngredient(deletingId);
      setDeletingId(null);
    }
  };

  if (!isInitialized) {
    return (
      <>
        <PageHeader title="Ingredientes" description="Gestiona el stock de tus ingredientes.">
          <Skeleton className="h-10 w-40" />
        </PageHeader>
        <Card>
          <CardContent className="p-0">
             <div className="p-4 space-y-2">
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el ingrediente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <PageHeader title="Ingredientes" description="Gestiona el stock de tus ingredientes.">
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Ingrediente
          </Button>
        </PageHeader>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIngredient ? 'Editar' : 'Agregar'} Ingrediente</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Harina" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Actual</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unitOptions.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reorderPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Punto de Pedido</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">{editingIngredient ? 'Guardar Cambios' : 'Crear Ingrediente'}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardContent className="p-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {ingredients.map(ingredient => (
                        <TableRow key={ingredient.id}>
                        <TableCell className="font-medium">{ingredient.name}</TableCell>
                        <TableCell>
                            {ingredient.stock} {ingredient.unit}
                        </TableCell>
                        <TableCell>
                            {ingredient.stock <= ingredient.reorderPoint ? (
                            <Badge variant="destructive">Bajo</Badge>
                            ) : (
                            <Badge variant="secondary">OK</Badge>
                            )}
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenDialog(ingredient)}>
                                <Pencil className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeletingId(ingredient.id)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Reabastecer Stock</CardTitle>
                    <CardDescription>Agrega stock a un ingrediente existente.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...restockForm}>
                        <form onSubmit={restockForm.handleSubmit(onRestockSubmit)} className="space-y-4">
                        <FormField
                            control={restockForm.control}
                            name="ingredientId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Ingrediente</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona..." />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {ingredients.map(ing => (
                                        <SelectItem key={ing.id} value={ing.id}>{ing.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                             <FormField
                                control={restockForm.control}
                                name="quantity"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cantidad a Agregar</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">
                                <PackagePlus className="mr-2 h-4 w-4" />
                                Agregar al Stock
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
