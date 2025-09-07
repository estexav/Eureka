'use client';
import { useData } from '@/hooks/use-data';
import { PageHeader } from './page-header';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Download, Upload } from 'lucide-react';
import type { AppData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';
import { Input } from './ui/input';

export function DataManagementClient() {
  const { ingredients, recipes, sales, importData } = useData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const appData: AppData = { ingredients, recipes, sales };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(appData, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `panaderia_inteligente_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast({ title: 'Exportación Exitosa', description: 'Tus datos se han descargado.' });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('File could not be read');
        const parsedData = JSON.parse(text);
        
        // Basic validation
        if ('ingredients' in parsedData && 'recipes' in parsedData && 'sales' in parsedData) {
            importData(parsedData);
        } else {
            throw new Error('Invalid file format');
        }
      } catch (error) {
        toast({
          title: 'Error de Importación',
          description: 'El archivo no es un backup válido o está corrupto.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  return (
    <>
      <PageHeader
        title="Gestión de Datos"
        description="Importa y exporta los datos de tu aplicación."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Exportar Datos</CardTitle>
            <CardDescription>
              Guarda una copia de seguridad de todos tus ingredientes, recetas y ventas en un archivo JSON.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Descargar Backup
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Importar Datos</CardTitle>
            <CardDescription>
              Carga un archivo de backup JSON para restaurar tus datos. ¡Cuidado! Esto sobreescribirá todos los datos actuales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleImportClick}>
              <Upload className="mr-2 h-4 w-4" />
              Cargar Backup
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="application/json"
              onChange={handleFileChange}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
