import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Mail, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface PortfolioSubmission {
  id: string;
  client_name: string;
  client_email: string;
  image_url: string;
  description: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

export const PortfolioApproval = () => {
  const [submissions, setSubmissions] = useState<PortfolioSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<PortfolioSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los envíos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('portfolio_submissions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: session.user.id,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Foto aprobada',
        description: 'La foto ahora es visible en el portafolio público',
      });

      loadSubmissions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo aprobar la foto',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('portfolio_submissions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: session.user.id,
          rejection_reason: rejectionReason.trim() || 'No cumple con los estándares de calidad',
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      toast({
        title: 'Foto rechazada',
        description: 'El cliente será notificado del rechazo',
      });

      setSelectedSubmission(null);
      setRejectionReason('');
      loadSubmissions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo rechazar la foto',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'default',
      approved: 'default',
      rejected: 'destructive',
    };

    const labels: Record<string, string> = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  if (isLoading) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando envíos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display text-xl">
              Aprobación de Portafolio
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Revisa y aprueba las fotos enviadas por clientes
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge className="gradient-primary text-white">
              <Clock className="h-3 w-3 mr-1" />
              {pendingCount} Pendientes
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No hay envíos de portafolio</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-secondary/50 transition-smooth"
              >
                <div className="flex gap-4">
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={submission.image_url}
                      alt="Submission"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{submission.client_name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {submission.client_email}
                        </div>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                    {submission.description && (
                      <p className="text-sm text-muted-foreground">
                        {submission.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Enviado el {format(new Date(submission.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                    </div>
                    {submission.rejection_reason && (
                      <p className="text-sm text-destructive">
                        Motivo de rechazo: {submission.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
                {submission.status === 'pending' && (
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(submission.id)}
                      className="gradient-primary text-white"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                    <Dialog
                      open={selectedSubmission?.id === submission.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setSelectedSubmission(null);
                          setRejectionReason('');
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Rechazar Foto</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <p className="text-sm text-muted-foreground">
                            Proporciona un motivo para el rechazo (opcional)
                          </p>
                          <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Ej: La calidad de la imagen no es óptima..."
                            className="min-h-[100px]"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedSubmission(null);
                                setRejectionReason('');
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleReject}>
                              Confirmar Rechazo
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};