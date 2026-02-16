import React from 'react';
import { Button } from '../ui/button';
import { Users, Clock, Mail, Image } from 'lucide-react';

export function AdminDashboard({ trainers, bookings, contacts, gallery, language, onSeedData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-charcoal border border-white/5 p-6">
          <Users className="w-8 h-8 text-gold mb-4" />
          <p className="font-teko text-3xl text-white">{trainers.length}</p>
          <p className="font-rajdhani text-gray-400 text-sm">Trainer</p>
        </div>
        <div className="bg-charcoal border border-white/5 p-6">
          <Clock className="w-8 h-8 text-gold mb-4" />
          <p className="font-teko text-3xl text-white">{bookings.filter(b => b.status === 'pending').length}</p>
          <p className="font-rajdhani text-gray-400 text-sm">{language === 'de' ? 'Offene Buchungen' : 'Pending Bookings'}</p>
        </div>
        <div className="bg-charcoal border border-white/5 p-6">
          <Mail className="w-8 h-8 text-gold mb-4" />
          <p className="font-teko text-3xl text-white">{contacts.filter(c => !c.is_read).length}</p>
          <p className="font-rajdhani text-gray-400 text-sm">{language === 'de' ? 'Ungelesene Nachrichten' : 'Unread Messages'}</p>
        </div>
        <div className="bg-charcoal border border-white/5 p-6">
          <Image className="w-8 h-8 text-gold mb-4" />
          <p className="font-teko text-3xl text-white">{gallery.length}</p>
          <p className="font-rajdhani text-gray-400 text-sm">{language === 'de' ? 'Galerie Bilder' : 'Gallery Images'}</p>
        </div>
      </div>

      {trainers.length === 0 && (
        <div className="bg-charcoal border border-white/5 p-8 text-center">
          <p className="font-rajdhani text-gray-400 mb-4">
            {language === 'de' ? 'Keine Daten vorhanden. Möchten Sie Beispieldaten laden?' : 'No data available. Would you like to load sample data?'}
          </p>
          <Button
            onClick={onSeedData}
            data-testid="seed-data-btn"
            className="bg-gold hover:bg-gold-glow text-black font-teko uppercase"
          >
            {language === 'de' ? 'Beispieldaten laden' : 'Load Sample Data'}
          </Button>
        </div>
      )}
    </div>
  );
}
