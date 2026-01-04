# Ocho Hair Lab Website - Local Build + SCP Deployment Guide

This guide provides step-by-step instructions for **building the application locally** and deploying it to an EC2 t3.micro instance using `scp` (secure copy). This approach is faster and more efficient than building on the remote server.

## Overview

**Deployment Workflow:**
1. Build the frontend **locally** on your development machine
2. Use `scp` to transfer the `dist/` folder to the remote EC2 instance
3. Set up the backend and database **directly on the EC2 instance** (no git clone needed for production)
4. Configure nginx to serve the transferred files

**Benefits of this approach:**
- ✅ Faster deployment (no need to install build tools on EC2)
- ✅ Reduced EC2 resource usage (t3.micro has limited CPU/memory)
- ✅ Cleaner production environment (only runtime dependencies needed)
- ✅ Build once, deploy many times
- ❌ Requires stable internet connection for SCP transfer

## Prerequisites

### On Your Local Machine
- Node.js 18+ (LTS recommended)
- npm or yarn
- SSH access to your EC2 instance
- Git (to clone the repository locally)

### On EC2 Instance
- EC2 t3.micro instance running Ubuntu 24.04
- SSH access configured
- Domain name (optional, but recommended)

## Part 1: Local Build Process

### 1.1 Clone Repository Locally

On your **local development machine**:

```bash
# Clone the repository
git clone https://github.com/jpe9596/ocho-hair-lab-website.git
cd ocho-hair-lab-website
```

### 1.2 Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies (needed for backend deployment)
cd server
npm install
cd ..
```

### 1.3 Configure Environment Variables

Create the `.env` file with your production settings:

```bash
cp .env.example .env
nano .env
```

Update with your production values:
```env
# Use your EC2 instance IP or domain name
VITE_API_URL=http://YOUR_SERVER_IP:3001/api
# Or if using domain with nginx proxy:
# VITE_API_URL=http://your-domain.com/api

# Twilio credentials (get these from Twilio console)
VITE_TWILIO_ACCOUNT_SID=your_account_sid
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+your_twilio_number
VITE_TWILIO_TEMPLATE_SID=your_template_sid
VITE_SALON_PHONE=+5218116153747
```

### 1.4 Build the Frontend

```bash
# Build for production (from project root)
npm run build
```

This creates the optimized production files in the `dist/` directory.

**Verify the build:**
```bash
ls -lh dist/
# You should see: index.html, assets/, and other static files
```

## Part 2: EC2 Instance Setup

### 2.1 Initial Server Setup

SSH into your EC2 instance:

```bash
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP
```

Update the system:
```bash
sudo apt update
sudo apt upgrade -y
```

### 2.2 Install Node.js 20.x (LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:
```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 2.3 Install nginx

```bash
sudo apt install -y nginx
```

### 2.4 Create Application Directory Structure

```bash
# Create application user (recommended)
sudo useradd -m -s /bin/bash ocho

# Create directories for application
sudo mkdir -p /home/ocho/ocho-hair-lab-website/dist
sudo mkdir -p /home/ocho/ocho-hair-lab-website/server
sudo chown -R ocho:ocho /home/ocho/ocho-hair-lab-website
```

## Part 3: Transfer Files to EC2

### 3.1 Transfer Built Frontend

From your **local machine** (in the project directory):

```bash
# Transfer the dist/ folder
scp -i your-key.pem -r dist/ ubuntu@YOUR_SERVER_IP:/tmp/

# SSH into the server and move files
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# On the server, move dist to the correct location
sudo mv /tmp/dist/* /home/ocho/ocho-hair-lab-website/dist/
sudo chown -R ocho:ocho /home/ocho/ocho-hair-lab-website/dist
exit
```

**Alternative single command:**
```bash
# Direct transfer to final location (if you have sudo access configured)
scp -i your-key.pem -r dist/* ubuntu@YOUR_SERVER_IP:~/temp-dist/
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP "sudo mv ~/temp-dist/* /home/ocho/ocho-hair-lab-website/dist/ && sudo chown -R ocho:ocho /home/ocho/ocho-hair-lab-website/dist"
```

### 3.2 Transfer Backend Files

From your **local machine**:

```bash
# Transfer server directory
scp -i your-key.pem -r server/* ubuntu@YOUR_SERVER_IP:/tmp/server-files/

# SSH and move files
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# On the server
sudo mv /tmp/server-files/* /home/ocho/ocho-hair-lab-website/server/
sudo chown -R ocho:ocho /home/ocho/ocho-hair-lab-website/server

# Install backend dependencies on the server
cd /home/ocho/ocho-hair-lab-website/server
sudo -u ocho npm install --production

exit
```

