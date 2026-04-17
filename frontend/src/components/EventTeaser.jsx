import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export const EventTeaser = () => {
  const { language } = useLanguage();
  const [event, setEvent] = useState(null);
  const de = language === 'de';

  useEffect(() => {
    axios.get(`${API}/api/events/featured`).then(r => { if (r.data) setEvent(r.data); }).catch(() => {});
  }, []);

  if (!event) return null;

  return (
    <section data-testid="event-teaser" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-obsidian">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/5 to-transparent">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTIsMTc1LDU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
          <div className="relative flex flex-col md:flex-row items-center gap-6 p-8 sm:p-12">
            {event.image_url && (
              <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-xl overflow-hidden shrink-0">
                <img src={event.image_url} alt={de ? event.title_de : event.title_en} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-gold/10 border border-gold/30 rounded-full font-rajdhani text-gold text-xs uppercase tracking-wider mb-4">
                {de ? 'Nächste Veranstaltung' : 'Next Event'}
              </span>
              <h2 className="font-teko text-3xl sm:text-4xl text-white mb-3">
                {de ? event.title_de : (event.title_en || event.title_de)}
              </h2>
              <div className="flex flex-wrap gap-4 mb-4">
                <span className="flex items-center gap-1.5 font-rajdhani text-gray-400 text-sm"><Calendar className="w-4 h-4 text-gold" />{event.date}</span>
                {event.location && <span className="flex items-center gap-1.5 font-rajdhani text-gray-400 text-sm"><MapPin className="w-4 h-4 text-gold" />{event.location}</span>}
              </div>
              <p className="font-rajdhani text-gray-400 line-clamp-2 mb-6">
                {de ? event.description_de : (event.description_en || event.description_de)}
              </p>
              <Link to={`/veranstaltungen/${event.id}`} data-testid="event-teaser-link"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-obsidian font-teko text-lg uppercase tracking-wider rounded-xl hover:bg-gold-glow transition-colors">
                {de ? 'Mehr erfahren' : 'Learn More'} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
