# Headlock Headquarter - Wrestling School Website

## Original Problem Statement
Create a professional website for the Wrestling School "Headlock Headquarter" in Hannover with:
- Dark & powerful design with black/gold color scheme
- Course schedule/timetable
- Online booking system for trial training
- Trainer profiles
- Gallery/Media section (admin-managed)
- Contact form
- Admin backend for content management
- Bilingual support (German/English)

## User Personas
1. **Prospective Students** - People interested in learning wrestling, looking to book trial training
2. **Current Students** - Members checking schedule and updates
3. **Admin/Staff** - Managing content, bookings, and gallery

## Core Requirements (Static)
- ✅ Landing page with hero section
- ✅ About section with school history
- ✅ Trainer profiles with achievements
- ✅ Training schedule display
- ✅ Photo gallery with lightbox
- ✅ Contact form
- ✅ Trial training booking form
- ✅ Admin dashboard with full CRUD
- ✅ Bilingual DE/EN support

## What's Been Implemented (February 2026)

### Frontend
- **Home Page**: Hero section, About, Trainers, Schedule, Gallery, Reviews, Contact sections
- **Booking Page**: Full form with date picker and experience level selection
- **Admin Dashboard**: Complete management for trainers, schedule, gallery, bookings, contacts, settings
- **Language Switcher**: DE/EN toggle with persistent state

### Backend (FastAPI)
- Public APIs: `/api/trainers`, `/api/schedule`, `/api/gallery`, `/api/settings`, `/api/bookings`, `/api/contacts`
- Admin APIs: Full CRUD for all entities with HTTP Basic Auth
- Seed data endpoint for initial content

### Design
- Theme: "The Modern Gladiator" - Dark obsidian with gold accents
- Fonts: Teko (headings), Rajdhani (body)
- Effects: Gold glow, glass-obsidian panels, noise textures, shine animations

## Prioritized Backlog

### P0 (Critical) - DONE
- ✅ Core website structure
- ✅ All main features

### P1 (High Priority) - Next Phase
- [ ] Image upload to cloud storage (currently URL-based)
- [ ] Email notifications for new bookings
- [ ] Instagram feed integration

### P2 (Medium Priority)
- [ ] SEO optimization (meta tags, sitemap)
- [ ] PWA support for mobile
- [ ] Advanced analytics dashboard

### P3 (Low Priority)
- [ ] Member login area
- [ ] Event calendar integration
- [ ] Video gallery support

## Technical Stack
- Frontend: React 19 + Tailwind CSS + Shadcn/UI
- Backend: FastAPI + MongoDB
- Auth: HTTP Basic Auth for admin

## Admin Credentials
- Username: `admin`
- Password: `headlock2024`

## Contact Info
- Address: Max-Müller-Straße 1, 30179 Hannover
- Phone: 01523 3552397
- Email: info@wrestling.schule
