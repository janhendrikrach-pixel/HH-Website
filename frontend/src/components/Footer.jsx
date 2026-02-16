import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer data-testid="footer" className="bg-obsidian border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gold rounded flex items-center justify-center">
                <span className="font-teko text-2xl text-black font-bold">HH</span>
              </div>
              <div>
                <span className="font-teko text-xl text-white uppercase">Headlock</span>
                <span className="font-teko text-xl text-gold uppercase ml-2">HQ</span>
              </div>
            </Link>
            <p className="font-rajdhani text-gray-400 text-sm leading-relaxed">
              Wrestling Schule des Catch- und Wrestlingverein Hannover e.V.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-teko text-xl text-gold uppercase mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: '/#about', label: t('nav.about') },
                { href: '/#trainers', label: t('nav.trainers') },
                { href: '/#schedule', label: t('nav.schedule') },
                { href: '/#gallery', label: t('nav.gallery') },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-rajdhani text-gray-400 hover:text-gold transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-teko text-xl text-gold uppercase mb-6">{t('nav.contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span className="font-rajdhani text-gray-400 text-sm">
                  Max-Müller-Straße 1<br />30179 Hannover
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <a
                  href="tel:+4915233552397"
                  className="font-rajdhani text-gray-400 text-sm hover:text-gold transition-colors duration-300"
                >
                  01523 3552397
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <a
                  href="mailto:info@wrestling.schule"
                  className="font-rajdhani text-gray-400 text-sm hover:text-gold transition-colors duration-300"
                >
                  info@wrestling.schule
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-teko text-xl text-gold uppercase mb-6">Social Media</h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-instagram"
                className="w-12 h-12 border border-white/10 rounded flex items-center justify-center hover:border-gold hover:bg-gold/10 transition-colors duration-300 group"
              >
                <Instagram className="w-5 h-5 text-gray-400 group-hover:text-gold transition-colors duration-300" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-facebook"
                className="w-12 h-12 border border-white/10 rounded flex items-center justify-center hover:border-gold hover:bg-gold/10 transition-colors duration-300 group"
              >
                <Facebook className="w-5 h-5 text-gray-400 group-hover:text-gold transition-colors duration-300" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-rajdhani text-gray-500 text-sm">
            © {new Date().getFullYear()} Headlock Headquarter. {t('footer.rights')}.
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="font-rajdhani text-gray-500 text-sm hover:text-gold transition-colors duration-300"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              to="/imprint"
              className="font-rajdhani text-gray-500 text-sm hover:text-gold transition-colors duration-300"
            >
              {t('footer.imprint')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