### 3.3 Create Environment File on Server

SSH into your server and create the server environment file:

```bash
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP
sudo nano /home/ocho/ocho-hair-lab-website/server/.env
```

Add backend environment variables (if needed by your backend):
```env
NODE_ENV=production
PORT=3001
```

## Part 4: Initialize Database

```bash
# SSH into the server
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# Initialize the database
cd /home/ocho/ocho-hair-lab-website/server
sudo -u ocho npm run init-db
```

This will:
- Create the SQLite database (`ocho-hair-lab.db`)
- Create all required tables
- Seed default services
- Create default admin account (username: `admin`, password: `admin123`)
- Create default stylists

**Important:** Change the default admin password after first login!

## Part 5: Setup systemd Service for Backend

Create a systemd service file:

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

### 5.1 Start Backend Service

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

### 5.2 View Backend Logs

```bash
# View real-time logs
sudo journalctl -u ocho-backend -f

# View last 100 lines
sudo journalctl -u ocho-backend -n 100
```

## Part 6: Configure nginx

### 6.1 Create nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/ocho-hair-lab
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Frontend static files (served from transferred dist/)
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

### 6.2 Enable Site and Restart nginx

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

## Part 7: Configure Firewall

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

## Part 8: Verify Deployment

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

## Part 9: Updating Your Application

When you need to update the frontend (after making code changes):

### 9.1 Rebuild Locally

On your **local machine**:

```bash
cd ocho-hair-lab-website

# Pull latest changes (if using git)
git pull origin main

# Install any new dependencies
npm install

# Update .env if needed for production
nano .env

# Build
npm run build
```

### 9.2 Transfer Updated Files

```bash
# Transfer the new dist/ folder
scp -i your-key.pem -r dist/* ubuntu@YOUR_SERVER_IP:~/temp-dist/

# SSH and replace files
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP "sudo rm -rf /home/ocho/ocho-hair-lab-website/dist/* && sudo mv ~/temp-dist/* /home/ocho/ocho-hair-lab-website/dist/ && sudo chown -R ocho:ocho /home/ocho/ocho-hair-lab-website/dist"

# Restart nginx (usually not needed, but just in case)
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP "sudo systemctl restart nginx"
```

### 9.3 Update Backend (if needed)

If you've made backend changes:

```bash
# Transfer server files
scp -i your-key.pem -r server/* ubuntu@YOUR_SERVER_IP:~/temp-server/

# SSH and update
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# Backup database first!
sudo cp /home/ocho/ocho-hair-lab-website/server/ocho-hair-lab.db /home/ocho/backups/ocho-hair-lab_backup_$(date +%Y%m%d).db

# Update server files (be careful not to overwrite the database!)
sudo cp -n ~/temp-server/*.js /home/ocho/ocho-hair-lab-website/server/
sudo cp -n ~/temp-server/package*.json /home/ocho/ocho-hair-lab-website/server/

# Install any new dependencies
cd /home/ocho/ocho-hair-lab-website/server
sudo -u ocho npm install --production

# Restart backend
sudo systemctl restart ocho-backend

# Check status
sudo systemctl status ocho-backend
```

## Part 10: Quick Deployment Script

For convenience, create a deployment script on your **local machine**:

```bash
nano deploy-dist.sh
```

Add this content:
```bash
#!/bin/bash

# Configuration
SERVER_IP="YOUR_SERVER_IP"
SSH_KEY="your-key.pem"
SSH_USER="ubuntu"

echo "🔨 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "📦 Transferring dist/ to EC2..."
scp -i "$SSH_KEY" -r dist/* "$SSH_USER@$SERVER_IP":~/temp-dist/

if [ $? -ne 0 ]; then
    echo "❌ Transfer failed!"
    exit 1
fi

echo "🚀 Deploying on server..."
ssh -i "$SSH_KEY" "$SSH_USER@$SERVER_IP" << 'EOF'
    sudo rm -rf /home/ocho/ocho-hair-lab-website/dist/*
    sudo mv ~/temp-dist/* /home/ocho/ocho-hair-lab-website/dist/
    sudo chown -R ocho:ocho /home/ocho/ocho-hair-lab-website/dist
    sudo systemctl restart nginx
EOF

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo "✅ Deployment successful!"
echo "🌐 Visit: http://$SERVER_IP"
```

Make it executable:
```bash
chmod +x deploy-dist.sh
```

Use it:
```bash
./deploy-dist.sh
```

## Comparison with Git Clone Approach

### Do you need to git clone on EC2?

**Answer: No!** With this approach, you do **NOT** need to git clone the repository on the EC2 instance.

