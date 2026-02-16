import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';

export const HeroSection = () => {
  const { t, language } = useLanguage();

  const scrollToAbout = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      data-testid="hero-section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1623950851918-116ba38150d2?w=1920&q=80"
          alt={language === 'de' ? 'Wrestling-Training bei Headlock Headquarter in Hannover' : 'Wrestling training at Headlock Headquarter in Hannover'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-obsidian/60 to-obsidian" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-transparent to-obsidian/80" />
      </div>

      {/* Noise Texture */}
      <div className="absolute inset-0 noise-texture z-10 pointer-events-none" />

      {/* Gold Spotlight */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full z-5 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="opacity-0 animate-fade-in">
          <span className="inline-block font-rajdhani text-gold text-sm uppercase tracking-[0.3em] mb-6 border border-gold/30 px-4 py-2">
            Wrestling Schule Hannover
          </span>
        </div>

        <h1
          className="font-teko text-5xl sm:text-6xl lg:text-8xl text-white uppercase tracking-wide leading-none mb-6 opacity-0 animate-fade-in delay-100"
          data-testid="hero-title"
        >
          {t('hero.title')}
        </h1>

        <p className="font-rajdhani text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in delay-200">
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in delay-300">
          <Link to="/booking">
            <Button
              data-testid="hero-cta-btn"
              className="bg-gold hover:bg-gold-glow text-black font-teko text-lg uppercase tracking-wider px-8 py-6 transition-colors duration-300 gold-glow"
            >
              {t('hero.cta')}
            </Button>
          </Link>
          <Button
            data-testid="hero-secondary-btn"
            variant="outline"
            onClick={scrollToAbout}
            className="border-white/30 text-white hover:border-gold hover:text-gold font-teko text-lg uppercase tracking-wider px-8 py-6 transition-colors duration-300"
          >
            {t('hero.secondary')}
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce cursor-pointer"
        data-testid="scroll-indicator"
      >
        <ChevronDown className="w-8 h-8 text-gold" />
      </button>

      {/* Side Decoration */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4 z-20">
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-gold to-transparent" />
        <span className="font-rajdhani text-xs text-gold uppercase tracking-widest rotate-[-90deg] whitespace-nowrap">
          Est. 1994
        </span>
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-gold to-transparent" />
      </div>
    </section>
  );
};
