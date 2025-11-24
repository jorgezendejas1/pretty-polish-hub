import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_REPLIES = [
  '¿Qué servicios ofrecen?',
  'Quiero agendar una cita',
  '¿Cuál es su ubicación?',
  'Ver precios',
];

const CONTEXTUAL_REPLIES = {
  greeting: ['¿Qué servicios ofrecen?', 'Quiero agendar una cita', 'Ver portafolio'],
  services: ['Agendar una cita', 'Ver precios', '¿Cuál es su ubicación?'],
  booking: ['Ver disponibilidad', 'Cambiar fecha', 'Contactar por teléfono'],
  info: ['Ver más servicios', 'Conocer al equipo', 'Ver trabajos realizados'],
};

const CHAT_STORAGE_KEY = 'pitaya_chat_history';

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Cargar historial desde localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading chat history:', e);
    }
    
    return [{
      role: 'assistant',
      content: '¡Hola! 👋 Soy Pita, tu asistente virtual de Pitaya Nails. ¿En qué puedo ayudarte hoy?',
    }];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuickReplies, setCurrentQuickReplies] = useState<string[]>(QUICK_REPLIES);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoOpenTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Guardar mensajes en localStorage cuando cambien
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Error saving chat history:', e);
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-open chatbot after 15 seconds if no interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasInteracted(true);
      if (autoOpenTimerRef.current) {
        clearTimeout(autoOpenTimerRef.current);
      }
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('scroll', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    if (!hasInteracted && !isOpen) {
      autoOpenTimerRef.current = setTimeout(() => {
        setIsOpen(true);
        setMessages([
          {
            role: 'assistant',
            content: '¡Hola! 👋 Soy Pita de Pitaya Nails. Veo que estás explorando nuestros servicios. ¿Te gustaría conocer nuestros servicios más populares o agendar una cita?',
          },
        ]);
      }, 15000);
    }

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      if (autoOpenTimerRef.current) {
        clearTimeout(autoOpenTimerRef.current);
      }
    };
  }, [hasInteracted, isOpen]);

  const handleSend = async (messageToSend?: string) => {
    const userMessage = messageToSend || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      
      // Preparar mensajes para la API (excluyendo el mensaje de bienvenida)
      const apiMessages = newMessages.slice(1).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (response.status === 429) {
        toast({
          title: 'Límite excedido',
          description: 'Por favor intenta más tarde',
          variant: 'destructive',
        });
        return;
      }

      if (response.status === 402) {
        toast({
          title: 'Servicio no disponible',
          description: 'Por favor intenta más tarde',
          variant: 'destructive',
        });
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error('Error al conectar con el chat');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let textBuffer = '';

      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              assistantMessage += content;
              setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
            }
            
            // Detectar contexto y actualizar sugerencias
            if (content && assistantMessage.length > 20) {
              const lowerContent = assistantMessage.toLowerCase();
              if (lowerContent.includes('servicio') || lowerContent.includes('precio')) {
                setCurrentQuickReplies(CONTEXTUAL_REPLIES.services);
              } else if (lowerContent.includes('cita') || lowerContent.includes('reserva') || lowerContent.includes('agendar')) {
                setCurrentQuickReplies(CONTEXTUAL_REPLIES.booking);
              } else if (lowerContent.includes('equipo') || lowerContent.includes('portafolio') || lowerContent.includes('certificacion')) {
                setCurrentQuickReplies(CONTEXTUAL_REPLIES.info);
              }
            }
          } catch {
            // Ignorar JSON incompleto
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje. Intenta de nuevo.',
        variant: 'destructive',
      });
      // Remover el último mensaje del asistente si hubo error
      setMessages(newMessages);
    } finally {
      setIsLoading(false);
      // Devolver foco al input después de enviar
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  return (
    <>
      {/* FAB Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elegant gradient-primary text-white z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-elegant z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <CardTitle className="text-lg font-semibold">Chat con Pita</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div 
                    className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: message.content
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80 font-medium" target="_self">$1</a>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/\n/g, '<br/>')
                    }}
                  />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            {!isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && (
              <div className="flex flex-col gap-2 mt-4">
                <p className="text-xs text-muted-foreground mb-1">Sugerencias:</p>
                {currentQuickReplies.map((reply, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickReply(reply)}
                    className="text-left justify-start h-auto py-2 px-3 text-sm hover:bg-primary/10 transition-colors"
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSend();
                  }
                }}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="gradient-primary text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
