# Ocho Hair Lab Website - Deployment Guide

This guide provides step-by-step instructions for deploying the Ocho Hair Lab website on an EC2 t3.micro instance running Ubuntu 24.04.

## 🚀 Deployment Options

There are **two ways** to deploy this application:

### Option 1: Local Build + SCP (Recommended)
**Best for**: Faster deployments, limited EC2 resources, production environments

- ✅ Build the frontend **locally** on your development machine
- ✅ Transfer built files to EC2 using `scp`
- ✅ **No git clone needed on EC2**
- ✅ Lower CPU/memory usage on server
- ✅ Faster deployment process
- ✅ Automated deployment script included

**📖 See:** [DEPLOYMENT_LOCAL_BUILD.md](./DEPLOYMENT_LOCAL_BUILD.md) for complete instructions

### Option 2: Git Clone + Build on Server (This Guide)
**Best for**: Simple setup, learning purposes, when you have adequate server resources

- Build everything directly on the EC2 instance
- Requires git clone on the server
- Uses more server resources during build
- Traditional deployment approach

**This guide below covers Option 2.** For the faster local build approach, see [DEPLOYMENT_LOCAL_BUILD.md](./DEPLOYMENT_LOCAL_BUILD.md).

---

## Overview

The application consists of:
- **Frontend**: React + Vite single-page application
- **Backend**: Node.js Express API server
- **Database**: SQLite database (local file-based)
- **Web Server**: nginx (reverse proxy)

## Prerequisites

- EC2 t3.micro instance running Ubuntu 24.04
- Domain name (optional, but recommended)
- SSH access to the server

## Step 1: Initial Server Setup

### 1.1 Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Install Node.js 20.x (LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:
```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 1.3 Install nginx

```bash
sudo apt install -y nginx
```

### 1.4 Install Git

```bash
sudo apt install -y git
```

### 1.5 Create Application User (Optional but recommended)

```bash
sudo useradd -m -s /bin/bash ocho
sudo usermod -aG sudo ocho
```

## Step 2: Clone and Setup Application

### 2.1 Clone Repository

```bash
# If using the ocho user
sudo su - ocho

# Clone the repository
cd ~
git clone https://github.com/jpe9596/ocho-hair-lab-website.git
cd ocho-hair-lab-website
```

### 2.2 Install Frontend Dependencies

```bash
npm install
```

### 2.3 Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 2.4 Configure Environment Variables

Create the `.env` file in the project root:

```bash
cp .env.example .env
nano .env
```

Update the following values:
```env
# For production, use your server's IP or domain
VITE_API_URL=http://YOUR_SERVER_IP:3001/api

# Twilio credentials (get these from Twilio console)
VITE_TWILIO_ACCOUNT_SID=your_account_sid
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+your_twilio_number
VITE_TWILIO_TEMPLATE_SID=your_template_sid
VITE_SALON_PHONE=+5218116153747
```

### 2.5 Initialize Database

```bash
cd server
npm run init-db
```

This will:
- Create the SQLite database (`ocho-hair-lab.db`)
- Create all required tables
- Seed default services
- Create default admin account (username: `admin`, password: `admin123`)
- Create default stylists

**Important:** Change the default admin password after first login!

## Step 3: Build Frontend

```bash
# From project root
npm run build
```

This creates optimized production files in the `dist` directory.

## Step 4: Setup systemd Service for Backend

Create a systemd service file to run the backend automatically:

```bash
sudo nano /etc/systemd/system/ocho-backend.service
```

Add the following content:

```ini
[Unit]
Description=Ocho Hair Lab Backend API
After=network.target

[Service]
Type=simple
User=ocho
WorkingDirectory=/home/ocho/ocho-hair-lab-website/server
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ocho-backend

# Environment variables
Environment="NODE_ENV=production"
Environment="PORT=3001"

[Install]
WantedBy=multi-user.target
```

### 4.1 Start Backend Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable ocho-backend

# Start the service
sudo systemctl start ocho-backend

# Check status
sudo systemctl status ocho-backend
```

### 4.2 View Backend Logs

```bash
# View real-time logs
sudo journalctl -u ocho-backend -f

# View last 100 lines
sudo journalctl -u ocho-backend -n 100
```

## Step 5: Configure nginx

### 5.1 Create nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/ocho-hair-lab
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Frontend static files
    root /home/ocho/ocho-hair-lab-website/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Frontend routes (SPA fallback)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.2 Enable Site and Restart nginx

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/ocho-hair-lab /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Enable nginx to start on boot
sudo systemctl enable nginx
```

## Step 6: Configure Firewall

```bash
# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (for future SSL setup)
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 7: Setup SSL (Optional but Recommended)

### 7.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts. Certbot will automatically update your nginx configuration.

### 7.3 Auto-renewal

Certbot sets up auto-renewal automatically. Test it with:

```bash
sudo certbot renew --dry-run
```

## Step 8: Verify Deployment

### 8.1 Check Backend Status

