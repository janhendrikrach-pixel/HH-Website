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
- Instagram Feed Integration with Stories indicator
- Local image uploads

## User Personas
1. **Prospective Students** - People interested in learning wrestling, looking to book trial training
2. **Current Students** - Members checking schedule and updates
3. **Admin/Staff** - Managing content, bookings, gallery, Instagram posts

## Core Requirements (Static)
- ✅ Landing page with hero section
- ✅ About section with school history
- ✅ Trainer profiles with achievements (full CRUD with image upload)
- ✅ Training schedule display
- ✅ Photo gallery with lightbox and upload
- ✅ Instagram Feed with Embed support and Stories
- ✅ Contact form
- ✅ Trial training booking form
- ✅ Admin dashboard with full CRUD
- ✅ Local image uploads (drag & drop)
- ✅ Bilingual DE/EN support

## What's Been Implemented (February 2026)

### Frontend
- **Home Page**: Hero, About, Trainers, Schedule, Gallery, Instagram Feed (with Embeds), Reviews, Contact
- **Booking Page**: Full form with date picker and experience level
- **Admin Dashboard**: Complete management for all content with image uploads
- **Language Switcher**: DE/EN toggle with persistent state

### Backend (FastAPI)
- Public APIs: All content endpoints
- Admin APIs: Full CRUD with HTTP Basic Auth
- **Image Upload API**: `/api/admin/upload/{category}` - supports gallery, trainers, instagram
- **Static Files**: `/api/uploads/` serves uploaded images
- Supported formats: JPG, PNG, GIF, WebP (max 10MB)

### Admin Features
- **Trainer Management**: Full CRUD with drag & drop image upload
- **Gallery Management**: Add/remove images with upload or URL
- **Instagram Management**: 
  - Add posts as thumbnails OR embedded iFrames
  - Mark posts as Stories (with animated ring indicator)
  - Upload custom thumbnails
- **Booking/Contact Management**: View, confirm, delete

### Design
- Theme: "The Modern Gladiator" - Dark obsidian with gold accents
- Fonts: Teko (headings), Rajdhani (body)
- Effects: Gold glow, glass-obsidian panels, noise textures

## Technical Stack
- Frontend: React 19 + Tailwind CSS + Shadcn/UI
- Backend: FastAPI + MongoDB
- Storage: Local uploads in `/app/backend/uploads/`
- Auth: HTTP Basic Auth for admin

## Admin Credentials
- Username: `admin`
- Password: `headlock2024`

## File Upload Locations
- Gallery: `/app/backend/uploads/gallery/`
- Trainers: `/app/backend/uploads/trainers/`
- Instagram: `/app/backend/uploads/instagram/`

## Prioritized Backlog

### P0 (Critical) - DONE
- ✅ All core features
- ✅ Instagram Embed support
- ✅ Local image uploads

### P1 (High Priority) - Next Phase
- [ ] Email notifications for new bookings
- [ ] SEO optimization (meta tags, sitemap)

### P2 (Medium Priority)
- [ ] PWA support for mobile
- [ ] Image optimization/compression

### P3 (Low Priority)
- [ ] Member login area
- [ ] Event calendar integration
