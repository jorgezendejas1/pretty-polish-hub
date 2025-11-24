import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, Award, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LoyaltyData {
  visits_count: number;
  total_rewards_claimed: number;
  next_reward_at: number;
  last_visit_date: string | null;
}

export const LoyaltyCard = () => {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLoyaltyData();
  }, []);

  const loadLoyaltyData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setLoyaltyData(data);
      } else {
        // Crear registro inicial
        const { data: newData, error: insertError } = await supabase
          .from('loyalty_rewards')
          .insert({
            user_id: session.user.id,
            visits_count: 0,
            total_rewards_claimed: 0,
            next_reward_at: 8,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setLoyaltyData(newData);
      }
    } catch (error) {
      console.error('Error loading loyalty data:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar tu programa de lealtad',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!loyaltyData) return null;

  const progress = (loyaltyData.visits_count / 8) * 100;
  const visitsRemaining = 8 - loyaltyData.visits_count;
  const isEligibleForReward = loyaltyData.visits_count >= 7;

  return (
    <Card className="shadow-elegant relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-glow/5"></div>
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Programa de Lealtad
          </CardTitle>
          {loyaltyData.total_rewards_claimed > 0 && (
            <Badge className="gradient-primary text-white">
              <Award className="h-3 w-3 mr-1" />
              {loyaltyData.total_rewards_claimed} Recompensas
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          ¡Visítanos 8 veces y la última es completamente gratis!
        </p>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progreso Actual</span>
            <span className="text-muted-foreground">
              {loyaltyData.visits_count} / 8 visitas
            </span>
          </div>
          
          <div className="relative h-4 bg-secondary/50 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 gradient-primary transition-all duration-500 ease-out flex items-center justify-end pr-2"
              style={{ width: `${Math.max(progress, 8)}%` }}
            >
              {progress > 20 && (
                <span className="text-[10px] text-white font-bold">
                  {Math.round(progress)}%
                </span>
              )}
            </div>
          </div>
          
          {/* Visual Stars */}
          <div className="flex justify-between gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  i < loyaltyData.visits_count
                    ? 'bg-primary shadow-glow'
                    : 'bg-secondary/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Status Message */}
        <div className="space-y-2">
          {isEligibleForReward ? (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span>¡Tu próxima visita es GRATIS!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Reserva tu siguiente cita y el total será $0. ¡Disfruta tu recompensa!
              </p>
            </div>
          ) : (
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Star className="h-4 w-4 text-primary" />
                <span>
                  {visitsRemaining === 1
                    ? '¡Solo 1 visita más para tu recompensa!'
                    : `${visitsRemaining} visitas más para tu recompensa`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Cada visita completada cuenta para tu siguiente servicio gratis.
              </p>
            </div>
          )}
        </div>

        {/* Last Visit */}
        {loyaltyData.last_visit_date && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Última visita: {new Date(loyaltyData.last_visit_date).toLocaleDateString('es', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};