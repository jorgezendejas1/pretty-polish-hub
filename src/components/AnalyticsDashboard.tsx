import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, Calendar, Clock, Sparkles } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [predictions, setPredictions] = useState<string>('');
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Cargar todas las reservas
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .neq('status', 'cancelled');

      if (error) throw error;

      // Calcular estadísticas
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyBookings = bookings?.filter((b) => {
        const bookingDate = new Date(b.booking_date);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      }) || [];

      // Ingresos por mes (últimos 6 meses)
      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - (5 - i));
        const monthBookings = bookings?.filter((b) => {
          const bookingDate = new Date(b.booking_date);
          return bookingDate.getMonth() === month.getMonth() && bookingDate.getFullYear() === month.getFullYear();
        }) || [];
        return {
          name: month.toLocaleDateString('es', { month: 'short' }),
          ingresos: monthBookings.reduce((sum, b) => sum + b.total_price, 0),
          citas: monthBookings.length,
        };
      });

      // Servicios más populares
      const serviceCount: Record<string, number> = {};
      bookings?.forEach((b) => {
        b.service_names.forEach((service: string) => {
          serviceCount[service] = (serviceCount[service] || 0) + 1;
        });
      });

      const topServices = Object.entries(serviceCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

      // Horarios pico (distribución por hora)
      const hourDistribution: Record<number, number> = {};
      bookings?.forEach((b) => {
        const hour = parseInt(b.booking_time.split(':')[0]);
        hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
      });

      const peakHours = Object.entries(hourDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([hour, count]) => ({ hour: `${hour}:00`, count }));

      // Ingresos totales
      const totalRevenue = bookings?.reduce((sum, b) => sum + b.total_price, 0) || 0;
      const monthlyIncome = monthlyBookings.reduce((sum, b) => sum + b.total_price, 0);

      setStats({
        totalRevenue,
        monthlyIncome,
        totalBookings: bookings?.length || 0,
        monthlyBookings: monthlyBookings.length,
        monthlyRevenue,
        topServices,
        peakHours,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las analíticas',
        variant: 'destructive',
      });
    }
  };

  const generatePredictions = async () => {
    if (!stats) return;

    setIsLoadingPredictions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-analytics', {
        body: { 
          analyticsData: {
            totalRevenue: stats.totalRevenue,
            monthlyIncome: stats.monthlyIncome,
            totalBookings: stats.totalBookings,
            monthlyBookings: stats.monthlyBookings,
            monthlyRevenue: stats.monthlyRevenue,
            topServices: stats.topServices,
            peakHours: stats.peakHours,
          }
        },
      });

      if (error) throw error;

      if (data?.analysis) {
        setPredictions(data.analysis);
        toast({
          title: 'Predicciones generadas',
          description: 'Las predicciones con IA están listas',
        });
      } else {
        throw new Error('No se recibió análisis');
      }
    } catch (error: any) {
      console.error('Error generating predictions:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron generar las predicciones',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPredictions(false);
    }
  };

  if (!stats) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando analíticas...</p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3'];

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold">${stats.totalRevenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos del Mes</p>
                <p className="text-2xl font-bold">${stats.monthlyIncome}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Citas</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Citas del Mes</p>
                <p className="text-2xl font-bold">{stats.monthlyBookings}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tendencia de ingresos */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="font-display">Tendencia de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ingresos" stroke="#E91E63" strokeWidth={2} name="Ingresos ($)" />
                <Line type="monotone" dataKey="citas" stroke="#9C27B0" strokeWidth={2} name="Citas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Servicios más populares */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="font-display">Servicios Más Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.topServices}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.topServices.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Horarios pico */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horarios Pico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.peakHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#E91E63" name="Número de Citas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Predicciones con IA */}
      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Predicciones y Recomendaciones con IA
            </CardTitle>
            <Button
              onClick={generatePredictions}
              disabled={isLoadingPredictions}
              className="gradient-primary text-white"
            >
              {isLoadingPredictions ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar Predicciones
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {predictions ? (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm">{predictions}</div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Haz clic en "Generar Predicciones" para obtener insights con IA</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};