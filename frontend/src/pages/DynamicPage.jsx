import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Dynamic Section Renderer
const DynamicSection = ({ section, language }) => {
  const title = language === 'de' ? section.title_de : section.title_en;
  const subtitle = language === 'de' ? section.subtitle_de : section.subtitle_en;
  const content = language === 'de' ? section.content_de : section.content_en;

  // Text/Content Section
  if (section.section_type === 'text' || section.section_type === 'custom') {
    return (
      <section className="py-16 lg:py-24 bg-charcoal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {title && (
            <h2 className="font-teko text-3xl sm:text-4xl text-white uppercase mb-4">{title}</h2>
          )}
          {subtitle && (
            <p className="font-rajdhani text-gold text-lg mb-6">{subtitle}</p>
          )}
          {content && (
            <div 
              className="font-rajdhani text-gray-300 leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
            />
          )}
        </div>
      </section>
    );
  }

  // CTA Section
  if (section.section_type === 'cta') {
    const ctaLink = section.settings?.cta_link || '/booking';
    const ctaText = language === 'de' ? (section.settings?.cta_text_de || 'Mehr erfahren') : (section.settings?.cta_text_en || 'Learn More');
    
    return (
      <section 
        className="py-20 lg:py-32 relative overflow-hidden"
        style={{
          backgroundImage: section.background_image ? `url(${section.background_image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: section.background_color || '#0A0A0A'
        }}
      >
        <div className="absolute inset-0 bg-obsidian/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {title && (
            <h2 className="font-teko text-4xl sm:text-5xl lg:text-6xl text-white uppercase mb-4">{title}</h2>
          )}
          {subtitle && (
            <p className="font-rajdhani text-xl text-gray-300 mb-8">{subtitle}</p>
          )}
          {content && (
            <p className="font-rajdhani text-gray-400 mb-8">{content}</p>
          )}
          <a
            href={ctaLink}
            className="inline-block bg-gold hover:bg-gold-glow text-black font-teko text-lg uppercase tracking-wider px-8 py-4 transition-colors duration-300"
          >
            {ctaText}
          </a>
        </div>
      </section>
    );
  }

  // Hero Section
  if (section.section_type === 'hero') {
    const ctaLink = section.settings?.cta_link || '/booking';
    const ctaText = language === 'de' ? (section.settings?.cta_text_de || 'Mehr erfahren') : (section.settings?.cta_text_en || 'Learn More');
    
    return (
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {section.background_image && (
            <img src={section.background_image} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-obsidian/60 to-obsidian" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center py-20">
          {title && (
            <h1 className="font-teko text-4xl sm:text-5xl lg:text-7xl text-white uppercase mb-4">{title}</h1>
          )}
          {subtitle && (
            <p className="font-rajdhani text-lg sm:text-xl text-gray-300 mb-8">{subtitle}</p>
          )}
          {ctaText && (
            <a
              href={ctaLink}
              className="inline-block bg-gold hover:bg-gold-glow text-black font-teko text-lg uppercase tracking-wider px-8 py-4 transition-colors duration-300"
            >
              {ctaText}
            </a>
          )}
        </div>
      </section>
    );
  }

  // Default: Simple content block
  return (
    <section className="py-12 bg-obsidian">
      <div className="max-w-4xl mx-auto px-4">
        {title && <h2 className="font-teko text-2xl text-gold mb-4">{title}</h2>}
        {content && <p className="font-rajdhani text-gray-400">{content}</p>}
      </div>
    </section>
  );
};

export default function DynamicPage() {
  const { slug } = useParams();
  const { language } = useLanguage();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await axios.get(`${API}/pages/${slug}`);
        setPage(res.data);
      } catch (err) {
        console.error('Error fetching page:', err);
        setError(err.response?.status === 404 ? 'not_found' : 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (error === 'not_found') {
    return <Navigate to="/" replace />;
  }

  if (!page) {
    return <Navigate to="/" replace />;
  }

  const title = language === 'de' ? page.title_de : page.title_en;
  const sections = page.sections || [];

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      
      <main className="pt-20">
        {/* Page Header */}
        <div className="bg-charcoal py-16 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-teko text-4xl sm:text-5xl text-white uppercase">{title}</h1>
            <div className="w-20 h-1 bg-gold mt-4" />
          </div>
        </div>

        {/* Dynamic Sections */}
        {sections.length > 0 ? (
          sections.map((section) => (
            <DynamicSection key={section.id} section={section} language={language} />
          ))
        ) : (
          <div className="py-16">
            <div className="max-w-4xl mx-auto px-4">
              <p className="font-rajdhani text-gray-400 text-center">
                {language === 'de' ? 'Diese Seite hat noch keinen Inhalt.' : 'This page has no content yet.'}
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
