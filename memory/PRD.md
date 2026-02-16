# Headlock Headquarter - Wrestling School Website

## Original Problem Statement
Create a professional website for the Wrestling School "Headlock Headquarter" in Hannover with full CMS capabilities.

## Core Features

### Implemented ✅
1. **Landing Page** - Hero, About, Trainers, Schedule, Gallery, Instagram, Reviews, Contact
2. **Booking System** - Trial training booking with form
3. **Admin Dashboard** - Full content management
4. **Bilingual** - German/English with language switcher
5. **Image Uploads** - Local drag & drop uploads
6. **Instagram Integration** - Embed support, Story indicators

### CMS System ✅ (NEW)
- **Homepage Editor** - Edit all homepage sections (titles, subtitles, content, images)
- **Section Management** - Add/edit/delete/reorder sections per page
- **Page Creator** - Create unlimited new pages with custom URLs
- **Section Types**: Hero, About, Trainers, Schedule, Gallery, Instagram, Reviews, Contact, Text, CTA, Custom
- **Templates**: Default, Landing Page, Simple (text only)
- **Dynamic Routing** - Pages accessible at /page/{slug}

## Admin Navigation
1. Dashboard - Overview stats
2. Homepage - Edit homepage sections
3. Seiten (Pages) - Create/manage pages
4. Trainer - Manage trainers
5. Trainingszeiten - Manage schedule
6. Galerie - Manage gallery
7. Instagram - Manage feed & stories
8. Buchungen - View/manage bookings
9. Nachrichten - View/manage contacts
10. Einstellungen - Site settings

## Technical Stack
- Frontend: React 19 + Tailwind CSS + Shadcn/UI
- Backend: FastAPI + MongoDB
- Storage: Local uploads
- Auth: HTTP Basic Auth

## Admin Credentials
- URL: `/admin`
- Username: `admin`
- Password: `headlock2024`

## API Endpoints

### Public
- GET `/api/pages` - List published pages
- GET `/api/pages/{slug}` - Get page with sections
- GET `/api/homepage` - Get homepage sections
- GET `/api/sections/{page_id}` - Get page sections

### Admin CMS
- GET/POST `/api/admin/pages` - Manage pages
- PUT/DELETE `/api/admin/pages/{id}` - Edit/delete page
- GET/POST `/api/admin/sections` - Manage sections
- PUT/DELETE `/api/admin/sections/{id}` - Edit/delete section
- PUT `/api/admin/sections/reorder/{page_id}` - Reorder sections
- POST `/api/admin/init-homepage` - Initialize default sections

## Prioritized Backlog

### P0 (Critical) - DONE ✅
- All core website features
- Full CMS with page/section management
- Image uploads
- Instagram embed

### P1 (High Priority)
- [ ] Email notifications for bookings
- [ ] SEO meta tags from page settings

### P2 (Medium Priority)  
- [ ] Rich text editor for content
- [ ] Page preview before publish
