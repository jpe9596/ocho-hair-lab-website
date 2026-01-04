# Quick Reference: Troubleshooting 500 Error

This is a **quick reference** for troubleshooting 500 Internal Server Error. For detailed step-by-step instructions, see **[TROUBLESHOOTING_500_ERROR.md](./TROUBLESHOOTING_500_ERROR.md)**.

## Most Common Causes (90% of Issues)

### 1. Backend Service Not Running
```bash
# Check status
sudo systemctl status ocho-backend

# If not running, check logs
sudo journalctl -u ocho-backend -n 50

# Restart
sudo systemctl restart ocho-backend
```

### 2. Database Missing or Corrupted
```bash
# Initialize database
cd /home/ocho/ocho-hair-lab-website/server
sudo -u ocho npm run init-db
sudo systemctl restart ocho-backend
```

### 3. Missing Dependencies
```bash
# Install backend dependencies
cd /home/ocho/ocho-hair-lab-website/server
sudo -u ocho npm install --production
sudo systemctl restart ocho-backend
```

### 4. Wrong API URL in Frontend Build
```bash
# On your LOCAL machine:
# 1. Edit .env file
nano .env
# Update: VITE_API_URL=http://YOUR_SERVER_IP:3001/api
# OR: VITE_API_URL=http://your-domain.com/api (if using nginx)

# 2. Rebuild
npm run build

# 3. Redeploy
./deploy-dist.sh
```

### 5. nginx Configuration Issue
```bash
# Test nginx config
sudo nginx -t

# Check nginx logs
sudo tail -50 /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

## Quick Diagnosis Commands

Run these commands on your server to quickly diagnose issues:

```bash
# Quick health check
echo "=== Backend Service ===" && sudo systemctl is-active ocho-backend
echo "=== nginx Service ===" && sudo systemctl is-active nginx
echo "=== Backend API ===" && curl -s http://localhost:3001/api/health
echo "=== Backend via nginx ===" && curl -s http://localhost/api/health
echo "=== Frontend ===" && curl -s http://localhost/ | head -5
```

## When to Use Each Guide

| Situation | Use This Guide |
|-----------|---------------|
| Getting 500 error | **[TROUBLESHOOTING_500_ERROR.md](./TROUBLESHOOTING_500_ERROR.md)** |
| First time deployment | **[DEPLOYMENT_LOCAL_BUILD.md](./DEPLOYMENT_LOCAL_BUILD.md)** |
| Local development | **[README.md](./README.md#quick-start)** |
| Database questions | **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** |
| WhatsApp setup | **[TWILIO_SETUP.md](./TWILIO_SETUP.md)** |

## Emergency Recovery

If everything is broken and you need to quickly reset:

```bash
# SSH into server
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# Stop services
sudo systemctl stop ocho-backend nginx

# Reinstall dependencies
cd /home/ocho/ocho-hair-lab-website/server
sudo -u ocho npm install --production

# Reset database (WARNING: Deletes all data!)
sudo -u ocho npm run init-db

# Fix permissions
sudo chown -R ocho:ocho /home/ocho/ocho-hair-lab-website

# Restart services
sudo systemctl start ocho-backend nginx

# Verify
sudo systemctl status ocho-backend
sudo systemctl status nginx
curl http://localhost:3001/api/health
```

## Getting More Help

1. **Detailed troubleshooting**: See **[TROUBLESHOOTING_500_ERROR.md](./TROUBLESHOOTING_500_ERROR.md)**
2. **Collect diagnostic info** and share when requesting help:
   ```bash
   # Run diagnostic collection script
   sudo journalctl -u ocho-backend -n 50 > backend-logs.txt
   sudo tail -50 /var/log/nginx/error.log > nginx-logs.txt
   sudo systemctl status ocho-backend > backend-status.txt
   sudo systemctl status nginx > nginx-status.txt
   ```

## Repository Structure (After Cleanup)

```
Essential Documentation:
├── README.md                        # Start here - project overview
├── DEPLOYMENT_LOCAL_BUILD.md        # ⭐ Recommended deployment guide
├── TROUBLESHOOTING_500_ERROR.md     # Comprehensive troubleshooting
├── DATABASE_SETUP.md                # Database schema and API docs
├── TWILIO_SETUP.md                  # WhatsApp configuration
├── DEFAULT_CREDENTIALS.md           # Default login credentials
├── DEPLOYMENT.md                    # Alternative deployment method
├── SECURITY.md                      # Security policies
└── CLEANUP_NOTES.md                 # What was removed and why

Scripts:
├── deploy-dist.sh                   # Automated deployment
└── setup.sh                         # Local setup
```

21 redundant test and documentation files have been removed. See [CLEANUP_NOTES.md](./CLEANUP_NOTES.md) for details.
