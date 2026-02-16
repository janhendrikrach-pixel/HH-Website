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
    ├── src/
    │   ├── components/ (sections + UI)
    │   ├── pages/ (HomePage, AdminPage, BookingPage, DynamicPage)
    │   └── lib/ (LanguageContext, translations, utils)
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
- [x] Trainer CRUD (Create, Read, Update, Delete)
- [x] Gallery CRUD with local image uploads
- [x] Schedule management
- [x] Instagram feed management (embed + custom posts)
- [x] Booking system for trial training
- [x] Contact form with message management
- [x] Full CMS: Homepage section management + dynamic page creation
- [x] Local file upload system (drag & drop)
- [x] Site settings management

## Testing Status
- Backend: 100% (25/25 tests passed)
- Frontend: 100% (all flows verified)
- Test reports: iteration_1.json, iteration_2.json

## Backlog (P2 - Future)
- [ ] AdminPage.jsx refactoring (>1200 lines, split into sub-components)
- [ ] Live Instagram API integration (auto-fetch posts)
- [ ] Cloud storage for images (AWS S3 / GCS)
- [ ] SEO optimization
- [ ] Performance optimization (yarn build timeout noted once)
