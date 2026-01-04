# Troubleshooting 500 Internal Server Error - Ocho Hair Lab

This guide provides comprehensive troubleshooting steps for resolving 500 Internal Server Error issues when deploying the Ocho Hair Lab website following the [DEPLOYMENT_LOCAL_BUILD.md](./DEPLOYMENT_LOCAL_BUILD.md) guide.

> 🚀 **Need a quick fix?** See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for common solutions and quick diagnostic commands.

## 📋 Quick Diagnosis Checklist

Before diving into detailed troubleshooting, check these common issues:

- [ ] Backend service is running
- [ ] Database file exists and has proper permissions
- [ ] nginx is configured correctly
- [ ] API endpoint URLs are correct in frontend build
- [ ] Port 3001 is available and not blocked
- [ ] File permissions are correct for the `ocho` user

## 🔍 Step-by-Step Troubleshooting

### Step 1: Verify Backend Service Status

The most common cause of 500 errors is that the backend API server is not running.

```bash
# SSH into your server
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# Check backend service status
sudo systemctl status ocho-backend
```

**Expected Output**: Service should show `active (running)`

**If service is not running or failed:**

```bash
# View the last 50 lines of logs
sudo journalctl -u ocho-backend -n 50

# Look for specific error messages
sudo journalctl -u ocho-backend -n 100 --no-pager | grep -i error
```

**Common Issues and Solutions:**

1. **"Cannot find module" or "MODULE_NOT_FOUND"**
   ```bash
   cd /home/ocho/ocho-hair-lab-website/server
   sudo -u ocho npm install --production
   sudo systemctl restart ocho-backend
   ```

2. **"EADDRINUSE: address already in use"**
   ```bash
   # Find process using port 3001
   sudo netstat -tulpn | grep 3001
   
   # Kill the process (use the PID from above)
   sudo kill -9 <PID>
   
   # Restart service
   sudo systemctl restart ocho-backend
   ```

3. **"Permission denied" on database file**
   ```bash
   sudo chown ocho:ocho /home/ocho/ocho-hair-lab-website/server/*.db
   sudo chmod 644 /home/ocho/ocho-hair-lab-website/server/*.db
   sudo systemctl restart ocho-backend
   ```

4. **Database file doesn't exist**
   ```bash
   cd /home/ocho/ocho-hair-lab-website/server
   sudo -u ocho npm run init-db
   sudo systemctl restart ocho-backend
   ```

### Step 2: Test Backend API Directly

Once the backend service is running, test it directly:

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-01-04T..."}
```

**If curl fails or returns an error:**

1. **Connection refused**
   - Backend is not running (go back to Step 1)
   - Wrong port number

2. **404 Not Found**
   - Check the path - should be `/api/health` not `/health`
   - Backend may have crashed immediately after startup

3. **500 Internal Server Error from API**
   ```bash
   # Watch logs in real-time while testing
   sudo journalctl -u ocho-backend -f
   
   # In another terminal, test the API
   curl http://localhost:3001/api/health
   ```

### Step 3: Check nginx Configuration

nginx must be properly configured to proxy requests to the backend.

```bash
# Test nginx configuration
sudo nginx -t

# Expected output: "syntax is okay" and "test is successful"
```

**If nginx test fails:**

```bash
# View nginx error log
sudo tail -50 /var/log/nginx/error.log

# Check your site configuration
sudo cat /etc/nginx/sites-available/ocho-hair-lab

# Verify the configuration matches DEPLOYMENT_LOCAL_BUILD.md
```

**Common nginx Issues:**

1. **"could not bind to 0.0.0.0:80"**
   ```bash
   # Check what's using port 80
   sudo netstat -tulpn | grep :80
   
   # If Apache is running, stop it
   sudo systemctl stop apache2
   sudo systemctl disable apache2
   ```

2. **nginx is running but returns 502 Bad Gateway**
   - This means nginx can't reach the backend
   - Backend service is not running (go to Step 1)
   - Backend is running on wrong port

3. **nginx returns 404 for frontend files**
   ```bash
   # Check if dist files exist
   ls -la /home/ocho/ocho-hair-lab-website/dist/
   
   # Should see: index.html, assets/ directory
   
   # Check permissions
   sudo chown -R ocho:ocho /home/ocho/ocho-hair-lab-website/dist
   ```

### Step 4: Verify Frontend Build Configuration

The frontend must be built with the correct API URL.

```bash
# On your LOCAL machine (not the server)
cd ocho-hair-lab-website