```bash
curl http://localhost:3001/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### 8.2 Check Frontend

Open your browser and navigate to:
- `http://YOUR_SERVER_IP` or `http://your-domain.com`

### 8.3 Test Functionality

1. **Homepage**: Should load with all sections visible
2. **Services**: Should display all services
3. **Booking**: Try to book an appointment
4. **Login**: Use the default admin credentials:
   - Username: `admin`
   - Password: `admin123`
5. **Admin Panel**: Should be visible after login

## Step 9: Post-Deployment Tasks

### 9.1 Change Default Passwords

1. Log in as admin
2. Go to Staff Management
3. Change the admin password
4. Change default stylist passwords

### 9.2 Configure Twilio

1. Sign up for Twilio account: https://www.twilio.com/
2. Get WhatsApp sandbox credentials or apply for WhatsApp Business API
3. Update `.env` with your Twilio credentials
4. Rebuild and redeploy:
   ```bash
   cd ~/ocho-hair-lab-website
   npm run build
   sudo systemctl restart nginx
   ```

### 9.3 Setup Regular Backups

Create a backup script:

```bash
nano ~/backup-database.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/home/ocho/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
cp /home/ocho/ocho-hair-lab-website/server/ocho-hair-lab.db \
   $BACKUP_DIR/ocho-hair-lab_$DATE.db

# Keep only last 30 backups
ls -t $BACKUP_DIR/ocho-hair-lab_*.db | tail -n +31 | xargs rm -f

echo "Backup completed: ocho-hair-lab_$DATE.db"
```

Make executable and setup cron:
```bash
chmod +x ~/backup-database.sh

# Add to crontab (runs daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /home/ocho/backup-database.sh >> /home/ocho/backup.log 2>&1
```

## Step 10: Maintenance Commands

### Update Application

```bash
cd ~/ocho-hair-lab-website
git pull origin main
npm install
npm run build
cd server
npm install
sudo systemctl restart ocho-backend
sudo systemctl restart nginx
```

### View Application Logs

```bash
# Backend logs
sudo journalctl -u ocho-backend -f

# nginx access logs
sudo tail -f /var/log/nginx/access.log

# nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Restart Services

```bash
# Restart backend
sudo systemctl restart ocho-backend

# Restart nginx
sudo systemctl restart nginx

# Restart both
sudo systemctl restart ocho-backend nginx
```

### Check Service Status

```bash
# Backend status
sudo systemctl status ocho-backend

# nginx status
sudo systemctl status nginx
```

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
sudo journalctl -u ocho-backend -n 50

# Check if port 3001 is in use
sudo netstat -tulpn | grep 3001

# Check file permissions
ls -la ~/ocho-hair-lab-website/server/
```

### Frontend Not Loading

```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test nginx configuration
sudo nginx -t

# Check if files exist
ls -la ~/ocho-hair-lab-website/dist/
```

### Database Issues

```bash
# Check database file
ls -la ~/ocho-hair-lab-website/server/ocho-hair-lab.db

# Reinitialize database (WARNING: This will delete all data)
cd ~/ocho-hair-lab-website/server
rm ocho-hair-lab.db
npm run init-db
sudo systemctl restart ocho-backend
```

### API Connection Issues

1. Check that backend is running: `sudo systemctl status ocho-backend`
2. Check backend logs: `sudo journalctl -u ocho-backend -n 50`
3. Verify firewall allows port 3001: `sudo ufw status`
4. Test API directly: `curl http://localhost:3001/api/health`
5. Check nginx proxy configuration: `sudo nginx -t`

## Security Best Practices

1. **Change Default Passwords**: Immediately change all default passwords
2. **Use HTTPS**: Set up SSL certificates (see Step 7)
3. **Regular Updates**: Keep system and dependencies updated
4. **Firewall**: Only allow necessary ports (22, 80, 443)
5. **Backups**: Regular automated backups of database
6. **Monitoring**: Set up monitoring for service availability
7. **Rate Limiting**: Consider adding rate limiting to nginx for API endpoints

## Performance Optimization

### For nginx

Add to nginx configuration:
```nginx
# Increase worker connections
worker_connections 2048;

# Enable caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;
```

### For Node.js Backend

Use PM2 instead of systemd for better process management:

```bash
sudo npm install -g pm2

# Start backend with PM2
cd ~/ocho-hair-lab-website/server
pm2 start index.js --name ocho-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor
pm2 monit
```

## Support

For issues or questions:
- Check logs first (backend and nginx)
- Review this guide carefully
- Check GitHub repository for updates
- Contact system administrator

## Summary

Your Ocho Hair Lab website should now be:
- ✅ Running on nginx (frontend)
- ✅ API backend running on port 3001
- ✅ SQLite database initialized with default data
- ✅ Automatic service startup on reboot
- ✅ Ready to accept bookings and manage appointments

Access your website at: `http://YOUR_SERVER_IP` or `https://your-domain.com`
