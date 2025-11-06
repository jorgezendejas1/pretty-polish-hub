import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Chrome, ArrowLeft, Mail } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get the return path from state, default to home
  const returnPath = (location.state as any)?.from || '/';

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(returnPath);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate(returnPath);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, returnPath]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: '¡Bienvenido de vuelta!',
          description: 'Has iniciado sesión correctamente',
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              phone: phone,
            },
          },
        });

        if (error) throw error;

        toast({
          title: '¡Registro exitoso!',
          description: 'Hemos enviado un correo de confirmación',
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error durante la autenticación',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo iniciar sesión con Google',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async () => {
    if (!phone) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa tu número de teléfono',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: {
          channel: 'sms',
        },
      });

      if (error) throw error;

      toast({
        title: 'Código enviado',
        description: 'Revisa tu teléfono para obtener el código de verificación',
      });
    } catch (error: any) {
      console.error('Phone auth error:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar el código',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa tu correo electrónico',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      toast({
        title: 'Correo enviado',
        description: 'Revisa tu correo para restablecer tu contraseña',
      });
      setIsForgotPassword(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar el correo',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate(returnPath)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Regresar
        </Button>
        
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-3xl">💅</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isForgotPassword ? 'Recuperar Contraseña' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </CardTitle>
          <CardDescription>
            {isForgotPassword
              ? 'Te enviaremos un enlace para restablecer tu contraseña'
              : isLogin
              ? 'Ingresa a tu cuenta de Pitaya Nails'
              : 'Crea una cuenta gratis'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isForgotPassword ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full gradient-primary text-white"
              >
                {loading ? 'Enviando...' : 'Enviar Correo de Recuperación'}
              </Button>

              <Button
                onClick={() => setIsForgotPassword(false)}
                variant="ghost"
                className="w-full"
              >
                Volver al inicio de sesión
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleAuth}
                type="button"
                disabled={loading}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Continuar con Google
              </Button>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="phone-auth">O con Teléfono (SMS)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone-auth"
                      type="tel"
                      placeholder="+52 999 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Button
                      onClick={handlePhoneAuth}
                      disabled={loading}
                      variant="outline"
                      type="button"
                    >
                      Enviar Código
                    </Button>
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">O</span>
                </div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    placeholder="Tu nombre"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+52 998 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary text-white"
                  disabled={loading}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {loading
                    ? 'Procesando...'
                    : isLogin
                    ? 'Iniciar Sesión'
                    : 'Crear Cuenta'}
                </Button>

              </form>

              <div className="text-center text-sm space-y-2">
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-primary hover:underline block w-full"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
                <div>
                  <span className="text-muted-foreground">
                    {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary font-semibold hover:underline"
                  >
                    {isLogin ? 'Regístrate' : 'Inicia sesión'}
                  </button>
                </div>
              </div>
            </>
          )}

          <p className="text-xs text-center text-muted-foreground px-4">
            Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
