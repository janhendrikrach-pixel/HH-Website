import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Clock, MapPin, Calendar, Users } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ScheduleSection = () => {
  const { t, language } = useLanguage();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await axios.get(`${API}/schedule`);
        setSchedule(res.data);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        // Fallback data
        setSchedule([
          {
            id: '1',
            day_de: 'Samstag',
            day_en: 'Saturday',
            time_start: '12:00',
            time_end: '16:00',
            title_de: 'Wöchentliches Training',
            title_en: 'Weekly Training',
            description_de: 'Traditionelles Catch- und Wrestlingtraining für alle Levels',
            description_en: 'Traditional catch and wrestling training for all levels'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  return (
    <section
      id="schedule"
      data-testid="schedule-section"
      className="relative py-24 lg:py-32 bg-charcoal overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.3) 0%, transparent 50%),
                              radial-gradient(circle at 80% 50%, rgba(212, 175, 55, 0.2) 0%, transparent 50%)`
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block font-rajdhani text-gold text-sm uppercase tracking-[0.2em] mb-4">
            {t('schedule.subtitle')}
          </span>
          <h2 className="font-teko text-4xl sm:text-5xl lg:text-6xl text-white uppercase">
            {t('schedule.title')}
          </h2>
          <div className="w-20 h-1 bg-gold mx-auto mt-6" />
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Main Training Card */}
          <div
            data-testid="schedule-main-card"
            className="md:col-span-2 md:row-span-2 card-shine bg-obsidian border border-white/5 p-8 hover:border-gold/30 transition-colors duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <Calendar className="w-10 h-10 text-gold mb-6" />
              <h3 className="font-teko text-3xl text-white uppercase mb-2">
                {t('schedule.weekly')}
              </h3>
              <p className="font-rajdhani text-gray-400 mb-6">
                {t('schedule.duration')}
              </p>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-20 bg-charcoal rounded" />
                </div>
              ) : (
                <div className="space-y-4">
                  {schedule.map((item) => (
                    <div
                      key={item.id}
                      className="bg-charcoal border border-white/5 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-teko text-xl text-gold">
                          {language === 'de' ? item.day_de : item.day_en}
                        </span>
                        <span className="font-rajdhani text-white">
                          {item.time_start} - {item.time_end}
                        </span>
                      </div>
                      <p className="font-rajdhani text-sm text-gray-400">
                        {language === 'de' ? item.description_de : item.description_en}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location Card */}
          <div className="card-shine bg-obsidian border border-white/5 p-6 hover:border-gold/30 transition-colors duration-300">
            <MapPin className="w-8 h-8 text-gold mb-4" />
            <h4 className="font-teko text-xl text-white uppercase mb-2">
              {language === 'de' ? 'Standort' : 'Location'}
            </h4>
            <p className="font-rajdhani text-sm text-gray-400">
              Max-Müller-Straße 1<br />
              30179 Hannover
            </p>
          </div>

          {/* Time Card */}
          <div className="card-shine bg-obsidian border border-white/5 p-6 hover:border-gold/30 transition-colors duration-300">
            <Clock className="w-8 h-8 text-gold mb-4" />
            <h4 className="font-teko text-xl text-white uppercase mb-2">
              {language === 'de' ? 'Dauer' : 'Duration'}
            </h4>
            <p className="font-rajdhani text-sm text-gray-400">
              ~4 {language === 'de' ? 'Stunden' : 'Hours'}
            </p>
          </div>

          {/* Seminars Card */}
          <div className="md:col-span-2 card-shine bg-obsidian border border-white/5 p-6 hover:border-gold/30 transition-colors duration-300">
            <Users className="w-8 h-8 text-gold mb-4" />
            <h4 className="font-teko text-xl text-white uppercase mb-2">
              {t('schedule.seminars')}
            </h4>
            <p className="font-rajdhani text-sm text-gray-400">
              {t('schedule.contact')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
