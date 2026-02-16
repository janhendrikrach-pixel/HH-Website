import React from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Star, Quote } from 'lucide-react';

export const ReviewsSection = () => {
  const { t, language } = useLanguage();

  const reviews = [
    {
      id: 1,
      name: 'Steven Lrz',
      rating: 5,
      text_de: 'Der perfekte Ort, wenn man Wrestling trainieren möchte! Positiv: Kommunikation, Professionalität',
      text_en: 'The perfect place if you want to train wrestling! Positive: Communication, Professionalism',
      date: '2021'
    },
    {
      id: 2,
      name: 'Kai Schiebler',
      rating: 5,
      text_de: 'Cool weiter so',
      text_en: 'Cool keep it up',
      date: '2022'
    }
  ];

  return (
    <section
      id="reviews"
      data-testid="reviews-section"
      className="relative py-24 lg:py-32 bg-obsidian overflow-hidden"
    >
      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block font-rajdhani text-gold text-sm uppercase tracking-[0.2em] mb-4">
            {t('reviews.subtitle')}
          </span>
          <h2 className="font-teko text-4xl sm:text-5xl lg:text-6xl text-white uppercase">
            {t('reviews.title')}
          </h2>
          <div className="w-20 h-1 bg-gold mx-auto mt-6" />

          {/* Overall Rating */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="font-teko text-5xl text-gold">5.0</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-gold fill-gold" />
              ))}
            </div>
            <span className="font-rajdhani text-gray-400 ml-2">
              ({reviews.length} {language === 'de' ? 'Bewertungen' : 'Reviews'})
            </span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {reviews.map((review) => (
            <div
              key={review.id}
              data-testid={`review-card-${review.id}`}
              className="card-shine bg-charcoal border border-white/5 p-8 hover:border-gold/30 transition-colors duration-300 relative"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-10 h-10 text-gold/20" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-gold fill-gold" />
                ))}
              </div>

              {/* Text */}
              <p className="font-rajdhani text-gray-300 leading-relaxed mb-6">
                "{language === 'de' ? review.text_de : review.text_en}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                    <span className="font-teko text-gold text-lg">
                      {review.name.charAt(0)}
                    </span>
                  </div>
                  <span className="font-rajdhani text-white font-medium">
                    {review.name}
                  </span>
                </div>
                <span className="font-rajdhani text-gray-500 text-sm">
                  {review.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Google Review Link */}
        <div className="text-center mt-12">
          <a
            href="https://g.co/kgs/abc123"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="google-review-link"
            className="inline-flex items-center gap-2 font-rajdhani text-gold hover:text-gold-glow transition-colors duration-300"
          >
            <span>{language === 'de' ? 'Bewertung auf Google hinterlassen' : 'Leave a review on Google'}</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};
