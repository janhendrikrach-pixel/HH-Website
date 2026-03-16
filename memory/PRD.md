# Headlock Headquarter - Wrestling School Website

## Original Problem Statement
Professional website for "Hedlock Headquarter" wrestling school to replace existing site at wrestling.schule.

## Tech Stack
- **Backend**: FastAPI + Motor (async MongoDB) + JWT Auth + bcrypt
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Database**: MongoDB

## Credentials
- **Admin**: user: `admin`, pass: `headlock2024` (HTTP Basic Auth, /admin)
- **Test Student**: max@test.de / test1234 (JWT, /login -> /student)
- **Test Trainer**: leon@test.de / coach1234 (JWT, /login -> /trainer)

## Architecture
```
/app/
├── backend/
│   ├── server.py (API: auth, users, sessions, attendance, notifications, CMS, CRUD)
│   ├── uploads/ (gallery, instagram, trainers, pages, profiles)
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/ (AdminLogin, Dashboard, Bookings, Contacts, Trainers, Gallery, Schedule, Settings, Instagram, UsersManager)
    │   │   ├── ui/ (Shadcn)
    │   │   ├── SEOHead.jsx, CMSManager.jsx, ImageUpload.jsx
    │   │   └── ...section components
    │   ├── pages/ (HomePage, AdminPage, BookingPage, LoginPage, StudentDashboard, TrainerDashboard, DynamicPage)
    │   └── lib/ (AuthContext, LanguageContext, translations, utils)
    └── .env
```

## What's Been Implemented (Feb 2026)
- [x] Full bilingual website (DE/EN) with dark theme + gold accents
- [x] All homepage sections (Hero, About, Trainers, Schedule, Gallery, Instagram, Reviews, Contact)
- [x] Admin Panel: Full CMS, Trainer/Gallery/Schedule/Instagram CRUD, Bookings, Contacts, Settings
- [x] AdminPage refactored into 9 components
- [x] Google Maps embed (XFights Hannover Badenstedt)
- [x] SEO: Meta tags, OG, Twitter Cards, JSON-LD, robots.txt, sitemap.xml
- [x] Custom Logo/Favicon
- [x] Installation scripts (VPS + Docker)
- [x] Schedule fully editable from admin
- [x] **Student/Trainer System**:
  - Admin creates user accounts (student/trainer roles)
  - JWT-based authentication (/login)
  - Student dashboard: Profile, Training RSVP (confirm/decline), Notifications
  - Trainer dashboard: Create sessions, assign coach, view attendance
  - 24h reminder system (notifications + email when Resend API key configured)
  - Auto-attendance creation for all students when session created

## Testing Status
- Backend: 100% (62/62 tests passed)
- Frontend: 100%
- Test reports: iteration_1-5

## Email Configuration
- Requires `RESEND_API_KEY` and `SENDER_EMAIL` in backend/.env
- Without API key, emails are logged but not sent
- Used for: welcome emails, 24h training reminders

## Backlog
- [ ] Live Instagram API integration
- [ ] Cloud storage for images
