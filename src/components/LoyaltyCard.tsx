import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, Award, Sparkles, PartyPopper } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface LoyaltyData {
  visits_count: number;
  total_rewards_claimed: number;
  next_reward_at: number;
  last_visit_date: string | null;
}

export const LoyaltyCard = () => {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const previousVisitsRef = useRef<number>(0);
  const celebrationTriggeredRef = useRef(false);

  useEffect(() => {
    loadLoyaltyData();
  }, []);

  useEffect(() => {
    if (loyaltyData && loyaltyData.visits_count >= 7 && !celebrationTriggeredRef.current) {
      // Solo activar celebración si acabamos de alcanzar 7+ visitas
      if (previousVisitsRef.current < 7) {
        triggerCelebration();
        celebrationTriggeredRef.current = true;
      }
    }
    if (loyaltyData) {
      previousVisitsRef.current = loyaltyData.visits_count;
    }
  }, [loyaltyData]);

  const triggerCelebration = () => {
    setShowCelebration(true);
    
    // Confetti explosion inicial
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Confetti desde ambos lados
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FF69B4', '#FFD700', '#FF1493', '#FF6B9D', '#FFA500']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FF69B4', '#FFD700', '#FF1493', '#FF6B9D', '#FFA500']
      });
    }, 250);

    // Toast especial de celebración
    toast({
      title: '🎉 ¡FELICIDADES! 🎉',
      description: '¡Has alcanzado tu recompensa! Tu próxima visita es TOTALMENTE GRATIS 💅✨',
      duration: 6000,
    });

    // Ocultar animación después de 3 segundos
    setTimeout(() => {
      setShowCelebration(false);
    }, 3000);
  };

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
    <Card className={`shadow-elegant relative overflow-hidden transition-all duration-500 ${
      showCelebration ? 'ring-4 ring-primary ring-offset-4 animate-pulse' : ''
    }`}>
      {/* Background gradient effect */}
      <div className={`absolute inset-0 transition-all duration-500 ${
        showCelebration 
          ? 'bg-gradient-to-br from-primary/20 via-primary-glow/20 to-primary/20 animate-[pulse_1s_ease-in-out_infinite]' 
          : 'bg-gradient-to-br from-primary/5 via-transparent to-primary-glow/5'
      }`}></div>
      
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="animate-[scale-in_0.5s_ease-out]">
            <PartyPopper className="h-24 w-24 text-primary drop-shadow-glow animate-[spin_2s_ease-in-out]" />
          </div>
        </div>
      )}
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className={`font-display text-xl flex items-center gap-2 transition-all duration-300 ${
            showCelebration ? 'scale-110' : ''
          }`}>
            <Gift className={`h-5 w-5 text-primary ${showCelebration ? 'animate-bounce' : ''}`} />
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
            <div className={`bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2 transition-all duration-300 ${
              showCelebration ? 'scale-105 shadow-glow' : ''
            }`}>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Sparkles className={`h-5 w-5 ${showCelebration ? 'animate-spin' : 'animate-pulse'}`} />
                <span className={showCelebration ? 'animate-bounce' : ''}>
                  ¡Tu próxima visita es GRATIS!
                </span>
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