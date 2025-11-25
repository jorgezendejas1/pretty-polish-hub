import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import Lottie from 'lottie-react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface AnimatedHeroProps {
  title: string;
  subtitle?: string;
  mediaType?: 'video' | 'lottie' | 'image';
  mediaSrc?: string;
  lottieData?: any;
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: () => void;
}

export const AnimatedHero = ({
  title,
  subtitle,
  mediaType = 'image',
  mediaSrc,
  lottieData,
  ctaText = 'Comenzar',
  ctaLink,
  onCtaClick,
}: AnimatedHeroProps) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) return;

    const tl = gsap.timeline();

    tl.from(titleRef.current, {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    })
      .from(
        subtitleRef.current,
        {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.5'
      )
      .from(
        ctaRef.current,
        {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
        },
        '-=0.4'
      )
      .from(
        mediaRef.current,
        {
          scale: 0.8,
          opacity: 0,
          duration: 1,
          ease: 'power2.out',
        },
        '-=0.8'
      );

    // Floating animation for media
    if (mediaRef.current) {
      gsap.to(mediaRef.current, {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }

    return () => {
      tl.kill();
    };
  }, [prefersReducedMotion]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Animated background elements */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <h1
              ref={titleRef}
              className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight"
            >
              {title}
            </h1>

            {subtitle && (
              <p
                ref={subtitleRef}
                className="text-xl sm:text-2xl text-muted-foreground max-w-2xl"
              >
                {subtitle}
              </p>
            )}

            <div ref={ctaRef}>
              <Button
                size="lg"
                className="gradient-primary text-white group"
                onClick={onCtaClick}
                asChild={!!ctaLink}
              >
                {ctaLink ? (
                  <a href={ctaLink}>
                    {ctaText}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                ) : (
                  <>
                    {ctaText}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Media */}
          <div ref={mediaRef} className="relative">
            {mediaType === 'video' && mediaSrc && (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-2xl shadow-elegant"
              >
                <source src={mediaSrc} type="video/mp4" />
              </video>
            )}

            {mediaType === 'lottie' && lottieData && (
              <Lottie animationData={lottieData} loop className="w-full" />
            )}

            {mediaType === 'image' && mediaSrc && (
              <img
                src={mediaSrc}
                alt={title}
                className="w-full rounded-2xl shadow-elegant"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};