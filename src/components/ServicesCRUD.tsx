import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Wrench } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Service } from '@/types';

// Mock de servicios (en producción esto vendría de Supabase)
const CATEGORIES = {
  manicura: 'Manicura',
  pedicura: 'Pedicura',
  'nail-art': 'Nail Art',
  esculturales: 'Esculturales',
  tratamientos: 'Tratamientos',
  paquetes: 'Paquetes',
};

export function ServicesCRUD() {
  const [services, setServices] = useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    category: 'manicura' as Service['category'],
    imageUrl: '',
  });

  useEffect(() => {
    // Simulación de carga de servicios (en producción: fetch desde Supabase)
    loadServices();
  }, []);

  const loadServices = () => {
    // En producción, esto sería una llamada a Supabase
    const mockServices: Service[] = [
      {
        id: 'mani-classic',
        name: 'Manicura Clásica',
        description: 'Manicura completa con limado, cutícula, masaje y esmaltado tradicional.',
        duration: 45,
        price: 350,
        category: 'manicura',
        imageUrl: '',
      },
      {
        id: 'mani-gel',
        name: 'Manicura en Gel',
        description: 'Manicura con esmaltado semipermanente de larga duración.',
        duration: 60,
        price: 450,
        category: 'manicura',
        imageUrl: '',
      },
    ];
    setServices(mockServices);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: 60,
      price: 0,
      category: 'manicura',
      imageUrl: '',
    });
    setEditingService(null);
  };

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        category: service.category,
        imageUrl: service.imageUrl,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSaveService = () => {
    // Validación
    if (!formData.name || !formData.description || formData.price <= 0 || formData.duration <= 0) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    // En producción: guardar en Supabase
    if (editingService) {
      // Update
      setServices(prev =>
        prev.map(s =>
          s.id === editingService.id ? { ...s, ...formData } : s
        )
      );
      toast({
        title: 'Servicio actualizado',
        description: `${formData.name} ha sido actualizado exitosamente`,
      });
    } else {
      // Create
      const newService: Service = {
        id: `service-${Date.now()}`,
        ...formData,
      };
      setServices(prev => [...prev, newService]);
      toast({
        title: 'Servicio creado',
        description: `${formData.name} ha sido creado exitosamente`,
      });
    }

    handleCloseDialog();
  };

  const handleDeleteService = (service: Service) => {
    if (confirm(`¿Estás seguro de eliminar el servicio "${service.name}"?`)) {
      // En producción: eliminar de Supabase
      setServices(prev => prev.filter(s => s.id !== service.id));
      toast({
        title: 'Servicio eliminado',
        description: `${service.name} ha sido eliminado`,
      });
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Gestión de Servicios
            </CardTitle>
            <CardDescription>Crea, edita o elimina servicios del catálogo</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gradient-primary text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Servicio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Servicio *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Manicura Clásica"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe el servicio..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración (minutos) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      step="15"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Precio (MXN) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="50"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as Service['category'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL de Imagen (opcional)</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveService} className="gradient-primary text-white">
                    {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servicio</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No hay servicios registrados. Crea uno nuevo para comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {service.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {CATEGORIES[service.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>{service.duration} min</TableCell>
                    <TableCell className="font-semibold">${service.price}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteService(service)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
