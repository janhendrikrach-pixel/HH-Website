#!/bin/bash
# =============================================================================
# Headlock Headquarter - Wrestling Schule Website
# Installations-Script für Linux VPS (Ubuntu/Debian)
# =============================================================================
#
# Verwendung:
#   chmod +x install.sh
#   sudo ./install.sh
#
# Voraussetzungen:
#   - Ubuntu 20.04+ oder Debian 11+
#   - Root-Zugang oder sudo-Berechtigung
#   - Min. 1 GB RAM, 10 GB Speicherplatz
#
# Nach der Installation:
#   - Website: http://deine-domain.de
#   - Admin:   http://deine-domain.de/admin
#   - Zugangsdaten ändern in: /opt/headlock/backend/.env
#
# =============================================================================

set -e

# ---------- Farben für Ausgabe ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
GOLD='\033[0;33m'
NC='\033[0m'

print_step() { echo -e "\n${GOLD}[HEADLOCK]${NC} $1"; }
print_ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARNUNG]${NC} $1"; }
print_err()  { echo -e "${RED}[FEHLER]${NC} $1"; }

# ---------- Prüfungen ----------
if [ "$EUID" -ne 0 ]; then
  print_err "Bitte als root ausführen: sudo ./install.sh"
  exit 1
fi

# ---------- Konfiguration ----------
INSTALL_DIR="/opt/headlock"
DOMAIN=""
ADMIN_USER="admin"
ADMIN_PASS=""
MONGO_PORT=27017

echo ""
echo -e "${GOLD}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GOLD}║     HEADLOCK HEADQUARTER - INSTALLATIONS-ASSISTENT      ║${NC}"
echo -e "${GOLD}║         Wrestling Schule Website Setup                   ║${NC}"
echo -e "${GOLD}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Domain abfragen
read -p "Domain oder IP-Adresse (z.B. wrestling.schule): " DOMAIN
if [ -z "$DOMAIN" ]; then
  print_err "Domain ist erforderlich!"
  exit 1
fi