**Why?**
- You're transferring the **built artifacts** (dist/), not source code
- The dist/ folder contains everything needed to serve the frontend
- Backend files are also transferred directly

**What changes from the original DEPLOYMENT.md guide:**

| Step | Original (Git Clone) | New (Local Build + SCP) |
|------|---------------------|------------------------|
| **Clone repo** | ✅ Required on EC2 | ❌ Not needed on EC2 |
| **Install git** | ✅ Required on EC2 | ❌ Not needed on EC2 |
| **Install build tools** | ✅ Required (for npm run build) | ❌ Not needed on EC2 |
| **Frontend dependencies** | ✅ Install on EC2 (large download) | ❌ Not needed on EC2 |
| **npm run build** | ✅ Run on EC2 (CPU intensive) | ✅ Run locally before deploy |
| **Backend dependencies** | ✅ Install on EC2 (--production flag) | ✅ Still needed on EC2 |
| **Transfer files** | ❌ Not applicable | ✅ Use scp |
| **Database init** | ✅ Same | ✅ Same |
| **nginx config** | ✅ Same | ✅ Same |
| **systemd service** | ✅ Same | ✅ Same |

## Setup SSL (Optional but Recommended)

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts. Certbot will automatically update your nginx configuration.

### Auto-renewal

Certbot sets up auto-renewal automatically. Test it with:

```bash
sudo certbot renew --dry-run
```

## Post-Deployment Tasks

### Change Default Passwords

1. Log in as admin
2. Go to Staff Management
3. Change the admin password
4. Change default stylist passwords

### Setup Regular Backups

Create a backup script:

```bash
sudo nano /home/ocho/backup-database.sh
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
sudo chmod +x /home/ocho/backup-database.sh

# Add to crontab (runs daily at 2 AM)
sudo crontab -e

# Add this line:
0 2 * * * /home/ocho/backup-database.sh >> /home/ocho/backup.log 2>&1
```

## Troubleshooting

### 🚨 500 Internal Server Error?

If you're experiencing a 500 Internal Server Error, see the comprehensive troubleshooting guide:

📖 **[TROUBLESHOOTING_500_ERROR.md](./TROUBLESHOOTING_500_ERROR.md)** - Complete step-by-step troubleshooting for 500 errors

This guide covers:
- ✅ Quick diagnosis checklist
- ✅ 12-step detailed troubleshooting process
- ✅ Common scenarios and solutions
- ✅ Log analysis patterns
- ✅ Quick recovery commands
- ✅ End-to-end verification tests

### Quick Troubleshooting Tips

#### Build Fails Locally

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### SCP Transfer Fails

```bash
# Check SSH connection
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# Verify key permissions
chmod 400 your-key.pem

# Try with verbose output
scp -v -i your-key.pem -r dist/* ubuntu@YOUR_SERVER_IP:~/temp-dist/
```

#### Frontend Not Loading

```bash
# SSH into server
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# Check if files exist
ls -la /home/ocho/ocho-hair-lab-website/dist/

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify nginx configuration
sudo nginx -t
```

#### Backend Won't Start

```bash
# Check logs
sudo journalctl -u ocho-backend -n 50

# Check if port 3001 is in use
sudo netstat -tulpn | grep 3001

# Verify files exist
ls -la /home/ocho/ocho-hair-lab-website/server/
```

## Security Best Practices

1. **Change Default Passwords**: Immediately change all default passwords
2. **Use HTTPS**: Set up SSL certificates
3. **Regular Updates**: Keep system and dependencies updated
4. **Firewall**: Only allow necessary ports (22, 80, 443)
5. **Backups**: Regular automated backups of database
6. **SSH Keys**: Use SSH keys, disable password authentication
7. **Rate Limiting**: Consider adding rate limiting to nginx

## Summary

With this local build + SCP approach:

✅ **Faster deployment** - No building on the constrained EC2 instance
✅ **Cleaner server** - Only runtime dependencies, no build tools needed
✅ **No git clone needed** - Transfer built artifacts directly
✅ **Same backend setup** - Backend dependencies still installed on EC2
✅ **Easy updates** - Just rebuild locally and scp the new dist/

Your Ocho Hair Lab website should now be:
- ✅ Built locally on your development machine
- ✅ Transferred to EC2 via SCP
- ✅ Running on nginx (frontend)
- ✅ API backend running on port 3001
- ✅ SQLite database initialized with default data
- ✅ Automatic service startup on reboot
- ✅ Ready to accept bookings and manage appointments

Access your website at: `http://YOUR_SERVER_IP` or `https://your-domain.com`
