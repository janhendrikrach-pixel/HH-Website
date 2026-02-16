import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { MapPin, Phone, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ContactSection = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState({
    address: 'Max-Müller-Straße 1, 30179 Hannover',
    phone: '01523 3552397',
    email: 'info@wrestling.schule',
    opening_hours_de: 'Samstags 12:00 - 16:00 Uhr',
    opening_hours_en: 'Saturdays 12:00 - 16:00'
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API}/settings`);
        setSettings(res.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await axios.post(`${API}/contacts`, formData);
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact:', error);
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
    <section
      id="contact"
      data-testid="contact-section"
      className="relative py-24 lg:py-32 bg-charcoal overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 30%, rgba(212, 175, 55, 0.3) 0%, transparent 50%)`
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block font-rajdhani text-gold text-sm uppercase tracking-[0.2em] mb-4">
            {t('contact.subtitle')}
          </span>
          <h2 className="font-teko text-4xl sm:text-5xl lg:text-6xl text-white uppercase">
            {t('contact.title')}
          </h2>
          <div className="w-20 h-1 bg-gold mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Info */}
          <div>
            <div className="space-y-8">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-obsidian border border-gold/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-teko text-xl text-white uppercase mb-1">
                    {t('contact.address')}
                  </h4>
                  <p className="font-rajdhani text-gray-400">
                    {settings.address}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-obsidian border border-gold/30 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-teko text-xl text-white uppercase mb-1">
                    {t('contact.phone')}
                  </h4>
                  <a
                    href={`tel:${settings.phone}`}
                    className="font-rajdhani text-gray-400 hover:text-gold transition-colors duration-300"
                  >
                    {settings.phone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-obsidian border border-gold/30 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-teko text-xl text-white uppercase mb-1">
                    {t('contact.email')}
                  </h4>
                  <a
                    href={`mailto:${settings.email}`}
                    className="font-rajdhani text-gray-400 hover:text-gold transition-colors duration-300"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="mt-8 p-6 bg-obsidian border border-white/5">
                <h4 className="font-teko text-xl text-gold uppercase mb-2">
                  {t('contact.openHours')}
                </h4>
                <p className="font-rajdhani text-gray-400">
                  {language === 'de' ? settings.opening_hours_de : settings.opening_hours_en}
                </p>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-8 aspect-video bg-obsidian border border-white/5 flex items-center justify-center">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2434.5!2d9.7556!3d52.4097!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTLCsDI0JzM0LjkiTiA5wrA0NScyMC4yIkU!5e0!3m2!1sde!2sde!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) invert(90%)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="font-rajdhani text-gray-400 mb-2 block">
                    {t('contact.name')}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    data-testid="contact-name-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-obsidian border-white/10 focus:border-gold text-white font-rajdhani rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="font-rajdhani text-gray-400 mb-2 block">
                    {t('contact.email')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    data-testid="contact-email-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-obsidian border-white/10 focus:border-gold text-white font-rajdhani rounded-none"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="font-rajdhani text-gray-400 mb-2 block">
                  {t('contact.phone')}
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  data-testid="contact-phone-input"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-obsidian border-white/10 focus:border-gold text-white font-rajdhani rounded-none"
                />
              </div>

              <div>
                <Label htmlFor="message" className="font-rajdhani text-gray-400 mb-2 block">
                  {t('contact.message')}
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  data-testid="contact-message-input"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="bg-obsidian border-white/10 focus:border-gold text-white font-rajdhani rounded-none resize-none"
                />
              </div>

              {status === 'success' && (
                <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-rajdhani">{t('contact.success')}</span>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-rajdhani">{t('contact.error')}</span>
                </div>
              )}

              <Button
                type="submit"
                data-testid="contact-submit-btn"
                disabled={loading}
                className="w-full bg-gold hover:bg-gold-glow text-black font-teko text-lg uppercase tracking-wider py-6 transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    {t('contact.send')}
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