# Check your .env file
cat .env

# Should show:
# VITE_API_URL=http://YOUR_SERVER_IP:3001/api
# OR
# VITE_API_URL=http://your-domain.com/api (if using nginx proxy)
```

**If API URL is wrong:**

```bash
# On your LOCAL machine
nano .env

# Update VITE_API_URL to match your server
# For nginx proxy setup: http://your-domain.com/api
# For direct access: http://YOUR_SERVER_IP:3001/api

# Rebuild and redeploy
npm run build
./deploy-dist.sh
```

### Step 5: Check Browser Developer Console

Open your browser's developer console (F12) when accessing the website.

**Look for these error patterns:**

1. **Failed to fetch / Network Error**
   - Frontend can't reach backend API
   - Check `VITE_API_URL` in your build
   - Check CORS configuration
   - Check firewall rules

2. **404 on /api/* requests**
   - nginx proxy configuration is incorrect
   - Check the `location /api` block in nginx config

3. **502 Bad Gateway on /api/* requests**
   - Backend is not running
   - Backend crashed after startup

4. **Mixed Content warnings (https → http)**
   - Using HTTPS but API URL is HTTP
   - Update `.env` to use HTTPS for API URL

### Step 6: Verify File Permissions

Incorrect file permissions can cause 500 errors.

```bash
# SSH into server
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# Check and fix permissions
sudo chown -R ocho:ocho /home/ocho/ocho-hair-lab-website
sudo chmod -R 755 /home/ocho/ocho-hair-lab-website
sudo chmod 644 /home/ocho/ocho-hair-lab-website/server/*.db

# Restart services
sudo systemctl restart ocho-backend
sudo systemctl restart nginx
```

### Step 7: Check Firewall Rules

If you're testing from outside the server, firewall rules might block access.

```bash
# Check firewall status
sudo ufw status

# Ensure these ports are allowed:
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS (if using SSL)

# Check if port 3001 needs to be open (usually NO if using nginx proxy)
# Only open 3001 if you want direct backend access from outside
# sudo ufw allow 3001/tcp  # Usually NOT needed
```

### Step 8: Check EC2 Security Group

If running on AWS EC2, security groups must allow inbound traffic.

**AWS Console → EC2 → Security Groups → Your Instance's Security Group:**

Ensure these inbound rules exist:
- **SSH**: Port 22, Source: Your IP
- **HTTP**: Port 80, Source: 0.0.0.0/0 (or specific IPs)
- **HTTPS**: Port 443, Source: 0.0.0.0/0 (if using SSL)

**Note**: Port 3001 should NOT be open to the internet (security risk). Use nginx proxy instead.

### Step 9: Verify Database Integrity

Database corruption or missing tables can cause 500 errors.

```bash
# SSH into server
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# Check database file exists
ls -lh /home/ocho/ocho-hair-lab-website/server/ocho-hair-lab.db

# Test database (install sqlite3 if needed)
sudo apt install -y sqlite3

# Connect to database
sqlite3 /home/ocho/ocho-hair-lab-website/server/ocho-hair-lab.db

# Check tables exist
.tables

# Expected output: 
# appointments  customer_accounts  salon_services  sms_logs  staff_members  staff_schedules

# Exit sqlite3
.quit
```

**If tables are missing or corrupted:**

```bash
# Backup the current database (just in case)
sudo cp /home/ocho/ocho-hair-lab-website/server/ocho-hair-lab.db \
        /home/ocho/ocho-hair-lab.db.backup

# Reinitialize database
cd /home/ocho/ocho-hair-lab-website/server
sudo -u ocho npm run init-db

# Restart backend
sudo systemctl restart ocho-backend
```

### Step 10: Check for Port Conflicts

```bash
# Check what's listening on port 3001
sudo netstat -tulpn | grep 3001

# Check what's listening on port 80
sudo netstat -tulpn | grep :80

# If another service is using these ports, stop it or change the port
```

### Step 11: Review Complete Logs

Get a full picture of what's happening:

```bash
# Backend logs (last 100 lines)
sudo journalctl -u ocho-backend -n 100 --no-pager

# nginx error log
sudo tail -100 /var/log/nginx/error.log

# nginx access log (to see if requests are reaching nginx)
sudo tail -100 /var/log/nginx/access.log

# System log for any other issues
sudo tail -100 /var/log/syslog | grep -i error
```

### Step 12: Test End-to-End Flow

Create a simple test to verify the entire stack:

```bash
# SSH into server
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# Test 1: Backend health check (direct)
echo "Test 1: Backend health..."
curl -s http://localhost:3001/api/health && echo " ✅ Backend OK" || echo " ❌ Backend FAILED"

# Test 2: Backend via nginx proxy
echo "Test 2: Backend via nginx..."
curl -s http://localhost/api/health && echo " ✅ nginx proxy OK" || echo " ❌ nginx proxy FAILED"

# Test 3: Frontend
echo "Test 3: Frontend..."
curl -s http://localhost/ | grep -q "Ocho Hair Lab" && echo " ✅ Frontend OK" || echo " ❌ Frontend FAILED"

# Test 4: nginx status
echo "Test 4: nginx status..."
sudo systemctl is-active nginx && echo " ✅ nginx running" || echo " ❌ nginx not running"

# Test 5: Backend status
echo "Test 5: Backend status..."
sudo systemctl is-active ocho-backend && echo " ✅ Backend running" || echo " ❌ Backend not running"
```

## 🛠️ Common Scenarios and Solutions

### Scenario 1: "Everything was working, now it's not"

**Likely causes:**
1. Server rebooted and services didn't auto-start
2. Disk space full
3. Database file became corrupted

**Solution:**
```bash
# Check disk space
df -h

# Enable services to start on boot
sudo systemctl enable ocho-backend
sudo systemctl enable nginx

# Start services
sudo systemctl start ocho-backend
sudo systemctl start nginx
```

### Scenario 2: "502 Bad Gateway" after following deployment guide

**Cause:** Backend service failed to start or is not running.

**Solution:**
```bash
# Check backend logs
sudo journalctl -u ocho-backend -n 50

# Usually one of these fixes it:
cd /home/ocho/ocho-hair-lab-website/server
sudo -u ocho npm install --production
sudo systemctl restart ocho-backend
```

### Scenario 3: "Frontend loads but API calls fail"

**Cause:** CORS issues or wrong API URL in frontend build.

**Solution:**
```bash
# On your LOCAL machine:
# 1. Check .env file has correct VITE_API_URL
cat .env

# 2. Rebuild with correct settings
nano .env  # Update VITE_API_URL
npm run build

# 3. Redeploy
./deploy-dist.sh
```

### Scenario 4: "API calls work from server but not from browser"

**Cause:** Firewall or security group blocking traffic.

**Solution:**
- Check EC2 Security Group allows port 80 (HTTP) and 443 (HTTPS)
- Check `sudo ufw status` on server
- Verify you're accessing via correct URL (not localhost from browser)

### Scenario 5: "Can't connect via SSH to deploy"

**Cause:** Security group or SSH key issues.

**Solution:**
```bash
# Check SSH key permissions (on your local machine)
chmod 400 your-key.pem

# Test SSH connection
ssh -v -i your-key.pem ubuntu@YOUR_SERVER_IP

# Check EC2 Security Group allows your IP on port 22
```

## 🔍 Detailed Log Analysis

### Backend Log Patterns to Look For

```bash
sudo journalctl -u ocho-backend -n 100 --no-pager
```

**Healthy startup:**
```
🚀 Ocho Hair Lab API server running on http://localhost:3001
📦 Database: /home/ocho/ocho-hair-lab-website/server/ocho-hair-lab.db
```

**Error patterns:**

1. **"Cannot find module 'express'"**
   - Missing dependencies
   - Run: `sudo -u ocho npm install --production`

2. **"SQLITE_CANTOPEN: unable to open database file"**
   - Database doesn't exist: run `npm run init-db`
   - Permission issue: check file ownership

3. **"EADDRINUSE"**
   - Port already in use
   - Find and kill the conflicting process

4. **"Error: ENOENT: no such file or directory"**
   - Files not transferred correctly
   - Re-deploy using `./deploy-dist.sh` (for frontend)
   - Re-transfer server files (for backend)

### nginx Log Patterns

```bash
sudo tail -50 /var/log/nginx/error.log
```

**Healthy pattern:**
- No errors or only occasional client disconnections

**Error patterns:**

1. **"connect() failed (111: Connection refused) while connecting to upstream"**
   - Backend is not running
   - Fix: `sudo systemctl restart ocho-backend`

2. **"could not be resolved" or "no live upstreams"**
   - nginx can't find backend server
   - Check backend is running on port 3001

3. **"permission denied"**
   - nginx can't read frontend files
   - Fix: `sudo chown -R ocho:ocho /home/ocho/ocho-hair-lab-website/dist`

## 🚀 Quick Recovery Commands

If you need to quickly reset everything:

```bash
# On the server
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# Stop all services
sudo systemctl stop ocho-backend
sudo systemctl stop nginx

# Reinstall backend dependencies
cd /home/ocho/ocho-hair-lab-website/server
sudo -u ocho npm install --production

# Reset database (WARNING: This deletes all data!)
sudo -u ocho npm run init-db

# Fix permissions
sudo chown -R ocho:ocho /home/ocho/ocho-hair-lab-website

# Restart services
sudo systemctl start ocho-backend
sudo systemctl start nginx

# Check status
sudo systemctl status ocho-backend
sudo systemctl status nginx
```

## 📞 Getting Help

If you've tried all these steps and still have issues:

1. **Collect diagnostic information:**
   ```bash
   # Create a diagnostic report
   cat > /tmp/diagnostic.txt << 'EOF'
   === SYSTEM INFO ===
   $(uname -a)
   
   === BACKEND STATUS ===
   $(sudo systemctl status ocho-backend)
   
   === NGINX STATUS ===
   $(sudo systemctl status nginx)
   
   === BACKEND LOGS ===
   $(sudo journalctl -u ocho-backend -n 50)
   
   === NGINX ERROR LOG ===
   $(sudo tail -50 /var/log/nginx/error.log)
   
   === FILE PERMISSIONS ===
   $(ls -la /home/ocho/ocho-hair-lab-website/)
   $(ls -la /home/ocho/ocho-hair-lab-website/server/)
   $(ls -la /home/ocho/ocho-hair-lab-website/dist/)
   
   === PORT USAGE ===
   $(sudo netstat -tulpn | grep -E ':80|:3001')
   
   === DISK SPACE ===
   $(df -h)
   EOF
   
   cat /tmp/diagnostic.txt
   ```

2. **Share this diagnostic info** when requesting help

3. **Describe what you've tried** from this guide

## ✅ Verification Checklist

After fixing issues, verify everything works:

- [ ] Backend service is active: `sudo systemctl status ocho-backend`
- [ ] Backend health endpoint works: `curl http://localhost:3001/api/health`
- [ ] nginx is active: `sudo systemctl status nginx`
- [ ] Frontend loads in browser: `http://YOUR_SERVER_IP`
- [ ] Can navigate to different pages without 404 errors
- [ ] Can see services list on homepage
- [ ] Browser console shows no errors (F12 → Console tab)
- [ ] API calls work (check Network tab in browser dev tools)
- [ ] Can access login page
- [ ] Can submit a form (try booking)

## 🔗 Related Documentation

- [DEPLOYMENT_LOCAL_BUILD.md](./DEPLOYMENT_LOCAL_BUILD.md) - Full deployment guide
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database schema and management
- [README.md](./README.md) - Project overview and quick start

---

**Last Updated:** 2026-01-04

**Note:** This troubleshooting guide is specifically for deployments following the DEPLOYMENT_LOCAL_BUILD.md approach. If you used a different deployment method, some steps may differ.
