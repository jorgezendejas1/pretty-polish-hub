import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { WhatsAppButton } from './WhatsAppButton';
import { StickyCTA } from './StickyCTA';
import { MobileStickyCTA } from './MobileStickyCTA';
import { PWAUpdatePrompt } from './PWAUpdatePrompt';

export const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <StickyCTA />
      <MobileStickyCTA />
      <PWAUpdatePrompt />
    </div>
  );
};
