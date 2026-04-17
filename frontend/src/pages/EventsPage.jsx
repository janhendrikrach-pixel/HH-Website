import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { useLanguage } from '../lib/LanguageContext';
import { Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export default function EventsPage() {
  const { language } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const de = language === 'de';

  useEffect(() => {
    axios.get(`${API}/api/events`).then(r => setEvents(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-obsidian">
      <SEOHead page="events" customTitle={de ? "Veranstaltungen - Headlock Headquarter" : "Events - Headlock Headquarter"} />
      <Navbar />
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h1 data-testid="events-page-title" className="font-teko text-4xl sm:text-5xl text-gold uppercase mb-3">
          {de ? 'Veranstaltungen' : 'Events'}
        </h1>
        <p className="font-rajdhani text-gray-400 mb-12 max-w-2xl">
          {de ? 'Erlebe Wrestling live! Hier findest du alle kommenden Veranstaltungen und kannst deine Tickets sichern.' : 'Experience wrestling live! Find all upcoming events and secure your tickets here.'}
        </p>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-charcoal border border-white/5 rounded-2xl">
            <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="font-teko text-2xl text-gray-500">{de ? 'Keine Veranstaltungen geplant' : 'No events scheduled'}</p>
            <p className="font-rajdhani text-gray-600 mt-2">{de ? 'Schau bald wieder vorbei!' : 'Check back soon!'}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {events.map(event => (
              <Link key={event.id} to={`/veranstaltungen/${event.id}`} data-testid={`event-card-${event.id}`}
                className="group bg-charcoal border border-white/5 rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-300">
                {event.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img src={event.image_url} alt={de ? event.title_de : (event.title_en || event.title_de)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="font-teko text-2xl text-white group-hover:text-gold transition-colors">
                    {de ? event.title_de : (event.title_en || event.title_de)}
                  </h2>
                  <div className="flex flex-wrap gap-4 mt-3">
                    <span className="flex items-center gap-1.5 font-rajdhani text-sm text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-gold" />{event.date}
                    </span>
                    {event.time && (
                      <span className="flex items-center gap-1.5 font-rajdhani text-sm text-gray-400">
                        <Clock className="w-3.5 h-3.5 text-gold" />{event.time}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1.5 font-rajdhani text-sm text-gray-400">
                        <MapPin className="w-3.5 h-3.5 text-gold" />{event.location}
                      </span>
                    )}
                  </div>
                  {event.ticket_price > 0 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                      <span className="font-teko text-xl text-gold">{event.ticket_price.toFixed(2)} EUR</span>
                      <div className="flex items-center gap-2">
                        {event.tickets_remaining !== null && (
                          <span className={`font-rajdhani text-xs px-2 py-1 rounded ${event.tickets_remaining > 10 ? 'bg-green-500/10 text-green-400' : event.tickets_remaining > 0 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                            {event.tickets_remaining > 0 ? `${event.tickets_remaining} ${de ? 'verfügbar' : 'available'}` : (de ? 'Ausverkauft' : 'Sold out')}
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-rajdhani text-gold text-sm">
                          <Ticket className="w-4 h-4" />{de ? 'Tickets' : 'Tickets'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
