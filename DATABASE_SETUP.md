# Ocho Hair Lab Website - Database Setup & Architecture

## Overview

This application uses a **standalone architecture** that doesn't require GitHub Spark or any external authentication service. It's designed to run on any server with Node.js and nginx.

## Architecture

```
┌─────────────────┐
│   React App     │  (Frontend - Port 80/443)
│   (Vite/React)  │
└────────┬────────┘
         │
         │ HTTP Requests
         │
┌────────▼────────┐
│     nginx       │  (Reverse Proxy)
│                 │
└────────┬────────┘
         │
         │ Proxy /api → :3001
         │
┌────────▼────────┐
│  Express API    │  (Backend - Port 3001)
│                 │
└────────┬────────┘
         │
         │ SQL Queries
         │
┌────────▼────────┐
│    SQLite DB    │  (Database)
│  ocho-hair-lab  │
└─────────────────┘
```

## Database Schema

The application uses **SQLite** for data persistence. The database includes the following tables:

### Tables

1. **customer_accounts** - Customer login credentials and contact info
   - `id`, `email` (unique), `password`, `name`, `phone`, `created_at`, `updated_at`

2. **staff_members** - Staff accounts and roles
   - `id`, `username` (unique), `password`, `name`, `role`, `is_admin`, `available_services` (JSON), `created_at`, `updated_at`

3. **salon_services** - Available services with pricing
   - `id`, `service_id` (unique), `name`, `duration`, `category`, `price`, `created_at`, `updated_at`

4. **appointments** - Booking records
   - `id`, `appointment_id` (unique), `customer_name`, `customer_email`, `customer_phone`, `password`, `service`, `services` (JSON), `service_durations` (JSON), `stylist`, `date`, `time`, `notes`, `confirmation_sent`, `reminder_sent`, `status`, `created_at`, `updated_at`

5. **staff_schedules** - Working hours and availability
   - `id`, `stylist_name` (unique), `working_days` (JSON), `blocked_dates` (JSON), `created_at`, `updated_at`

6. **sms_logs** - SMS message history for analytics
   - `id`, `appointment_id`, `type`, `template_name`, `customer_name`, `customer_email`, `service_name`, `to_number`, `message`, `status`, `failure_reason`, `sent_at`, `delivered_at`

## Quick Start

### 1. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..
```

### 2. Initialize Database

```bash
cd server
npm run init-db
```

This creates the SQLite database with:
- All required tables and indexes
- Default services (14 services across 4 categories)
- Default admin account: `admin` / `admin123`
- Default stylists: `maria.paula` and `sofia`

### 3. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3001/api

# Twilio credentials
VITE_TWILIO_ACCOUNT_SID=your_account_sid
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+your_number
VITE_TWILIO_TEMPLATE_SID=your_template_sid
VITE_SALON_PHONE=+5218116153747
```

### 4. Start Development

```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Start frontend
npm run dev
```

Access the app at `http://localhost:5173`

## API Endpoints

The backend provides RESTful API endpoints:

### Customer Accounts
- `GET /api/customer-accounts` - List all accounts
- `POST /api/customer-accounts` - Create account
- `PUT /api/customer-accounts/:email` - Update account
- `DELETE /api/customer-accounts/:email` - Delete account

### Staff Members
- `GET /api/staff-members` - List all staff
- `POST /api/staff-members` - Create staff member
- `PUT /api/staff-members/:username` - Update staff member
- `DELETE /api/staff-members/:username` - Delete staff member

### Salon Services
- `GET /api/salon-services` - List all services
- `POST /api/salon-services` - Create service
- `PUT /api/salon-services/:serviceId` - Update service
- `DELETE /api/salon-services/:serviceId` - Delete service

