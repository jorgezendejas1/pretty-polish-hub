import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SecurityEvent {
  timestamp: string;
  ip: string;
  type: 'prompt_injection' | 'rate_limit' | 'special_chars';
  message: string;
  blocked: boolean;
}

export const SecurityMonitor = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState({
    total_attempts: 0,
    blocked_today: 0,
    unique_ips: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSecurityEvents = async () => {
      try {
        // Cargar eventos de seguridad (últimos 100)
        const { data: logs, error } = await supabase
          .from('security_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          console.error('Error loading security logs:', error);
          return;
        }

        const mappedEvents: SecurityEvent[] = logs?.map(log => ({
          timestamp: log.created_at,
          ip: log.ip_address,
          type: log.event_type as any,
          message: log.message,
          blocked: log.blocked
        })) || [];

        setEvents(mappedEvents);

        // Calcular estadísticas
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const blockedToday = logs?.filter(log => 
          log.blocked && new Date(log.created_at) >= today
        ).length || 0;

        const uniqueIps = new Set(logs?.map(log => log.ip_address) || []).size;

        setStats({
          total_attempts: logs?.length || 0,
          blocked_today: blockedToday,
          unique_ips: uniqueIps
        });

      } catch (error) {
        console.error('Error loading security data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSecurityEvents();

    // Suscribirse a actualizaciones en tiempo real
    const channel = supabase
      .channel('security-events-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'security_logs'
        },
        (payload) => {
          console.log('New security event:', payload);
          loadSecurityEvents(); // Recargar cuando hay cambios
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getTypeColor = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'prompt_injection':
        return 'destructive';
      case 'rate_limit':
        return 'secondary';
      case 'special_chars':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'prompt_injection':
        return 'Inyección de Prompt';
      case 'rate_limit':
        return 'Rate Limit';
      case 'special_chars':
        return 'Caracteres Sospechosos';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando datos de seguridad...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Intentos Totales
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_attempts}</div>
            <p className="text-xs text-muted-foreground">
              Desde el último despliegue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bloqueados Hoy
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blocked_today}</div>
            <p className="text-xs text-muted-foreground">
              Ataques prevenidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              IPs Únicas
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unique_ips}</div>
            <p className="text-xs text-muted-foreground">
              Direcciones distintas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos de Seguridad Recientes</CardTitle>
          <CardDescription>
            Monitoreo en tiempo real de intentos de ataque al chatbot
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se han detectado intentos de ataque</p>
              <p className="text-sm mt-2">Los eventos aparecerán aquí cuando se detecten</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between border-b pb-4 last:border-0"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getTypeColor(event.type)}>
                        {getTypeLabel(event.type)}
                      </Badge>
                      {event.blocked && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Bloqueado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">{event.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>IP: {event.ip}</span>
                      <span>
                        {new Date(event.timestamp).toLocaleString('es-MX')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Patrones de Detección Activos</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Inyección de prompts (13 patrones)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Caracteres especiales excesivos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Rate limiting (10 msg/5min)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Longitud máxima (1000 chars)</span>
            </div>
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
};
