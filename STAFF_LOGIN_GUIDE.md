# Staff Login Guide

## Accessing Staff Dashboard

Staff members can now log in to view their appointments by clicking the "Staff Login" button in the navigation menu.

## Staff Credentials

Each staff member can log in using their first name (lowercase) as the username.

### Staff Login Information

| Staff Member | Username | Password | Role |
|--------------|----------|----------|------|
| Maria Rodriguez | `maria` | `supersecret` | Owner & Master Stylist |
| Jessica Chen | `jessica` | `supersecret` | Senior Stylist |
| Alex Thompson | `alex` | `supersecret` | Color Specialist |
| Sophia Martinez | `sophia` | `supersecret` | Stylist |

### Admin/Owner Access

| Name | Username | Password | Role |
|------|----------|----------|------|
| Admin | `owner@ocholab.com` | `owner123` | Owner |

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

When logging in as admin (`owner@ocholab.com`), you will be redirected to the full admin dashboard with analytics, staff management, and all appointments.

## How to Access

1. Click "Staff Login" in the navigation menu
2. Enter your username (first name lowercase)
3. Enter password: `supersecret`
4. Click "Sign In"

## Security Note

⚠️ **Important**: These credentials are for development/demo purposes. In a production environment, you should:
- Use unique, strong passwords for each staff member
- Implement proper authentication (OAuth, JWT, etc.)
- Add password reset functionality
- Enable two-factor authentication
- Store passwords securely (hashed and salted)
