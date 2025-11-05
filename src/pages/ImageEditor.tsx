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
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Editor Mágico con IA
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ¿Tienes una idea para tus uñas? Sube tu foto de tus manos y dile a nuestra IA qué diseño quieres ver. ¡Pura inspiración!
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[400px_1fr] gap-6">
            {/* Controles - Panel izquierdo */}
            <div className="space-y-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Controles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Subir imagen */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">1. Sube tu imagen</Label>
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-smooth hover:bg-secondary/50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-10 w-10 mx-auto mb-3 text-primary" />
                      <p className="text-sm font-medium mb-1">
                        Arrastra y suelta o haz clic para subir
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Describe la magia */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">2. Describe la magia</Label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder='Ej: "píntala de rojo cereza con un diseño de flores blancas"'
                      className="w-full min-h-[120px] p-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-smooth resize-none"
                      disabled={!originalImage}
                    />
                  </div>

                  {/* Botón Aplicar Magia */}
                  <Button
                    onClick={handleApplyMagic}
                    disabled={isLoading || !prompt.trim() || !originalImage}
                    className="w-full h-12 gradient-primary text-white font-semibold text-base shadow-glow hover:shadow-elegant transition-smooth"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Aplicando magia...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-5 w-5 mr-2" />
                        Aplicar Magia
                      </>
                    )}
                  </Button>

                  {editedImage && (
                    <Button 
                      onClick={handleDownload} 
                      className="w-full" 
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Imagen
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Vista previa - Panel derecho */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original */}
              <Card className="shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="text-center font-display">Original</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[3/4] bg-secondary/30 rounded-lg flex items-center justify-center overflow-hidden">
                    {originalImage ? (
                      <img
                        src={originalImage}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">Sube una imagen</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Editada */}
              <Card className="shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="text-center font-display">Editada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[3/4] bg-secondary/30 rounded-lg flex items-center justify-center overflow-hidden">
                    {editedImage ? (
                      <img
                        src={editedImage}
                        alt="Editada"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">La magia aparecerá aquí</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
