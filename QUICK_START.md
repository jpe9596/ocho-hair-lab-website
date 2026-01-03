# Quick Start Guide - From Clone to Running Website

This guide will get your Ocho Hair Lab website up and running in under 5 minutes.

## Prerequisites

- Ubuntu 24.04 (or any Linux distribution)
- Node.js 18 or higher
- Git

## Option 1: Automated Setup (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/jpe9596/ocho-hair-lab-website.git
cd ocho-hair-lab-website

# 2. Run the setup script
./setup.sh

# 3. Start the backend (Terminal 1)
cd server
npm start

# 4. Start the frontend (Terminal 2 - open new terminal)
npm run dev
```

That's it! Your website is now running at `http://localhost:5173`

## Option 2: Manual Setup

```bash
# 1. Clone the repository
git clone https://github.com/jpe9596/ocho-hair-lab-website.git
cd ocho-hair-lab-website

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd server
npm install

# 4. Initialize database
npm run init-db
cd ..

# 5. Configure environment (optional for now)
cp .env.example .env

# 6. Start backend (Terminal 1)
cd server
npm start

# 7. Start frontend (Terminal 2)
npm run dev
```

## Verify Installation

Once both servers are running, you should see:

**Terminal 1 (Backend):**
```
🚀 Ocho Hair Lab API server running on http://localhost:3001
📦 Database: /path/to/ocho-hair-lab.db
```

**Terminal 2 (Frontend):**
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Access the Website

1. Open your browser to `http://localhost:5173`
2. You should see the Ocho Hair Lab homepage

## Login as Admin

1. Click on the admin/login area
2. Use these credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

3. **IMPORTANT**: Change this password immediately!

## Test Booking an Appointment

1. Click "Book Appointment"
2. Select a service (e.g., "Corte & Secado")
3. Choose a stylist (e.g., "Maria Paula")
4. Pick a date and time
5. Fill in customer details:
   - Name: Test Customer
   - Email: test@example.com
   - Phone: 8124028082
6. Submit

The appointment should be created and visible in the admin panel.

## What You Get Out of the Box

✅ **14 Pre-loaded Services** across 4 categories:
- Tinte (Color Services)
- Corte & Styling
- Bespoke Color
- Treatments

✅ **3 User Accounts**:
- Admin (Owner) - full access
- Maria Paula (Colorist) - stylist
- Sofia (Stylist) - stylist

✅ **Complete Database** with all tables and indexes

✅ **Working API** with all CRUD endpoints

✅ **WhatsApp Integration** ready (needs Twilio credentials)

## Next Steps

### For Development

You're all set! The application is running in development mode with hot-reload enabled.

### For Twilio WhatsApp Setup

1. Sign up at https://www.twilio.com/
2. Get your WhatsApp sandbox credentials
3. Edit `.env` file:
   ```env
   VITE_TWILIO_ACCOUNT_SID=your_account_sid
   VITE_TWILIO_AUTH_TOKEN=your_auth_token
   VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   VITE_TWILIO_TEMPLATE_SID=your_template_sid
   ```
4. Restart the frontend: `npm run dev`

See `TWILIO_SETUP.md` for detailed instructions.

### For Production Deployment

Follow the complete guide in `DEPLOYMENT.md` which covers:

1. **Server Setup**
   - Installing Node.js on Ubuntu 24.04
   - Installing nginx

2. **Application Deployment**
   - Building the frontend
   - Configuring systemd service for backend
   - Setting up nginx reverse proxy

3. **Security**
   - SSL certificate installation
   - Firewall configuration
   - Password management

4. **Maintenance**
   - Database backups
   - Log monitoring
   - Updates and restarts

## Project Structure

```
ocho-hair-lab-website/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks (including Spark compatibility)
│   └── lib/               # Utilities and Twilio integration
│
├── server/                # Backend API
│   ├── index.js           # Express server
│   ├── init-database.js   # Database setup
│   ├── database.sql       # Schema definition
│   └── ocho-hair-lab.db  # SQLite database (created on init)
│
├── .env                   # Environment variables (not in git)
├── setup.sh              # Automated setup script
├── README.md             # Main documentation
├── DATABASE_SETUP.md     # Database details and API reference
└── DEPLOYMENT.md         # Production deployment guide
```

## Understanding the Architecture

### Frontend (Port 5173 in dev, 80/443 in production)
- React + Vite
- Modern UI with Tailwind CSS
- Communicates with backend via REST API

### Backend (Port 3001)
- Express.js REST API
- CORS enabled for frontend
- Handles all database operations

### Database (SQLite file)
- Single file: `server/ocho-hair-lab.db`
- No separate database server needed
- Perfect for small to medium deployments
- Easy to backup (just copy the file)

### Why This Approach?

The application was originally built with GitHub Spark, which provides cloud storage. We've replaced that with a local database so you can:

✅ Run it anywhere (no cloud dependency)
✅ Own your data (stored locally)
✅ Easy deployment (just one server)
✅ Lower costs (no cloud fees)
✅ Simple backups (copy the database file)

## Common Issues & Solutions

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill the process if needed
kill $(lsof -ti:3001)

# Restart
cd server && npm start
```

### Frontend won't start
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

### Database issues
```bash
# Reinitialize database (WARNING: deletes all data)
cd server
rm ocho-hair-lab.db
npm run init-db
```

### Can't login
- Use credentials: `admin` / `admin123`
- Check that backend is running
- Check browser console for errors

### Booking doesn't work
- Ensure backend is running
- Check backend terminal for errors
- Verify database was initialized: `ls -la server/ocho-hair-lab.db`

## Getting Help

1. **Documentation Files**:
   - `README.md` - Overview and features
   - `DATABASE_SETUP.md` - Database and API details
   - `DEPLOYMENT.md` - Production setup guide
   - `TWILIO_SETUP.md` - WhatsApp configuration

2. **Logs**:
   - Backend logs are in the terminal where you ran `npm start`
   - Frontend logs are in the browser console (F12)

3. **Database Inspection**:
   ```bash
   cd server
   sqlite3 ocho-hair-lab.db
   .tables              # List tables
   .schema appointments # View schema
   SELECT * FROM staff_members;  # Query data
   .quit
   ```

## Production Checklist

Before deploying to your EC2 instance:

- [ ] Read `DEPLOYMENT.md` completely
- [ ] Change all default passwords
- [ ] Configure Twilio credentials (for WhatsApp)
- [ ] Set up SSL certificate
- [ ] Configure firewall (ports 22, 80, 443)
- [ ] Set up automated backups
- [ ] Test all functionality

## Support

This is a complete, production-ready website. Everything you need is included:

- ✅ Database with schema
- ✅ Backend API server
- ✅ Frontend application
- ✅ Default data (services, accounts)
- ✅ Complete documentation
- ✅ Deployment scripts
- ✅ Setup automation

You can `git clone`, run `./setup.sh`, and have a working website in minutes!

---

**Ready to deploy to production?** See `DEPLOYMENT.md` for the complete Ubuntu 24.04 deployment guide.
