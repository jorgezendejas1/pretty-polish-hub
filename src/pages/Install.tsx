import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Apple, Chrome, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
              Instala Pitaya Nails
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Accede más rápido a nuestros servicios desde tu pantalla de inicio
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto space-y-8">
          {isInstalled ? (
            <ScrollReveal delay={0.2}>
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-green-900 mb-2">
                      ¡App Instalada!
                    </h2>
                    <p className="text-green-700">
                      Ya puedes acceder a Pitaya Nails desde tu pantalla de inicio
                    </p>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ) : (
            <>
              {!isIOS && deferredPrompt && (
                <ScrollReveal delay={0.2}>
                  <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Download className="h-16 w-16 text-primary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-4">
                          Instalación Rápida
                        </h2>
                        <p className="text-muted-foreground mb-6">
                          Instala nuestra app con un solo clic
                        </p>
                        <Button
                          onClick={handleInstallClick}
                          size="lg"
                          className="gradient-primary text-white"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Instalar Ahora
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              )}

              <ScrollReveal delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Chrome className="h-6 w-6 text-primary" />
                      Android / Chrome
                    </CardTitle>
                    <CardDescription>
                      Instrucciones para instalar en dispositivos Android
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4 list-decimal list-inside">
                      <li>Abre el menú del navegador (⋮ en la esquina superior derecha)</li>
                      <li>Selecciona "Agregar a pantalla de inicio" o "Instalar app"</li>
                      <li>Confirma la instalación</li>
                      <li>¡Listo! La app aparecerá en tu pantalla de inicio</li>
                    </ol>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={0.4}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Apple className="h-6 w-6 text-primary" />
                      iPhone / Safari
                    </CardTitle>
                    <CardDescription>
                      Instrucciones para instalar en dispositivos iOS
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4 list-decimal list-inside">
                      <li>Abre esta página en Safari (no funciona en otros navegadores)</li>
                      <li>Toca el botón de compartir (📤) en la parte inferior</li>
                      <li>Desplázate y selecciona "Agregar a pantalla de inicio"</li>
                      <li>Toca "Agregar" en la esquina superior derecha</li>
                      <li>¡Listo! La app aparecerá en tu pantalla de inicio</li>
                    </ol>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </>
          )}

          <ScrollReveal delay={0.5}>
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-6 w-6 text-purple-600" />
                  Beneficios de la App
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Acceso rápido desde tu pantalla de inicio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Funciona offline - consulta nuestro catálogo sin internet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Carga más rápido que un sitio web normal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Experiencia similar a una app nativa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Reserva tus citas en segundos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default Install;
