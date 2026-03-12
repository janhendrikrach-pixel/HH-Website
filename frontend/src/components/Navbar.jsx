import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';
import { Menu, X, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export const Navbar = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/#about', label: t('nav.about') },
    { href: '/#trainers', label: t('nav.trainers') },
    { href: '/#schedule', label: t('nav.schedule') },
    { href: '/#gallery', label: t('nav.gallery') },
    { href: '/#contact', label: t('nav.contact') },
  ];

  const handleNavClick = (href) => {
    setIsOpen(false);
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? 'glass-obsidian' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            data-testid="nav-logo"
            className="flex items-center gap-3 group"
          >
            <img src="/logo-200.png" alt="Headlock Headquarter Logo" className="w-12 h-12 object-contain" />
            <div className="hidden sm:block">
              <span className="font-teko text-2xl text-white uppercase tracking-wide group-hover:text-gold transition-colors duration-300">
                Headlock
              </span>
              <span className="font-teko text-2xl text-gold uppercase tracking-wide ml-2">
                Headquarter
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith('/#')) {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }
                }}
                data-testid={`nav-${item.href.replace('/#', '').replace('/', 'home')}`}
                className="font-rajdhani text-sm uppercase tracking-wider text-gray-300 hover:text-gold transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              data-testid="language-toggle"
              className="flex items-center gap-2 px-3 py-2 border border-white/10 hover:border-gold/50 rounded transition-colors duration-300"
            >
              <Globe className="w-4 h-4 text-gold" />
              <span className="font-rajdhani text-sm uppercase">{language}</span>
            </button>

            {/* CTA Button - Desktop */}
            <Link
              to="/booking"
              data-testid="nav-booking-btn"
              className="hidden lg:block"
            >
              <Button className="bg-gold hover:bg-gold-glow text-black font-teko uppercase tracking-wider px-6 py-2 transition-colors duration-300">
                {t('nav.booking')}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <button
                  data-testid="mobile-menu-toggle"
                  className="p-2 text-white hover:text-gold transition-colors duration-300"
                >
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-charcoal border-white/10 w-80">
                <div className="flex flex-col gap-6 mt-8">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        if (item.href.startsWith('/#')) {
                          e.preventDefault();
                          handleNavClick(item.href);
                        }
                        setIsOpen(false);
                      }}
                      data-testid={`mobile-nav-${item.href.replace('/#', '').replace('/', 'home')}`}
                      className="font-teko text-2xl uppercase tracking-wider text-white hover:text-gold transition-colors duration-300"
                    >
                      {item.label}
                    </a>
                  ))}
                  <Link
                    to="/booking"
                    onClick={() => setIsOpen(false)}
                    data-testid="mobile-nav-booking"
                  >
                    <Button className="w-full bg-gold hover:bg-gold-glow text-black font-teko uppercase tracking-wider py-3 mt-4 transition-colors duration-300">
                      {t('nav.booking')}
                    </Button>
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    data-testid="mobile-nav-admin"
                  >
                    <Button variant="outline" className="w-full border-white/20 text-white font-teko uppercase tracking-wider py-3 hover:border-gold/50 hover:text-gold transition-colors duration-300">
                      {t('nav.admin')}
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
