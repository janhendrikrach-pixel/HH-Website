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

## What's Been Implemented (Feb 2026)
- [x] Full bilingual website (DE/EN) with dark theme + gold accents
- [x] All homepage sections (Hero, About, Trainers, Schedule, Gallery, Instagram, Reviews, Contact)
- [x] Admin Panel: Full CMS, Trainer/Gallery/Schedule/Instagram CRUD, Bookings, Contacts, Settings
- [x] AdminPage refactored into modular components
- [x] Google Maps embed + SEO optimization + Logo/Favicon
- [x] Installation scripts (VPS + Docker)
- [x] Schedule fully editable
- [x] Student/Trainer System (JWT auth, profiles, RSVP, notifications, email reminders)
- [x] **Admin: Full User Management** (create/edit/delete students & trainers, detail views with attendance stats)
- [x] **Admin: Training-Sessions** (CRUD, coach assignment, attendance overview per session)
- [x] **Admin: Manual Attendance Change** (confirm/decline/reset any student per session)
- [x] **Admin: User Detail View** (profile info, attendance rate %, progress bar, recent sessions)

## Testing Status
- All tests passed: iterations 1-6
- Backend: 100%, Frontend: 100%

## Backlog
- [ ] Live Instagram API integration
- [ ] Cloud storage for images
