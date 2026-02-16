import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Award, Clock, Globe } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const TrainersSection = () => {
  const { t, language } = useLanguage();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await axios.get(`${API}/trainers`);
        setTrainers(res.data);
      } catch (error) {
        console.error('Error fetching trainers:', error);
        // Fallback data
        setTrainers([
          {
            id: '1',
            name: 'Leon van Gasteren',
            title: 'Head Coach',
            bio_de: 'Er wurde 1994 beim legendären CWA World Cup in Hannover trainiert und ist nach über 25 Jahren immer noch aktiv - national und international.',
            bio_en: 'He was trained in 1994 at the legendary CWA World Cup in Hannover and is still active after over 25 years - nationally and internationally.',
            image_url: 'https://images.unsplash.com/photo-1634042341465-f08e0d10a670?w=600',
            years_experience: 30,
            achievements: ['CWA World Cup 1994', 'International Wrestler', 'Japan Tours']
          },
          {
            id: '2',
            name: 'Martin Nolte',
            title: 'Senior Coach',
            bio_de: 'Martin Nolte hat 1997 mit professionellem Training unter Tony St. Clair angefangen. 1999 errung er den Titel "Newcomer des Jahres".',
            bio_en: 'Martin Nolte started professional training under Tony St. Clair in 1997. In 1999 he won the title "Newcomer of the Year".',
            image_url: 'https://images.unsplash.com/photo-1730732862473-dba100ea08b2?w=600',
            years_experience: 26,
            achievements: ['Newcomer of the Year 1999', 'Multiple Title Holder']
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-obsidian">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-charcoal rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-charcoal rounded w-64 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="trainers"
      data-testid="trainers-section"
      className="relative py-24 lg:py-32 bg-obsidian overflow-hidden"
    >
      {/* Gold Line Decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block font-rajdhani text-gold text-sm uppercase tracking-[0.2em] mb-4">
            {t('trainers.subtitle')}
          </span>
          <h2 className="font-teko text-4xl sm:text-5xl lg:text-6xl text-white uppercase">
            {t('trainers.title')}
          </h2>
          <div className="w-20 h-1 bg-gold mx-auto mt-6" />
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {trainers.map((trainer, index) => (
            <div
              key={trainer.id}
              data-testid={`trainer-card-${index}`}
              className="group relative card-shine bg-charcoal border border-white/5 overflow-hidden hover:border-gold/30 transition-colors duration-500"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Image */}
                <div className="relative aspect-square md:aspect-auto overflow-hidden">
                  <img
                    src={trainer.image_url}
                    alt={trainer.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-charcoal/80 md:block hidden" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal to-transparent md:hidden" />
                </div>

                {/* Content */}
                <div className="p-6 lg:p-8 flex flex-col justify-center">
                  <span className="font-rajdhani text-gold text-sm uppercase tracking-wider mb-2">
                    {trainer.title}
                  </span>
                  <h3 className="font-teko text-3xl lg:text-4xl text-white uppercase mb-4">
                    {trainer.name}
                  </h3>
                  <p className="font-rajdhani text-gray-400 text-sm leading-relaxed mb-6">
                    {language === 'de' ? trainer.bio_de : trainer.bio_en}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold" />
                      <span className="font-rajdhani text-sm text-gray-300">
                        {trainer.years_experience}+ {language === 'de' ? 'Jahre' : 'Years'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gold" />
                      <span className="font-rajdhani text-sm text-gray-300">
                        International
                      </span>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="flex flex-wrap gap-2">
                    {trainer.achievements?.slice(0, 3).map((achievement, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-obsidian border border-gold/20 text-xs font-rajdhani text-gray-400"
                      >
                        <Award className="w-3 h-3 text-gold" />
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gold Corner Accent */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-gold transform rotate-45" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
