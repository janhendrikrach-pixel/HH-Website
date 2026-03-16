# Headlock Headquarter - PRD

## Problemstellung
Professionelle Website für die Wrestling-Schule "Hedlock Headquarter" (Catch- und Wrestlingverein Hannover e.V.) mit dunklem Design, Gold-Akzenten, Zweisprachigkeit (DE/EN) und vollständigem Backend-CMS.

## Tech Stack
- **Backend:** FastAPI, Motor (async MongoDB), JWT Auth, fastapi-mail
- **Frontend:** React, React Router, Tailwind CSS, Shadcn UI
- **Datenbank:** MongoDB

## Implementierte Features
- Öffentliche Website mit allen Sektionen (Hero, About, Trainer, Schedule, Gallery, Contact)
- Vollständiges CMS im Admin-Panel (User: admin / Pass: headlock2024)
- Multi-Rollen-System (Admin, Trainer, Schüler) mit JWT-Auth
- Schüler- und Trainer-Dashboards
- Anwesenheitsverwaltung & E-Mail-Benachrichtigungen
- SEO (Meta-Tags, Sitemap, robots.txt)
- Google Maps Integration
- Custom Logo & Favicon
- Impressum-Seite (`/impressum`)
- **Datenschutz-Seite (`/datenschutz`)** - Feb 2026
- Deployment-Scripts (install.sh, docker-compose.yml, INSTALL.md)

## Backlog
### P1
- Automatische Trainings-Erinnerungen (Cron-Job für 24h vor Training)

### P2
- Instagram API Integration (automatischer Post-Abruf)
- Cloud Storage für Bild-Uploads (Migration von lokal zu Cloud)
- Backend-Refactoring (server.py in Module aufteilen)
