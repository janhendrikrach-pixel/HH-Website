# Headlock Headquarter - Wrestling School Website

## Original Problem Statement
Professional website for "Hedlock Headquarter" wrestling school to replace existing site at wrestling.schule. Uses information from Google Maps listing, existing website, and Instagram images.

## User Personas
- **Admin**: Wrestling school owners/trainers who manage content, bookings, and messages
- **Visitors**: Potential students looking for wrestling training information
- **Language**: German (primary) / English (secondary)

## Core Requirements
- Dark & powerful design with gold accents
- Bilingual (German/English)
- Full backend CMS for content management
- Image management through backend (local uploads)
- Trainer CRUD management
- Instagram feed integration (embed-based)
- Booking system for trial training
- Contact form

## Tech Stack
- **Backend**: FastAPI + Motor (async MongoDB)
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Database**: MongoDB
- **Fonts**: Teko, Rajdhani (Google Fonts)

## Architecture
```
/app/
├── backend/
│   ├── uploads/ (gallery, instagram, trainers, pages)
│   ├── server.py (all API endpoints)
│   └── .env
└── frontend/
    ├── public/
    │   ├── index.html (SEO meta tags)
    │   ├── robots.txt
    │   └── sitemap.xml
    ├── src/
    │   ├── components/
    │   │   ├── admin/ (9 refactored admin sub-components)
    │   │   ├── ui/ (Shadcn UI)
    │   │   ├── SEOHead.jsx (dynamic SEO via DOM manipulation)
    │   │   ├── CMSManager.jsx
    │   │   ├── ImageUpload.jsx
    │   │   └── ... (section components)
    │   ├── pages/
    │   │   ├── AdminPage.jsx (slim orchestrator)
    │   │   ├── HomePage.jsx
    │   │   ├── BookingPage.jsx
    │   │   └── DynamicPage.jsx
    │   └── lib/
    └── .env
```

## Admin Credentials
- Username: `admin`
- Password: `headlock2024`
- Auth: HTTP Basic Auth

## What's Been Implemented (Feb 2026)
- [x] Full bilingual website (DE/EN) with dark theme + gold accents
- [x] Homepage: Hero, About, Trainers, Schedule, Gallery, Instagram, Reviews, Contact sections
- [x] Admin Panel with multi-tab management interface
- [x] Trainer CRUD, Gallery CRUD, Schedule, Instagram, Bookings, Contacts management
- [x] Full CMS: Homepage section management + dynamic page creation
- [x] Local file upload system (drag & drop)
- [x] AdminPage.jsx refactored into 9 separate components
- [x] **Google Maps embed** in Contact section (XFights Hannover Badenstedt, Badenstedter Str. 60)
- [x] **SEO Optimization**: Meta tags, OG, Twitter Cards, JSON-LD (SportsActivityLocation), robots.txt, sitemap.xml, hreflang, canonical URLs, semantic HTML

## Testing Status
- Backend: 100% (25/25 tests passed)
- Frontend: 100% (all flows verified)
- Test reports: iteration_1-4

## Backlog (P2 - Future)
- [ ] Live Instagram API integration (auto-fetch posts)
- [ ] Cloud storage for images (AWS S3 / GCS)
