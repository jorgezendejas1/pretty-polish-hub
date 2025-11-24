import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Smile, Meh, Frown, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SentimentMetric {
  id: string;
  session_id: string;
  user_email: string | null;
  message_count: number;
  sentiment_scores: any;
  dominant_sentiment: 'frustrated' | 'neutral' | 'happy';
  escalated_to_human: boolean;
  created_at: string;
}

export const SentimentMetrics = () => {
  const [metrics, setMetrics] = useState<SentimentMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sentiment_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Convertir sentiment_scores de Json a objeto y formatear tipos
      const formattedData = (data || []).map(item => ({
        id: item.id,
        session_id: item.session_id,
        user_email: item.user_email,
        message_count: item.message_count,
        sentiment_scores: typeof item.sentiment_scores === 'string' 
          ? JSON.parse(item.sentiment_scores)
          : item.sentiment_scores,
        dominant_sentiment: item.dominant_sentiment as 'frustrated' | 'neutral' | 'happy',
        escalated_to_human: item.escalated_to_human,
        created_at: item.created_at,
      }));
      
      setMetrics(formattedData);
    } catch (error) {
      console.error('Error fetching sentiment metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Satisfacción del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Cargando métricas...</p>
        </CardContent>
      </Card>
    );
  }

  // Calcular estadísticas
  const totalConversations = metrics.length;
  const totalMessages = metrics.reduce((sum, m) => sum + m.message_count, 0);
  const escalatedCount = metrics.filter(m => m.escalated_to_human).length;
  
  const sentimentTotals = metrics.reduce(
    (acc, m) => ({
      happy: acc.happy + m.sentiment_scores.happy,
      neutral: acc.neutral + m.sentiment_scores.neutral,
      frustrated: acc.frustrated + m.sentiment_scores.frustrated,
    }),
    { happy: 0, neutral: 0, frustrated: 0 }
  );

  const totalSentiments = sentimentTotals.happy + sentimentTotals.neutral + sentimentTotals.frustrated;
  const happyPercent = totalSentiments > 0 ? (sentimentTotals.happy / totalSentiments) * 100 : 0;
  const neutralPercent = totalSentiments > 0 ? (sentimentTotals.neutral / totalSentiments) * 100 : 0;
  const frustratedPercent = totalSentiments > 0 ? (sentimentTotals.frustrated / totalSentiments) * 100 : 0;

  const satisfactionScore = happyPercent + (neutralPercent * 0.5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Conversaciones
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              {totalMessages} mensajes totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Satisfacción General
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{satisfactionScore.toFixed(1)}%</div>
            <Progress value={satisfactionScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Felices
            </CardTitle>
            <Smile className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{happyPercent.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {sentimentTotals.happy} mensajes positivos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Escalados a Humano
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{escalatedCount}</div>
            <p className="text-xs text-muted-foreground">
              {((escalatedCount / totalConversations) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribución de Sentimientos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smile className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Felices</span>
              </div>
              <span className="text-sm text-muted-foreground">{happyPercent.toFixed(1)}%</span>
            </div>
            <Progress value={happyPercent} className="h-2 bg-green-100" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Meh className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Neutrales</span>
              </div>
              <span className="text-sm text-muted-foreground">{neutralPercent.toFixed(1)}%</span>
            </div>
            <Progress value={neutralPercent} className="h-2 bg-blue-100" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Frown className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Frustrados</span>
              </div>
              <span className="text-sm text-muted-foreground">{frustratedPercent.toFixed(1)}%</span>
            </div>
            <Progress value={frustratedPercent} className="h-2 bg-red-100" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversaciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.slice(0, 10).map((metric) => (
              <div key={metric.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {metric.dominant_sentiment === 'happy' && <Smile className="h-4 w-4 text-green-500" />}
                    {metric.dominant_sentiment === 'neutral' && <Meh className="h-4 w-4 text-blue-500" />}
                    {metric.dominant_sentiment === 'frustrated' && <Frown className="h-4 w-4 text-red-500" />}
                    <span className="text-sm font-medium">
                      {metric.user_email || 'Usuario anónimo'}
                    </span>
                    {metric.escalated_to_human && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                        Escalado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(metric.created_at).toLocaleString('es-MX')} • {metric.message_count} mensajes
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>😊 {metric.sentiment_scores.happy}</div>
                  <div>😐 {metric.sentiment_scores.neutral}</div>
                  <div>😔 {metric.sentiment_scores.frustrated}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