### Appointments
- `GET /api/appointments` - List all appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:appointmentId` - Update appointment
- `DELETE /api/appointments/:appointmentId` - Delete appointment

### Staff Schedules
- `GET /api/staff-schedules` - List all schedules
- `POST /api/staff-schedules` - Create/update schedule
- `DELETE /api/staff-schedules/:stylistName` - Delete schedule

### SMS Logs
- `GET /api/sms-logs` - List SMS history
- `POST /api/sms-logs` - Create SMS log entry

### Health Check
- `GET /api/health` - Server health status

## Default Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Owner (full access)

### Default Stylists
1. **Maria Paula**
   - Username: `maria.paula`
   - Password: `stylist123`
   - Role: Colorist

2. **Sofia**
   - Username: `sofia`
   - Password: `stylist123`
   - Role: Stylist

⚠️ **IMPORTANT**: Change all default passwords immediately after first login!

## Default Services

The database is pre-populated with 14 services:

### Tinte (Color Services)
- Retoque de Raiz (90 min) - $1,150
- Full Head Tint (120 min) - $1,500
- 0% AMONIACO (90 min) - from $1,000
- Toner/Gloss (60 min) - $450

### Corte & Styling
- Corte & Secado (60 min) - $900
- Secado short (30 min) - $350
- Secado mm (45 min) - $500
- Secado long (60 min) - $700
- Waves/peinado (45 min) - from $350

### Bespoke Color
- Balayage (180 min) - from $2,500
- Baby Lights (150 min) - from $3,500
- Selfie Contour (120 min) - $1,800

### Treatments
- Posion Nº17 (90 min) - $300
- Posion Nº 8 (60 min) - $900

## Database Management

### Backup Database

```bash
cp server/ocho-hair-lab.db server/ocho-hair-lab_backup_$(date +%Y%m%d).db
```

### Reset Database

⚠️ **WARNING**: This will delete all data!

```bash
cd server
rm ocho-hair-lab.db
npm run init-db
```

### View Database Contents

```bash
cd server
sqlite3 ocho-hair-lab.db

# SQLite commands:
.tables                    # List all tables
.schema appointments       # View table schema
SELECT * FROM staff_members;  # Query data
.quit                      # Exit
```

### Migrate Data

To export/import data:

```bash
# Export to SQL
sqlite3 ocho-hair-lab.db .dump > backup.sql

# Import from SQL
sqlite3 new-database.db < backup.sql
```

## Twilio WhatsApp Integration

### Setup

1. **Create Twilio Account**: https://www.twilio.com/
2. **Get WhatsApp Sandbox**: https://console.twilio.com/whatsapp/sandbox
3. **Configure `.env`**:
   ```env
   VITE_TWILIO_ACCOUNT_SID=ACxxxxx...
   VITE_TWILIO_AUTH_TOKEN=your_token
   VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

### Testing WhatsApp

1. Join the Twilio sandbox:
   - Send WhatsApp message to the sandbox number
   - Send: `join [your-sandbox-keyword]`

2. Book a test appointment
3. Check for confirmation message on WhatsApp

### Production WhatsApp

For production, apply for WhatsApp Business API through Twilio Console.

## Troubleshooting

### Backend Won't Start

```bash
# Check if port 3001 is in use
lsof -i :3001

# View backend logs
cd server
npm start
```

### Database Locked

```bash
# Check for database locks
cd server
rm ocho-hair-lab.db-shm ocho-hair-lab.db-wal
```

### API Connection Failed

1. Verify backend is running: `curl http://localhost:3001/api/health`
2. Check `.env` has correct `VITE_API_URL`
3. Check browser console for CORS errors

### Cannot Login

1. Verify database has default accounts:
   ```bash
   cd server
   sqlite3 ocho-hair-lab.db "SELECT * FROM staff_members;"
   ```
2. Reset database if needed (see Reset Database above)

## Production Deployment

See `DEPLOYMENT.md` for complete production deployment instructions including:
- Ubuntu server setup
- nginx configuration
- systemd service setup
- SSL certificate installation
- Firewall configuration
- Backup automation

## Security Notes

1. **Change Default Passwords**: Immediately after deployment
2. **Use HTTPS**: Always use SSL certificates in production
3. **Protect `.env`**: Never commit `.env` to git (already in `.gitignore`)
4. **Database Permissions**: Restrict file permissions on database file
5. **Regular Backups**: Automate daily database backups

## Development Notes

### Architecture Changes from Spark

This version **removes the GitHub Spark dependency** and uses:

- **Before**: `useKV()` from `@github/spark/hooks`
- **After**: `useKV()` from `@/hooks/spark-compat` (our compatibility layer)

The compatibility layer:
- Provides same interface as Spark's `useKV`
- Uses REST API calls to backend
- Handles data fetching and caching
- Compatible with existing component code

### Adding New Data Models

To add a new data model:

1. Add table to `server/database.sql`
2. Create API endpoints in `server/index.js`
3. Add key mapping in `src/hooks/useApiState.ts`
4. Use `useKV()` in components as normal

## Support

For deployment issues, see:
- `DEPLOYMENT.md` - Complete deployment guide
- `TWILIO_SETUP.md` - Twilio configuration
- GitHub Issues - Report bugs

## License

See LICENSE file for details.
