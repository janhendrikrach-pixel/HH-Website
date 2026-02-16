import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Instagram, ExternalLink, Play } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Instagram Embed Component
const InstagramEmbed = ({ postUrl }) => {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Load Instagram embed script
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    } else {
      const script = document.createElement('script');
      script.src = '//www.instagram.com/embed.js';
      script.async = true;
      script.onload = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      };
      document.body.appendChild(script);
    }
    setLoaded(true);
  }, [postUrl]);

  // Extract post ID from URL
  const getEmbedUrl = (url) => {
    // Handle different Instagram URL formats
    const match = url.match(/instagram\.com\/(p|reel|tv)\/([^/?]+)/);
    if (match) {
      return `https://www.instagram.com/${match[1]}/${match[2]}/embed`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(postUrl);
  
  if (!embedUrl) {
    return null;
  }

  return (
    <div className="instagram-embed-container">
      <iframe
        src={embedUrl}
        className="w-full border-0"
        style={{ minHeight: '400px', maxWidth: '540px' }}
        allowTransparency="true"
        scrolling="no"
        loading="lazy"
        title="Instagram Post"
      />
    </div>
  );
};

export const InstagramSection = () => {
  const { language } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState({ has_stories: false, count: 0 });
  const [loading, setLoading] = useState(true);
  const [showEmbeds, setShowEmbeds] = useState(false);

  useEffect(() => {
    const fetchInstagram = async () => {
      try {
        const [postsRes, storiesRes] = await Promise.all([
          axios.get(`${API}/instagram`),
          axios.get(`${API}/instagram/stories`)
        ]);
        setPosts(postsRes.data.filter(p => !p.is_story).slice(0, 6));
        setStories(storiesRes.data);
      } catch (error) {
        console.error('Error fetching Instagram:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInstagram();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-charcoal">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-obsidian rounded w-48 mx-auto" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-obsidian" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0 && !stories.has_stories) {
    return null;
  }

  // Check if any posts have embed_code or are embed type
  const embedPosts = posts.filter(p => p.post_type === 'embed' || p.embed_code);
  const regularPosts = posts.filter(p => p.post_type !== 'embed' && !p.embed_code);

  return (
    <section
      id="instagram"
      data-testid="instagram-section"
      className="relative py-24 lg:py-32 bg-charcoal overflow-hidden"
    >
      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Instagram className="w-8 h-8 text-gold" />
            <span className="font-rajdhani text-gold text-sm uppercase tracking-[0.2em]">
              @headlock_headquarter
            </span>
          </div>
          <h2 className="font-teko text-4xl sm:text-5xl lg:text-6xl text-white uppercase">
            {language === 'de' ? 'FOLGE UNS' : 'FOLLOW US'}
          </h2>
          <div className="w-20 h-1 bg-gold mx-auto mt-6" />
        </div>

        {/* Stories Indicator */}
        {stories.has_stories && (
          <div className="flex justify-center mb-8">
            <a
              href="https://www.instagram.com/headlock_headquarter"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 bg-obsidian border border-white/5 hover:border-gold/30 transition-colors duration-300"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-pulse">
                  <div className="w-full h-full rounded-full bg-charcoal p-0.5">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-black text-xs font-bold rounded-full flex items-center justify-center">
                  {stories.count}
                </span>
              </div>
              <div className="text-left">
                <p className="font-teko text-xl text-white group-hover:text-gold transition-colors duration-300">
                  {language === 'de' ? 'Neue Stories!' : 'New Stories!'}
                </p>
                <p className="font-rajdhani text-gray-400 text-sm">
                  {language === 'de' ? 'Jetzt auf Instagram ansehen' : 'Watch now on Instagram'}
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-gold transition-colors duration-300" />
            </a>
          </div>
        )}

        {/* Embedded Posts */}
        {embedPosts.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {embedPosts.map((post, index) => (
                <div key={post.id} className="w-full max-w-md">
                  {post.embed_code ? (
                    <div 
                      className="instagram-embed"
                      dangerouslySetInnerHTML={{ __html: post.embed_code }}
                    />
                  ) : (
                    <InstagramEmbed postUrl={post.post_url} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts Grid (Thumbnails) */}
        {regularPosts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {regularPosts.map((post, index) => (
              <a
                key={post.id}
                href={post.post_url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`instagram-post-${index}`}
                className="group relative aspect-square overflow-hidden"
              >
                <img
                  src={post.thumbnail_url || 'https://images.unsplash.com/photo-1623950851918-116ba38150d2?w=400'}
                  alt={post.caption || 'Instagram post'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-obsidian/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center">
                    {post.post_type === 'video' || post.post_type === 'reel' ? (
                      <Play className="w-12 h-12 text-gold mx-auto mb-2" />
                    ) : (
                      <Instagram className="w-12 h-12 text-gold mx-auto mb-2" />
                    )}
                    <span className="font-rajdhani text-white text-sm uppercase tracking-wider">
                      {language === 'de' ? 'Auf Instagram ansehen' : 'View on Instagram'}
                    </span>
                  </div>
                </div>

                {/* Post Type Badge */}
                {(post.post_type === 'video' || post.post_type === 'reel') && (
                  <div className="absolute top-3 right-3">
                    <Play className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                )}
              </a>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <a
            href="https://www.instagram.com/headlock_headquarter"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="instagram-follow-btn"
            className="inline-flex items-center gap-3 px-8 py-4 border border-gold/50 text-gold hover:bg-gold hover:text-black font-teko text-lg uppercase tracking-wider transition-colors duration-300"
          >
            <Instagram className="w-5 h-5" />
            {language === 'de' ? 'Folge uns auf Instagram' : 'Follow us on Instagram'}
          </a>
        </div>
      </div>
    </section>
  );
};
