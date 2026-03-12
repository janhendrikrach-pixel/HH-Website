# Headlock Headquarter - Wrestling School Website

## Original Problem Statement
Professional website for "Hedlock Headquarter" wrestling school to replace existing site at wrestling.schule.

## Tech Stack
- **Backend**: FastAPI + Motor (async MongoDB)
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Database**: MongoDB

## Admin Credentials
- Username: `admin` | Password: `headlock2024`
- Auth: HTTP Basic Auth

## What's Been Implemented (Feb 2026)
- [x] Full bilingual website (DE/EN) with dark theme + gold accents
- [x] Homepage: Hero, About, Trainers, Schedule, Gallery, Instagram, Reviews, Contact
- [x] Admin Panel with multi-tab management
- [x] Full CMS: Homepage sections + dynamic pages
- [x] Trainer, Gallery, Schedule, Instagram CRUD
- [x] Local file upload (drag & drop)
- [x] Booking system + Contact form
- [x] AdminPage.jsx refactored into 9 components
- [x] Google Maps embed (XFights Hannover Badenstedt)
- [x] SEO: Meta tags, OG, Twitter Cards, JSON-LD, robots.txt, sitemap.xml, hreflang
- [x] **Custom Logo/Favicon** integrated across all pages (Navbar, Footer, Admin, Browser)
- [x] **Installation Scripts**: install.sh (Linux VPS) + Docker Compose

## Deployment Files
- `install.sh` - Automated VPS installation (Ubuntu/Debian)
- `docker-compose.yml` - Docker deployment
- `backend/Dockerfile` - Backend container
- `frontend/Dockerfile` + `nginx.conf` - Frontend container
- `backend/.env.docker` - Docker environment config
- `INSTALL.md` - Complete installation guide

## Backlog
- [ ] Live Instagram API integration
- [ ] Cloud storage for images
