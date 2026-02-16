import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { HeroSection } from '../components/HeroSection';
import { AboutSection } from '../components/AboutSection';
import { TrainersSection } from '../components/TrainersSection';
import { ScheduleSection } from '../components/ScheduleSection';
import { GallerySection } from '../components/GallerySection';
import { ContactSection } from '../components/ContactSection';
import { ReviewsSection } from '../components/ReviewsSection';

export default function HomePage() {
  return (
    <div data-testid="home-page" className="min-h-screen bg-obsidian">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <TrainersSection />
        <ScheduleSection />
        <GallerySection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
