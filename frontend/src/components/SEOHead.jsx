import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../lib/LanguageContext';

export function SEOHead({ page = 'home', customTitle, customDescription }) {
  const { language } = useLanguage();

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

  // Ensure language is valid, default to 'de' if undefined
  const currentLang = language || 'de';
  const current = seo[page]?.[currentLang] || seo.home[currentLang] || seo.home.de;
  const title = customTitle || current?.title || 'Headlock Headquarter - Wrestling Schule Hannover';
  const description = customDescription || current?.description || 'Professionelles Catch- und Wrestlingtraining in Hannover.';
  const siteUrl = window.location.origin;
  const currentUrl = window.location.href;

  const structuredData = {
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
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 52.4097,
      longitude: 9.7556
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
  };

  return (
    <Helmet>
      <html lang={language} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />

      {/* hreflang */}
      <link rel="alternate" hrefLang="de" href={siteUrl} />
      <link rel="alternate" hrefLang="en" href={siteUrl} />
      <link rel="alternate" hrefLang="x-default" href={siteUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Headlock Headquarter" />
      <meta property="og:locale" content={language === 'de' ? 'de_DE' : 'en_US'} />
      <meta property="og:image" content="https://images.unsplash.com/photo-1623950851918-116ba38150d2?w=1200&h=630&fit=crop" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://images.unsplash.com/photo-1623950851918-116ba38150d2?w=1200&h=630&fit=crop" />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Headlock Headquarter - CWH e.V." />
      <meta name="keywords" content={language === 'de'
        ? 'Wrestling, Catch Wrestling, Hannover, Wrestlingtraining, Probetraining, Wrestling Schule, CWH, Kampfsport'
        : 'Wrestling, Catch Wrestling, Hannover, Wrestling Training, Trial Training, Wrestling School, CWH, Martial Arts'
      } />
      <meta name="geo.region" content="DE-NI" />
      <meta name="geo.placename" content="Hannover" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
