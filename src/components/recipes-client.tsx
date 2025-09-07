'use client';
import { useState } from 'react';
import { useData } from '@/hooks/use-data';
import { PageHeader } from './page-header';
import { Button } from './ui/button';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Recipe } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

const recipeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  ingredients: z.array(z.object({
    ingredientId: z.string().min(1, 'Selecciona un ingrediente'),
    quantity: z.coerce.number().min(1, 'La cantidad debe ser mayor a 0'),
  })).min(1, 'Agrega al menos un ingrediente'),
});

export function RecipesClient() {
  const { recipes, ingredients, addRecipe, updateRecipe, deleteRecipe, getIngredientName, isInitialized } = useData();
  const [open, setOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const form = useForm<z.infer<typeof recipeSchema>>({
    resolver: zodResolver(recipeSchema),
    defaultValues: { name: '', ingredients: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ingredients',
  });

  const handleOpenDialog = (recipe: Recipe | null = null) => {
    setEditingRecipe(recipe);
    if (recipe) {
      form.reset(recipe);
    } else {
      form.reset({ name: '', ingredients: [{ ingredientId: '', quantity: 0 }] });
    }
    setOpen(true);
  };

  const onSubmit = (values: z.infer<typeof recipeSchema>) => {
    if (editingRecipe) {
      updateRecipe({ ...editingRecipe, ...values });
    } else {
      addRecipe(values);
    }
    setOpen(false);
  };
  
  if (!isInitialized) {
     return (
      <>
        <PageHeader title="Recetas" description="Crea y gestiona tus recetas.">
          <Skeleton className="h-10 w-36" />
        </PageHeader>
        <Card>
          <CardContent className="p-0">
             <div className="p-4 space-y-2">
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
      <Dialog open={open} onOpenChange={setOpen}>
        <PageHeader title="Recetas" description="Crea y gestiona tus recetas.">
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Receta
          </Button>
        </PageHeader>
        <DialogContent className="max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecipe ? 'Editar' : 'Agregar'} Receta</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la receta</FormLabel>
                    <FormControl>
                      <Input placeholder="Pastel de Chocolate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>Ingredientes</FormLabel>
                <div className="space-y-2 mt-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.ingredientId`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un ingrediente" />
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
                        control={form.control}
                        name={`ingredients.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormControl>
                              <Input type="number" placeholder="Cant." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ ingredientId: '', quantity: 0 })}
                  >
                    Agregar Ingrediente
                  </Button>
                   <FormMessage>{form.formState.errors.ingredients?.root?.message}</FormMessage>
              </div>
              <Button type="submit">{editingRecipe ? 'Guardar Cambios' : 'Crear Receta'}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Ingredientes</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map(recipe => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">{recipe.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {recipe.ingredients.map(ing => `${getIngredientName(ing.ingredientId)} (${ing.quantity})`).join(', ')}
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
                        <DropdownMenuItem onClick={() => handleOpenDialog(recipe)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteRecipe(recipe.id)} className="text-destructive focus:text-destructive">
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
    </>
  );
}
