import React from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Award, Users, Calendar, Target } from 'lucide-react';

export const AboutSection = () => {
  const { t } = useLanguage();

  const stats = [
    { icon: Calendar, value: '30+', label: 'Jahre Erfahrung', labelEn: 'Years Experience' },
    { icon: Users, value: '500+', label: 'Trainierte Wrestler', labelEn: 'Trained Wrestlers' },
    { icon: Award, value: '50+', label: 'Gewonnene Titel', labelEn: 'Titles Won' },
    { icon: Target, value: '100%', label: 'Leidenschaft', labelEn: 'Passion' },
  ];

  const { language } = useLanguage();

  return (
    <section
      id="about"
      data-testid="about-section"
      className="relative py-24 lg:py-32 bg-charcoal overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(212, 175, 55, 0.1) 10px,
            rgba(212, 175, 55, 0.1) 20px
          )`
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1611338631743-b0362363f417?w=800&q=80"
                alt="Wrestling Training"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-8 -right-8 lg:right-8 bg-obsidian border border-gold/30 p-6 max-w-xs gold-glow">
              <span className="font-teko text-5xl text-gold">30+</span>
              <p className="font-rajdhani text-gray-400 mt-2">
                {language === 'de' ? 'Jahre Wrestling-Tradition in Hannover' : 'Years of wrestling tradition in Hannover'}
              </p>
            </div>

            {/* Corner Decoration */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-gold/50" />
          </div>

          {/* Content Side */}
          <div>
            <span className="inline-block font-rajdhani text-gold text-sm uppercase tracking-[0.2em] mb-4">
              {t('about.subtitle')}
            </span>
            
            <h2 className="font-teko text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-tight mb-6">
              {t('about.title')}
            </h2>

            <div className="w-20 h-1 bg-gold mb-8" />

            <p className="font-rajdhani text-gray-300 text-lg leading-relaxed mb-6">
              {t('about.description')}
            </p>

            <p className="font-rajdhani text-gray-400 leading-relaxed mb-10">
              {t('about.experience')}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="card-shine bg-obsidian border border-white/5 p-6 hover:border-gold/30 transition-colors duration-300"
                >
                  <stat.icon className="w-6 h-6 text-gold mb-3" />
                  <span className="font-teko text-3xl text-white">{stat.value}</span>
                  <p className="font-rajdhani text-gray-500 text-sm mt-1">
                    {language === 'de' ? stat.label : stat.labelEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
