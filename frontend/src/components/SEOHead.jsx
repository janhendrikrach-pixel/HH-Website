import { useEffect } from 'react';
import { useLanguage } from '../lib/LanguageContext';

function setMeta(name, content, property = false) {
  const attr = property ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel, href, attrs = {}) {
  const selector = Object.entries(attrs).map(([k, v]) => `[${k}="${v}"]`).join('');
  let el = document.querySelector(`link[rel="${rel}"]${selector}`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function SEOHead({ page = 'home', customTitle, customDescription }) {
  const { language } = useLanguage();

  useEffect(() => {
    const seo = {
      home: {
        de: {
          title: 'Headlock Headquarter - Wrestling Schule Hannover | Catch- & Wrestlingtraining',
          description: 'Professionelles Catch- und Wrestlingtraining in Hannover. Wöchentliches Training, erfahrene Trainer, Probetraining möglich. Wrestling Schule des CWH e.V. seit 1994.'
        },
        en: {
          title: 'Headlock Headquarter - Wrestling School Hannover | Catch & Wrestling Training',
          description: 'Professional catch and wrestling training in Hannover, Germany. Weekly training sessions, experienced coaches, trial training available. Wrestling school of CWH e.V. since 1994.'
        }
      },
      booking: {
        de: {
          title: 'Probetraining buchen - Headlock Headquarter Wrestling Schule',
          description: 'Buche jetzt dein kostenloses Probetraining bei Headlock Headquarter in Hannover. Catch- und Wrestlingtraining für Anfänger und Fortgeschrittene.'
        },
        en: {
          title: 'Book Trial Training - Headlock Headquarter Wrestling School',
          description: 'Book your free trial training at Headlock Headquarter in Hannover. Catch and wrestling training for beginners and advanced athletes.'
        }
      }
    };

    const current = seo[page]?.[language] || seo.home[language];
    const title = customTitle || current.title;
    const description = customDescription || current.description;
    const siteUrl = window.location.origin;
    const currentUrl = window.location.href;
    const ogImage = 'https://images.unsplash.com/photo-1623950851918-116ba38150d2?w=1200&h=630&fit=crop';

    // Title & lang
    document.title = title;
    document.documentElement.lang = language;

    // Basic meta
    setMeta('description', description);
    setMeta('author', 'Headlock Headquarter - CWH e.V.');
    setMeta('robots', 'index, follow');
    setMeta('keywords', language === 'de'
      ? 'Wrestling, Catch Wrestling, Hannover, Wrestlingtraining, Probetraining, Wrestling Schule, CWH, Kampfsport'
      : 'Wrestling, Catch Wrestling, Hannover, Wrestling Training, Trial Training, Wrestling School, CWH, Martial Arts'
    );
    setMeta('geo.region', 'DE-NI');
    setMeta('geo.placename', 'Hannover');

    // Open Graph
    setMeta('og:type', 'website', true);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', currentUrl, true);
    setMeta('og:site_name', 'Headlock Headquarter', true);
    setMeta('og:locale', language === 'de' ? 'de_DE' : 'en_US', true);
    setMeta('og:image', ogImage, true);
    setMeta('og:image:width', '1200', true);
    setMeta('og:image:height', '630', true);

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // Canonical
    setLink('canonical', currentUrl);

    // hreflang
    setLink('alternate', siteUrl, { hreflang: 'de' });
    setLink('alternate', siteUrl, { hreflang: 'en' });
    setLink('alternate', siteUrl, { hreflang: 'x-default' });

    // Structured Data (JSON-LD)
    let jsonLd = document.querySelector('script[data-seo="structured-data"]');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.type = 'application/ld+json';
      jsonLd.setAttribute('data-seo', 'structured-data');
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SportsActivityLocation',
      name: 'Headlock Headquarter',
      alternateName: 'Wrestling Schule Hannover',
      description: language === 'de'
        ? 'Professionelles Catch- und Wrestlingtraining in Hannover seit 1994'
        : 'Professional catch and wrestling training in Hannover since 1994',
      url: siteUrl,
      telephone: '+4915233552397',
      email: 'info@wrestling.schule',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Max-Müller-Straße 1',
        addressLocality: 'Hannover',
        postalCode: '30179',
        addressCountry: 'DE'
      },
      location: {
        '@type': 'Place',
        name: 'XFights Hannover Badenstedt',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Badenstedter Straße 60',
          addressLocality: 'Hannover',
          postalCode: '30453',
          addressCountry: 'DE'
        }
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '12:00',
        closes: '16:00'
      },
      sport: 'Wrestling',
      foundingDate: '1994',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5.0',
        reviewCount: '2',
        bestRating: '5'
      }
    });
  }, [page, language, customTitle, customDescription]);

  return null;
}
