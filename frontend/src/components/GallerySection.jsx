import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { X, ZoomIn } from 'lucide-react';
import axios from 'axios';
import { Dialog, DialogContent } from './ui/dialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const GallerySection = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get(`${API}/gallery`);
        setImages(res.data);
      } catch (error) {
        console.error('Error fetching gallery:', error);
        // Fallback data
        setImages([
          { id: '1', url: 'https://images.unsplash.com/photo-1623950851918-116ba38150d2?w=800', title: 'Training' },
          { id: '2', url: 'https://images.unsplash.com/photo-1611338631743-b0362363f417?w=800', title: 'Grappling' },
          { id: '3', url: 'https://images.unsplash.com/photo-1644428321939-efd594294e8e?w=800', title: 'Equipment' },
          { id: '4', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800', title: 'Fitness' },
          { id: '5', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', title: 'Gym' },
          { id: '6', url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800', title: 'Training' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return (
    <section
      id="gallery"
      data-testid="gallery-section"
      className="relative py-24 lg:py-32 bg-obsidian overflow-hidden"
    >
      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block font-rajdhani text-gold text-sm uppercase tracking-[0.2em] mb-4">
            {t('gallery.subtitle')}
          </span>
          <h2 className="font-teko text-4xl sm:text-5xl lg:text-6xl text-white uppercase">
            {t('gallery.title')}
          </h2>
          <div className="w-20 h-1 bg-gold mx-auto mt-6" />
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-charcoal animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <button
                key={image.id}
                data-testid={`gallery-image-${index}`}
                onClick={() => setSelectedImage(image)}
                className="group relative aspect-square overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <img
                  src={image.url}
                  alt={image.title || `Gallery ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <ZoomIn className="w-10 h-10 text-gold" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-obsidian to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="font-rajdhani text-white text-sm">{image.title}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Lightbox */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl bg-charcoal border-white/10 p-0 overflow-hidden">
            {selectedImage && (
              <div className="relative">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 p-2 bg-obsidian/80 rounded-full hover:bg-gold transition-colors duration-300"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                {selectedImage.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-obsidian to-transparent">
                    <span className="font-teko text-xl text-white">{selectedImage.title}</span>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
