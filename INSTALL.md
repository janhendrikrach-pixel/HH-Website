# Headlock Headquarter - Installationsanleitung

## Voraussetzungen

### Option A: Linux VPS (Ubuntu/Debian)
- Ubuntu 20.04+ oder Debian 11+
- Min. 1 GB RAM, 10 GB Speicherplatz
- Root-Zugang (sudo)
- Domain mit DNS-Eintrag auf deinen Server

### Option B: Docker
- Docker & Docker Compose installiert
- Min. 1 GB RAM, 5 GB Speicherplatz

---

## Option A: Installation auf Linux VPS

### 1. Dateien auf den Server kopieren

```bash
# Gesamtes Projekt auf den Server kopieren
scp -r . root@dein-server:/opt/headlock/
```

### 2. Installations-Script ausführen

```bash
ssh root@dein-server
cd /opt/headlock
chmod +x install.sh
sudo ./install.sh
```

Das Script fragt interaktiv:
- **Domain** (z.B. `wrestling.schule`)
- **Admin-Passwort** (mind. 8 Zeichen)
- **SSL-Zertifikat** (empfohlen: ja)

### 3. Fertig!
- Website: `https://deine-domain.de`
- Admin: `https://deine-domain.de/admin`

---

## Option B: Installation mit Docker

### 1. Dateien auf den Server kopieren

```bash
scp -r . root@dein-server:/opt/headlock/
```

### 2. Konfiguration anpassen

```bash
cd /opt/headlock

# Backend-Umgebung anpassen
nano backend/.env.docker
# ADMIN_PASSWORD ändern!

# Site-URL setzen (für Frontend-Build)
export SITE_URL=https://wrestling.schule
```

### 3. Container starten

```bash
docker compose up -d
```

### 4. Fertig!
- Website: `http://dein-server` (Port 80)
- Admin: `http://dein-server/admin`

Für SSL mit Docker empfehle ich einen vorgeschalteten Reverse Proxy wie Traefik oder Caddy.

---

## Verwaltung

### Service-Befehle (Linux VPS)
```bash
# Backend neustarten
sudo systemctl restart headlock-backend

# Backend-Logs anzeigen
sudo journalctl -u headlock-backend -f

# Nginx neustarten
sudo systemctl restart nginx
```

### Service-Befehle (Docker)
```bash
# Status anzeigen
docker compose ps

# Logs anzeigen
docker compose logs -f backend

# Neustarten
docker compose restart

# Stoppen
docker compose down
```

### Backup
```bash
# Datenbank-Backup
mongodump --db headlock_db --out /backup/$(date +%Y%m%d)

# Uploads sichern
tar -czf uploads-backup.tar.gz /opt/headlock/backend/uploads/

# Datenbank wiederherstellen
mongorestore --db headlock_db /backup/DATUM/headlock_db/
```

---

## Dateistruktur

```
/opt/headlock/
├── backend/
│   ├── server.py          # FastAPI Backend
│   ├── .env               # Konfiguration (anpassen!)
│   ├── requirements.txt   # Python-Abhängigkeiten
│   ├── Dockerfile         # Docker-Build
│   └── uploads/           # Hochgeladene Bilder
│       ├── gallery/
│       ├── instagram/
│       ├── trainers/
│       └── pages/
├── frontend/
│   ├── src/               # React Quellcode
│   ├── build/             # Kompiliertes Frontend
│   ├── .env               # Frontend-Konfiguration
│   ├── Dockerfile         # Docker-Build
│   └── nginx.conf         # Nginx für Docker
├── docker-compose.yml     # Docker Compose
├── install.sh             # VPS Installations-Script
└── INSTALL.md             # Diese Anleitung
```
