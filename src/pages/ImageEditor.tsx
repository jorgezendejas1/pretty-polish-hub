import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Wand2, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ImageEditor = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Archivo inválido',
        description: 'Por favor selecciona una imagen',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setEditedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Archivo inválido',
        description: 'Por favor selecciona una imagen',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setEditedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyMagic = async () => {
    if (!originalImage || !prompt.trim()) {
      toast({
        title: 'Datos incompletos',
        description: 'Necesitas una imagen y una descripción de lo que quieres hacer',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('edit-image', {
        body: {
          image: originalImage,
          prompt: prompt.trim(),
        },
      });

      if (error) throw error;

      if (data?.editedImage) {
        setEditedImage(data.editedImage);
        toast({
          title: '¡Listo!',
          description: 'Tu imagen ha sido editada con éxito',
        });
      } else {
        throw new Error('No se recibió imagen editada');
      }
    } catch (error) {
      console.error('Error editando imagen:', error);
      toast({
        title: 'Error',
        description: 'No se pudo editar la imagen. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!editedImage) return;

    const link = document.createElement('a');
    link.href = editedImage;
    link.download = 'nail-art-editado.png';
    link.click();
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            Editor de Imágenes con IA
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sube una foto de tus uñas y describe cómo quieres editarla. Nuestra IA hará la magia.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Controles */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sube tu imagen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Arrastra una imagen aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Formatos: JPG, PNG, WEBP
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {originalImage && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="prompt">¿Qué quieres hacer?</Label>
                      <Input
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ej: Cambia el color del esmalte a rosa, añade brillo, etc."
                        className="mt-2"
                      />
                    </div>

                    <Button
                      onClick={handleApplyMagic}
                      disabled={isLoading || !prompt.trim()}
                      className="w-full gradient-primary text-white"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Aplicando magia...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Aplicar Magia
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {editedImage && (
              <Card>
                <CardContent className="pt-6">
                  <Button onClick={handleDownload} className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Imagen
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Vista previa */}
          <div className="space-y-6">
            {originalImage && (
              <Card>
                <CardHeader>
                  <CardTitle>Imagen Original</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {editedImage && (
              <Card>
                <CardHeader>
                  <CardTitle>Imagen Editada</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={editedImage}
                    alt="Editada"
                    className="w-full rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {!originalImage && !editedImage && (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p>Las imágenes aparecerán aquí</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
