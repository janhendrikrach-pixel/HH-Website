import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';

const STORAGE_KEY = 'cookie_consent';

const defaultPreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

export const CookieBanner = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const save = (prefs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setVisible(false);
  };

  const acceptAll = () => {
    const all = { necessary: true, functional: true, analytics: true, marketing: true };
    save(all);
  };

  const rejectAll = () => {
    save({ ...defaultPreferences });
  };

  const acceptSelected = () => {
    save({ ...preferences, necessary: true });
  };

  const toggle = (key) => {
    if (key === 'necessary') return;
    setPreferences((p) => ({ ...p, [key]: !p[key] }));
  };

  if (!visible) return null;

  const categories = [
    {
      key: 'necessary',
      label: t('cookie.necessary'),
      desc: t('cookie.necessaryDesc'),
      locked: true,
    },
    {
      key: 'functional',
      label: t('cookie.functional'),
      desc: t('cookie.functionalDesc'),
      locked: false,
    },
    {
      key: 'analytics',
      label: t('cookie.analytics'),
      desc: t('cookie.analyticsDesc'),
      locked: false,
    },
    {
      key: 'marketing',
      label: t('cookie.marketing'),
      desc: t('cookie.marketingDesc'),
      locked: false,
    },
  ];

  return (
    <div data-testid="cookie-banner" className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl shadow-black/50 backdrop-blur-sm">
        {/* Header */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-3">
            <Shield className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <h3 className="font-teko text-xl text-white uppercase tracking-wide">
                {t('cookie.title')}
              </h3>
              <p className="font-rajdhani text-sm text-gray-400 mt-1 leading-relaxed">
                {t('cookie.description')}{' '}
                <Link to="/datenschutz" className="text-gold hover:text-gold-glow underline transition-colors">
                  {t('cookie.learnMore')}
                </Link>
              </p>
            </div>
          </div>

          {/* Toggle details */}
          <button
            data-testid="cookie-toggle-details"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 font-rajdhani text-sm text-gold hover:text-gold-glow transition-colors mt-2"
          >
            {showDetails ? t('cookie.hideDetails') : t('cookie.showDetails')}
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Categories */}
          {showDetails && (
            <div data-testid="cookie-categories" className="mt-4 space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat.key}
                  data-testid={`cookie-category-${cat.key}`}
                  className="flex items-start justify-between gap-4 p-3 rounded bg-white/5 border border-white/5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-rajdhani text-sm text-white font-medium">{cat.label}</p>
                    <p className="font-rajdhani text-xs text-gray-500 mt-0.5 leading-relaxed">{cat.desc}</p>
                  </div>
                  <button
                    data-testid={`cookie-toggle-${cat.key}`}
                    onClick={() => toggle(cat.key)}
                    disabled={cat.locked}
                    className={`relative shrink-0 w-10 h-5 rounded-full transition-colors duration-200 ${
                      preferences[cat.key]
                        ? 'bg-gold'
                        : 'bg-white/20'
                    } ${cat.locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                        preferences[cat.key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-5">
            <button
              data-testid="cookie-accept-all"
              onClick={acceptAll}
              className="flex-1 px-4 py-2.5 bg-gold text-obsidian font-teko text-base uppercase tracking-wider rounded hover:bg-gold-glow transition-colors duration-200"
            >
              {t('cookie.acceptAll')}
            </button>
            {showDetails && (
              <button
                data-testid="cookie-accept-selected"
                onClick={acceptSelected}
                className="flex-1 px-4 py-2.5 border border-gold/50 text-gold font-teko text-base uppercase tracking-wider rounded hover:bg-gold/10 transition-colors duration-200"
              >
                {t('cookie.acceptSelected')}
              </button>
            )}
            <button
              data-testid="cookie-reject-all"
              onClick={rejectAll}
              className="flex-1 px-4 py-2.5 border border-white/10 text-gray-400 font-teko text-base uppercase tracking-wider rounded hover:border-white/30 hover:text-gray-300 transition-colors duration-200"
            >
              {t('cookie.rejectAll')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
