-- Crear tabla para métricas de satisfacción del cliente
CREATE TABLE public.chat_sentiment_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_email TEXT,
  message_count INTEGER NOT NULL DEFAULT 1,
  sentiment_scores JSONB NOT NULL DEFAULT '{"frustrated": 0, "neutral": 0, "happy": 0}'::jsonb,
  dominant_sentiment TEXT NOT NULL CHECK (dominant_sentiment IN ('frustrated', 'neutral', 'happy')),
  escalated_to_human BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para búsquedas eficientes
CREATE INDEX idx_chat_sentiment_session ON public.chat_sentiment_metrics(session_id);
CREATE INDEX idx_chat_sentiment_created ON public.chat_sentiment_metrics(created_at DESC);
CREATE INDEX idx_chat_sentiment_dominant ON public.chat_sentiment_metrics(dominant_sentiment);
CREATE INDEX idx_chat_sentiment_escalated ON public.chat_sentiment_metrics(escalated_to_human);

-- Habilitar RLS
ALTER TABLE public.chat_sentiment_metrics ENABLE ROW LEVEL SECURITY;

-- Política para que admins puedan ver todas las métricas
CREATE POLICY "Admins can view all sentiment metrics"
ON public.chat_sentiment_metrics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Política para insertar métricas (público para el chatbot)
CREATE POLICY "Anyone can insert sentiment metrics"
ON public.chat_sentiment_metrics
FOR INSERT
WITH CHECK (true);

-- Política para actualizar métricas (público para el chatbot)
CREATE POLICY "Anyone can update sentiment metrics"
ON public.chat_sentiment_metrics
FOR UPDATE
USING (true);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION public.update_chat_sentiment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para actualizar timestamp automáticamente
CREATE TRIGGER update_chat_sentiment_updated_at
BEFORE UPDATE ON public.chat_sentiment_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_sentiment_updated_at();