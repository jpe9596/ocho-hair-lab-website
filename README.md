# Ocho Hair Lab Website

A modern, standalone website for Ocho Hair Lab salon featuring appointment booking, staff management, and WhatsApp notifications via Twilio.

## 🌟 Features

- **Appointment Booking**: Customers can book appointments with preferred stylists
- **Customer Accounts**: Secure login system for customers to manage their bookings
- **Staff Management**: Admin panel for managing stylists, schedules, and services
- **WhatsApp Notifications**: Automated booking confirmations and reminders via Twilio
- **Service Management**: Add, edit, and configure salon services and pricing
- **Schedule Management**: Configure stylist availability and working hours
- **SMS Analytics**: Track message delivery rates and customer engagement
- **Responsive Design**: Beautiful UI that works on all devices

## 🏗️ Architecture

This is a **standalone application** that runs without GitHub Spark dependencies:

- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express
- **Database**: SQLite (file-based, no separate DB server needed)
- **Web Server**: nginx (for production)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jpe9596/ocho-hair-lab-website.git
   cd ocho-hair-lab-website
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install

   # Backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Initialize the database**
   ```bash
   cd server
   npm run init-db
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Backend API
   cd server
   npm start

   # Terminal 2: Frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Default Login Credentials

**Admin Account**:
- Username: `admin`
- Password: `admin123`

**Stylists**:
- Username: `maria.paula` / Password: `stylist123`
- Username: `sofia` / Password: `stylist123`

⚠️ **Change these passwords immediately after first login!**

## 📚 Documentation

- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database schema, API endpoints, and data management
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete production deployment guide for Ubuntu 24.04
- **[TWILIO_SETUP.md](./TWILIO_SETUP.md)** - WhatsApp messaging configuration

## 🚢 Production Deployment

For deployment to an EC2 t3.micro instance (or any Ubuntu 24.04 server), choose one of two approaches:

### Option 1: Local Build + SCP (Recommended) ⚡
- **[DEPLOYMENT_LOCAL_BUILD.md](./DEPLOYMENT_LOCAL_BUILD.md)** - Build locally and deploy with `scp`
- ✅ Faster deployment
- ✅ Lower server resource usage
- ✅ No git clone needed on EC2
- ✅ Includes automated deployment script

### Option 2: Build on Server 🔨
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Traditional git clone and build on EC2
- Good for learning and simple setups

Both guides include:
- Server setup and configuration
- nginx reverse proxy setup
- systemd service configuration
- SSL certificate installation
- Database backups
- Security best practices

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001/api

# Twilio WhatsApp Configuration
VITE_TWILIO_ACCOUNT_SID=your_account_sid
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+your_number
VITE_TWILIO_TEMPLATE_SID=your_template_sid
VITE_SALON_PHONE=+5218116153747
```

For production, update `VITE_API_URL` to your server's domain or IP.

## 🗄️ Database

The application uses SQLite with the following tables:
- `customer_accounts` - Customer login credentials
- `staff_members` - Staff accounts and roles
- `salon_services` - Available services with pricing
- `appointments` - Booking records
- `staff_schedules` - Working hours and availability
- `sms_logs` - SMS message history

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed schema and management instructions.

## 🛠️ Development

### Project Structure

```
ocho-hair-lab-website/
├── src/                  # Frontend source code
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks (including Spark compatibility)
│   ├── lib/             # Utility functions, Twilio integration
│   └── styles/          # CSS styles
├── server/              # Backend API server
│   ├── index.js         # Express server
│   ├── init-database.js # Database initialization
│   ├── database.sql     # Database schema
│   └── package.json     # Backend dependencies
├── dist/                # Production build output (generated)
└── .env                 # Environment variables (not in git)
```

### Available Scripts

**Frontend**:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend** (in `server/` directory):
- `npm start` - Start API server
- `npm run dev` - Start with auto-reload
- `npm run init-db` - Initialize/reset database

## 📱 Features in Detail

### Appointment Booking
- Multi-service booking support
- Stylist availability checking
- Conflict prevention
- Automated confirmation via WhatsApp

### Admin Panel
- View all appointments
- Manage staff members and schedules
- Configure services and pricing
- View SMS analytics

### Customer Portal
- View booking history
- Reschedule appointments
- Cancel appointments
- Receive WhatsApp notifications

### Staff Dashboard
- View assigned appointments
- Check daily schedule
- Manage availability

## 🔐 Security

- Passwords stored in database (consider bcrypt hashing for production)
- Environment variables for sensitive data
- CORS configured for API security
- SQL injection protection via parameterized queries

## 🤝 Contributing

This is a private salon website. For authorized changes:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

See LICENSE file for details.

## 🆘 Support

For issues or questions:
- Check the documentation files (DATABASE_SETUP.md, DEPLOYMENT.md)
- Review the GitHub Issues
- Contact the system administrator
