# Staff Login Guide

## Accessing Staff Dashboard

Staff members can now log in to view their appointments by clicking the "Staff Login" button in the navigation menu.

## Staff Credentials

Each staff member can log in using their username.

### Staff Login Information

| Staff Member | Username | Password | Role |
|--------------|----------|----------|------|
| test1 | `test1` | `test1` | Stylist |
| test2 | `test2` | `test2` | Stylist |
| test3 | `test3` | `test3` | Stylist |

### Admin/Owner Access

| Name | Username | Password | Role |
|------|----------|----------|------|
| Admin | `admin` | `admin` | Owner |

## Features

When staff members log in, they can see:

1. **Dashboard Overview**
   - Count of today's appointments
   - Count of upcoming appointments
   - Total completed appointments

2. **Appointment Tabs**
   - **Today**: All appointments scheduled for today
   - **Upcoming**: Future appointments
   - **Past**: Completed appointments

3. **Appointment Details**
   - Customer name, phone, and email
   - Date and time
   - Services booked
   - Status (confirmed/completed/cancelled)

## Admin Access

When logging in as admin (`admin`), you will be redirected to the full admin dashboard with analytics, staff management, and all appointments.

## How to Access

1. Click "Staff Login" in the navigation menu
2. Enter your username
3. Enter your password
4. Click "Sign In"

## Security Note

⚠️ **Important**: These credentials are for development/demo purposes. In a production environment, you should:
- Use unique, strong passwords for each staff member
- Implement proper authentication (OAuth, JWT, etc.)
- Add password reset functionality
- Enable two-factor authentication
- Store passwords securely (hashed and salted)