# Admin-Passwort abfragen
while [ -z "$ADMIN_PASS" ]; do
  read -s -p "Admin-Passwort festlegen (mind. 8 Zeichen): " ADMIN_PASS
  echo ""
  if [ ${#ADMIN_PASS} -lt 8 ]; then
    print_warn "Passwort muss mindestens 8 Zeichen haben!"
    ADMIN_PASS=""
  fi
done

# SSL-Zertifikat?
read -p "SSL-Zertifikat mit Let's Encrypt einrichten? (j/n) [j]: " SETUP_SSL
SETUP_SSL=${SETUP_SSL:-j}

echo ""
print_step "Starte Installation..."
echo "  Domain:     $DOMAIN"
echo "  Verzeichnis: $INSTALL_DIR"
echo "  SSL:        $([ "$SETUP_SSL" = "j" ] && echo "Ja" || echo "Nein")"
echo ""
read -p "Fortfahren? (j/n) [j]: " CONFIRM
CONFIRM=${CONFIRM:-j}
if [ "$CONFIRM" != "j" ]; then
  echo "Abgebrochen."
  exit 0
fi

# ============================================================================
# 1. System-Updates & Abhängigkeiten
# ============================================================================
print_step "1/7 - System-Updates & Abhängigkeiten installieren..."

apt-get update -qq
apt-get install -y -qq \
  curl wget git gnupg2 software-properties-common \
  python3 python3-pip python3-venv \
  nginx certbot python3-certbot-nginx \
  build-essential

print_ok "System-Pakete installiert"

# ============================================================================
# 2. Node.js installieren
# ============================================================================
print_step "2/7 - Node.js 20 LTS installieren..."

if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

# Yarn installieren
if ! command -v yarn &> /dev/null; then
  npm install -g yarn
fi

print_ok "Node.js $(node -v) & Yarn $(yarn -v) installiert"

# ============================================================================
# 3. MongoDB installieren
# ============================================================================
print_step "3/7 - MongoDB installieren..."

if ! command -v mongod &> /dev/null; then
  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

  echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | \
    tee /etc/apt/sources.list.d/mongodb-org-7.0.list

  apt-get update -qq
  apt-get install -y -qq mongodb-org
fi

systemctl enable mongod
systemctl start mongod
print_ok "MongoDB installiert und gestartet"

# ============================================================================
# 4. Anwendung einrichten
# ============================================================================
print_step "4/7 - Anwendung einrichten..."

mkdir -p "$INSTALL_DIR"

# Backend einrichten
print_step "  Backend konfigurieren..."
mkdir -p "$INSTALL_DIR/backend/uploads"/{gallery,instagram,trainers,pages}

# Backend .env
cat > "$INSTALL_DIR/backend/.env" << ENVEOF
MONGO_URL=mongodb://localhost:${MONGO_PORT}
DB_NAME=headlock_db
CORS_ORIGINS=https://${DOMAIN},http://${DOMAIN}
ADMIN_USERNAME=${ADMIN_USER}
ADMIN_PASSWORD=${ADMIN_PASS}
ENVEOF

# Python Virtual Environment
cd "$INSTALL_DIR/backend"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip -q

# Requirements kopieren (wird vom Quellverzeichnis übernommen)
if [ -f "$INSTALL_DIR/backend/requirements.txt" ]; then
  pip install -r requirements.txt -q
else
  pip install fastapi uvicorn motor python-multipart aiofiles python-dotenv pydantic -q
fi
deactivate

print_ok "Backend konfiguriert"

# Frontend einrichten
print_step "  Frontend bauen..."
cd "$INSTALL_DIR/frontend"

# Frontend .env
cat > "$INSTALL_DIR/frontend/.env" << ENVEOF
REACT_APP_BACKEND_URL=https://${DOMAIN}
ENVEOF

if [ "$SETUP_SSL" != "j" ]; then
  sed -i "s|https://${DOMAIN}|http://${DOMAIN}|" "$INSTALL_DIR/frontend/.env"
fi

yarn install --frozen-lockfile 2>/dev/null || yarn install
yarn build

print_ok "Frontend gebaut"

# ============================================================================
# 5. Systemd Services erstellen
# ============================================================================
print_step "5/7 - Systemd Services einrichten..."

cat > /etc/systemd/system/headlock-backend.service << SVCEOF
[Unit]
Description=Headlock Headquarter Backend
After=network.target mongod.service
Requires=mongod.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=${INSTALL_DIR}/backend
EnvironmentFile=${INSTALL_DIR}/backend/.env
ExecStart=${INSTALL_DIR}/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SVCEOF

# Berechtigungen setzen
chown -R www-data:www-data "$INSTALL_DIR"

systemctl daemon-reload
systemctl enable headlock-backend
systemctl start headlock-backend
print_ok "Backend-Service gestartet"

# ============================================================================
# 6. Nginx konfigurieren
# ============================================================================
print_step "6/7 - Nginx konfigurieren..."

cat > /etc/nginx/sites-available/headlock << NGINXEOF
server {
    listen 80;
    server_name ${DOMAIN};

    # Frontend (Static Build)
    root ${INSTALL_DIR}/frontend/build;
    index index.html;

    # Uploads
    location /uploads/ {
        alias ${INSTALL_DIR}/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        client_max_body_size 20M;
    }

    # React Router - SPA Fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Sicherheits-Header
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
}
NGINXEOF

ln -sf /etc/nginx/sites-available/headlock /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx
print_ok "Nginx konfiguriert"

# ============================================================================
# 7. SSL-Zertifikat (optional)
# ============================================================================
if [ "$SETUP_SSL" = "j" ]; then
  print_step "7/7 - SSL-Zertifikat einrichten..."
  read -p "E-Mail für Let's Encrypt: " LE_EMAIL
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$LE_EMAIL" --redirect
  print_ok "SSL-Zertifikat eingerichtet"
else
  print_step "7/7 - SSL übersprungen"
fi

# ============================================================================
# Abschluss
# ============================================================================
echo ""
echo -e "${GOLD}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GOLD}║          INSTALLATION ERFOLGREICH!                       ║${NC}"
echo -e "${GOLD}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Website:     ${GREEN}http$([ "$SETUP_SSL" = "j" ] && echo "s")://${DOMAIN}${NC}"
echo -e "  Admin-Panel: ${GREEN}http$([ "$SETUP_SSL" = "j" ] && echo "s")://${DOMAIN}/admin${NC}"
echo -e "  Benutzername: ${YELLOW}${ADMIN_USER}${NC}"
echo -e "  Passwort:    ${YELLOW}(wie eingegeben)${NC}"
echo ""
echo -e "  ${GOLD}Wichtige Dateien:${NC}"
echo -e "  Backend .env:  ${INSTALL_DIR}/backend/.env"
echo -e "  Frontend .env: ${INSTALL_DIR}/frontend/.env"
echo -e "  Nginx Config:  /etc/nginx/sites-available/headlock"
echo -e "  Uploads:       ${INSTALL_DIR}/backend/uploads/"
echo ""
echo -e "  ${GOLD}Service-Befehle:${NC}"
echo -e "  sudo systemctl restart headlock-backend"
echo -e "  sudo systemctl restart nginx"
echo -e "  sudo journalctl -u headlock-backend -f   ${YELLOW}# Logs anzeigen${NC}"
echo ""
