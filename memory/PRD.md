# Headlock Headquarter - PRD

## Problemstellung
Professionelle Website für die Wrestling-Schule "Hedlock Headquarter" (Catch- und Wrestlingverein Hannover e.V.) mit dunklem Design, Gold-Akzenten, Zweisprachigkeit (DE/EN) und vollständigem Backend-CMS.

## Tech Stack
- **Backend:** FastAPI, Motor (async MongoDB), JWT Auth, fastapi-mail, reportlab, qrcode
- **Frontend:** React, React Router, Tailwind CSS, Shadcn UI, html5-qrcode
- **Datenbank:** MongoDB

## Implementierte Features
- Öffentliche Website mit allen Sektionen (Hero, About, Trainer, Schedule, Gallery, Contact)
- Vollständiges CMS im Admin-Panel (User: admin / Pass: headlock2024)
- Multi-Rollen-System (Admin, Trainer, Schüler, Ticket-Scanner) mit JWT-Auth
- Schüler- und Trainer-Dashboards als PWA-fähige Unified App (/app)
- Nachrichten-System (Chat zwischen Mitgliedern)
- Notizen-System (persönliche Trainingsnotizen)
- Trainingspläne (Trainer erstellt für Schüler)
- Anwesenheitsverwaltung & E-Mail-Benachrichtigungen
- SEO (Meta-Tags, Sitemap, robots.txt)
- Google Maps Integration
- Custom Logo & Favicon
- Impressum-Seite (`/impressum`)
- Datenschutz-Seite (`/datenschutz`)
- DSGVO Cookie-Banner mit Kategorien
- **Veranstaltungen & Ticketsystem** - Apr 2026:
  - Veranstaltungsseite (`/veranstaltungen`) mit Navbar-Link
  - Event-Detailseite mit Ticket-Buchungsformular
  - Zahlungsmethoden: Abendkasse oder Überweisung
  - Automatische E-Mail mit Überweisungsdaten
  - PDF-Tickets mit QR-Code
  - Homepage-Teaser für nächste Veranstaltung
  - QR-Code Scanner für Einlass (`/tickets/scanner`)
  - Admin: Events CRUD, Zahlungseinstellungen, Ticket-Übersicht
  - Ticket-Scanner-Rolle für Eingangspersonal
- Deployment-Scripts (install.sh, docker-compose.yml, INSTALL.md)

## Backlog
### P1
- Automatische Trainings-Erinnerungen (Cron-Job für 24h vor Training)

### P2
- Instagram API Integration (automatischer Post-Abruf)
- Cloud Storage für Bild-Uploads (Migration von lokal zu Cloud)
- Backend-Refactoring (server.py in Module aufteilen)
