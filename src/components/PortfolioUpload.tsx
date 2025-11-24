import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const PortfolioUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Archivo muy grande',
        description: 'La imagen debe ser menor a 5MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: 'Selecciona una imagen',
        description: 'Debes elegir una imagen para subir',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Debes iniciar sesión',
          description: 'Inicia sesión para subir fotos',
          variant: 'destructive',
        });
        return;
      }

      // Subir imagen a storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `portfolio-submissions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('design-inspirations')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Generate signed URL (valid for 1 year for portfolio submissions)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('design-inspirations')
        .createSignedUrl(filePath, 31536000); // 1 year validity

      if (urlError || !signedUrlData) {
        throw new Error('Error al generar URL segura de imagen');
      }

      const publicUrl = signedUrlData.signedUrl;

      // Crear registro en la tabla
      const { error: insertError } = await supabase
        .from('portfolio_submissions')
        .insert({
          user_id: session.user.id,
          client_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Cliente',
          client_email: session.user.email || '',
          image_url: publicUrl,
          description: description.trim() || null,
        });

      if (insertError) throw insertError;

      toast({
        title: '¡Foto enviada!',
        description: 'Tu foto está en revisión. Será visible en el portafolio una vez aprobada.',
      });

      // Limpiar formulario
      setSelectedFile(null);
      setPreviewUrl(null);
      setDescription('');
    } catch (error: any) {
      console.error('Error uploading:', error);
      toast({
        title: 'Error al subir',
        description: error.message || 'No se pudo subir la imagen',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="font-display text-xl">Comparte tu Trabajo</CardTitle>
        <p className="text-sm text-muted-foreground">
          ¿Te encantó tu servicio? Comparte una foto y aparecerá en nuestro portafolio después de aprobación.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Imagen del Trabajo</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-smooth">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="portfolio-upload"
            />
            <label htmlFor="portfolio-upload" className="cursor-pointer">
              {previewUrl ? (
                <div className="space-y-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg object-cover"
                  />
                  <Button type="button" variant="outline" size="sm">
                    Cambiar imagen
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto mb-3 text-primary" />
                  <p className="text-sm font-medium mb-1">
                    Haz clic para seleccionar una imagen
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Máximo 5MB - JPG, PNG o WEBP
                  </p>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción (Opcional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Cuéntanos sobre este diseño..."
            className="min-h-[80px]"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selectedFile || isUploading}
          className="w-full gradient-primary text-white"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Subiendo...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Enviar para Aprobación
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};