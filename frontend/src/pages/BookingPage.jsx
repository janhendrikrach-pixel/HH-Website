import React, { useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CalendarIcon, Send, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import axios from 'axios';
import { SEOHead } from '../components/SEOHead';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BookingPage() {
  const { t, language } = useLanguage();
  const [date, setDate] = useState(undefined);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    experience_level: '',
    notes: ''
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      setStatus('error');
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      await axios.post(`${API}/bookings`, {
        ...formData,
        preferred_date: format(date, 'yyyy-MM-dd')
      });
      setStatus('success');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        experience_level: '',
        notes: ''
      });
      setDate(undefined);
    } catch (error) {
      console.error('Error submitting booking:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div data-testid="booking-page" className="min-h-screen bg-obsidian">
      <SEOHead page="booking" />
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            to="/"
            data-testid="back-to-home"
            className="inline-flex items-center gap-2 font-rajdhani text-gray-400 hover:text-gold transition-colors duration-300 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'de' ? 'Zurück zur Startseite' : 'Back to home'}
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block font-rajdhani text-gold text-sm uppercase tracking-[0.2em] mb-4">
              {t('booking.subtitle')}
            </span>
            <h1 className="font-teko text-4xl sm:text-5xl lg:text-6xl text-white uppercase">
              {t('booking.title')}
            </h1>
            <div className="w-20 h-1 bg-gold mx-auto mt-6" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-charcoal border border-white/5 p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="first_name" className="font-rajdhani text-gray-400 mb-2 block">
                  {t('booking.firstName')} *
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  data-testid="booking-firstname-input"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="bg-obsidian border-white/10 focus:border-gold text-white font-rajdhani rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="last_name" className="font-rajdhani text-gray-400 mb-2 block">
                  {t('booking.lastName')} *
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  data-testid="booking-lastname-input"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="bg-obsidian border-white/10 focus:border-gold text-white font-rajdhani rounded-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email" className="font-rajdhani text-gray-400 mb-2 block">
                  {t('booking.email')} *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  data-testid="booking-email-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-obsidian border-white/10 focus:border-gold text-white font-rajdhani rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="font-rajdhani text-gray-400 mb-2 block">
                  {t('booking.phone')} *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  data-testid="booking-phone-input"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="bg-obsidian border-white/10 focus:border-gold text-white font-rajdhani rounded-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Date Picker */}
              <div className="relative z-20">
                <Label className="font-rajdhani text-gray-400 mb-2 block">
                  {t('booking.date')} *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      data-testid="booking-date-picker"
                      className="w-full justify-start text-left font-rajdhani bg-obsidian border-white/10 hover:border-gold hover:bg-obsidian text-white rounded-none h-10"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-gold" />
                      {date ? format(date, 'PPP', { locale: language === 'de' ? de : enUS }) : (
                        <span className="text-gray-500">
                          {language === 'de' ? 'Datum wählen' : 'Pick a date'}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-charcoal border-white/10 z-50" align="start" sideOffset={4}>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      locale={language === 'de' ? de : enUS}
                      disabled={(date) => date < new Date()}
                      className="bg-charcoal text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Experience Level */}
              <div className="relative z-10">
                <Label className="font-rajdhani text-gray-400 mb-2 block">
                  {t('booking.experience')} *
                </Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value }))}
                >
                  <SelectTrigger
                    data-testid="booking-experience-select"
                    className="w-full bg-obsidian border-white/10 focus:border-gold text-white font-rajdhani rounded-none h-10"
                  >
                    <SelectValue placeholder={language === 'de' ? 'Auswählen' : 'Select'} />
                  </SelectTrigger>
                  <SelectContent className="bg-charcoal border-white/10 z-50" position="popper" sideOffset={4}>
                    <SelectItem value="none" className="text-white font-rajdhani hover:bg-obsidian focus:bg-obsidian cursor-pointer">
                      {t('booking.experienceOptions.none')}
                    </SelectItem>
                    <SelectItem value="beginner" className="text-white font-rajdhani hover:bg-obsidian focus:bg-obsidian cursor-pointer">
                      {t('booking.experienceOptions.beginner')}
                    </SelectItem>
                    <SelectItem value="intermediate" className="text-white font-rajdhani hover:bg-obsidian focus:bg-obsidian cursor-pointer">
                      {t('booking.experienceOptions.intermediate')}
                    </SelectItem>
                    <SelectItem value="advanced" className="text-white font-rajdhani hover:bg-obsidian focus:bg-obsidian cursor-pointer">
                      {t('booking.experienceOptions.advanced')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="font-rajdhani text-gray-400 mb-2 block">
                {t('booking.notes')}
              </Label>
              <Textarea
                id="notes"
                name="notes"
                data-testid="booking-notes-input"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="bg-obsidian border-white/10 focus:border-gold text-white font-rajdhani rounded-none resize-none"
                placeholder={language === 'de' ? 'Zusätzliche Informationen...' : 'Additional information...'}
              />
            </div>

            {status === 'success' && (
              <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-rajdhani">{t('booking.success')}</span>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-rajdhani">{t('booking.error')}</span>
              </div>
            )}

            <Button
              type="submit"
              data-testid="booking-submit-btn"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-glow text-black font-teko text-lg uppercase tracking-wider py-6 transition-colors duration-300 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {language === 'de' ? 'Wird gesendet...' : 'Sending...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  {t('booking.submit')}
                </span>
              )}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
