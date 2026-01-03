# Deployment Testing Guide for Ubuntu 24.04 with Nginx

This guide outlines the steps to test the Ocho Hair Lab website after deployment on Ubuntu 24.04 with nginx.

## Prerequisites

- Ubuntu 24.04 VM (t3.micro or equivalent)
- Nginx installed and configured
- Application deployed and running

## Testing Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin`
- **Access:** Full admin dashboard with all features

### Staff Accounts
All three staff members have equal access to all services:
- **test1:** Username: `test1`, Password: `test1`
- **test2:** Username: `test2`, Password: `test2`
- **test3:** Username: `test3`, Password: `test3`

## Test Scenarios

### 1. Admin Login Test

1. Navigate to the website home page
2. Scroll to footer and click "Staff Login"
3. Enter credentials:
   - Username: `admin`
   - Password: `admin`
4. **Expected Result:** Should redirect to Admin Dashboard
5. **Verify:**
   - Analytics panel is visible
   - Staff & Accounts tab is accessible
   - Services Management tab is accessible
   - All appointments are visible

### 2. Staff Login Tests

#### Test 2.1: Login as test1
1. Navigate to the website and click "Staff Login"
2. Enter credentials:
   - Username: `test1`
   - Password: `test1`
3. **Expected Result:** Should show test1's Staff Dashboard
4. **Verify:**
   - Dashboard shows test1's appointments only
   - Can view today's, upcoming, and past appointments

#### Test 2.2: Login as test2
1. Logout and return to "Staff Login"
2. Enter credentials:
   - Username: `test2`
   - Password: `test2`
3. **Expected Result:** Should show test2's Staff Dashboard
4. **Verify:** Same as Test 2.1

#### Test 2.3: Login as test3
1. Logout and return to "Staff Login"
2. Enter credentials:
   - Username: `test3`
   - Password: `test3`
3. **Expected Result:** Should show test3's Staff Dashboard
4. **Verify:** Same as Test 2.1

### 3. Booking Flow Tests

#### Test 3.1: Verify Stylists Appear in Dropdown
1. Navigate to home page and click "Book Appointment"
2. Look at the "Preferred Stylist" dropdown
3. **Expected Result:** Dropdown should show:
   - "Any Available"
   - "test1"
   - "test2"
   - "test3"
4. **Verify:** No other staff members (like Maria or Paula) appear

#### Test 3.2: Book Appointment with test1
1. Click "Book Appointment" from home page
2. Fill in customer details:
   - Name: Test Customer 1
   - Email: test1@example.com
   - Phone: 81 1234 5678
   - Password: password123
3. Select "test1" from Preferred Stylist dropdown
4. **Expected Result:** All service categories should appear
5. Select at least one service (e.g., "Corte & Secado")
6. Select a date (tomorrow or any future date)
7. **Expected Result:** Available time slots should appear
8. **Verify:**
   - Time slots are displayed (9:00 AM, 10:00 AM, etc.)
   - Can select a time
9. Add optional notes if desired
10. Click "Confirm Booking"
11. **Expected Result:** Success message appears
12. **Verify:**
    - Booking confirmation appears
    - Redirected to customer login/profile

#### Test 3.3: Book Appointment with test2
1. Repeat Test 3.2 but select "test2" as the stylist
2. Use different customer details
3. **Verify:** Same behavior as Test 3.2

#### Test 3.4: Book Appointment with test3
1. Repeat Test 3.2 but select "test3" as the stylist
2. Use different customer details
3. **Verify:** Same behavior as Test 3.2

#### Test 3.5: Book Appointment with "Any Available"
1. Click "Book Appointment"
2. Fill in customer details
3. Select "Any Available" from Preferred Stylist dropdown
4. Select services
5. Select a date
6. **Expected Result:** Available time slots should appear (slots where at least one of test1, test2, or test3 is available)
7. Select a time and complete booking
8. **Verify:**
   - Booking succeeds
   - One of test1, test2, or test3 is assigned to the appointment

### 4. Admin Verification of Bookings

1. Login as admin (username: `admin`, password: `admin`)
2. Navigate to the appointments section
3. **Verify:**
   - All test bookings from Tests 3.2, 3.3, and 3.4 appear
   - Each booking shows the correct stylist (test1, test2, or test3)
   - Booking details are correct (customer name, service, date, time)

### 5. Staff Schedule Verification

1. Login as admin
2. Navigate to Staff & Accounts section
3. Click on each staff member (test1, test2, test3)
4. **Verify:**
   - Each staff member has a working schedule configured
   - Default working hours are Monday-Saturday, 9:00 AM - 6:00 PM
   - Each staff member has all services assigned

### 6. Services Verification

1. Login as admin
2. Navigate to Services Management
3. **Verify:**
   - All services are listed (14 services total)
   - Services include: Retoque de Raiz, Full Head Tint, Corte & Secado, Balayage, etc.
   - Each service has correct duration and pricing

### 7. Time Slot Availability Test

This test ensures that the scheduling system works correctly:

1. Book an appointment with test1 at 10:00 AM on a specific date
2. Try to book another appointment with test1 at the same time (10:00 AM) on the same date
3. **Expected Result:** 10:00 AM should NOT be available for test1
4. **Verify:**
   - The time slot is blocked for test1
   - The time slot is still available for test2 and test3

### 8. Customer Login and Profile Test

1. After booking an appointment, use the customer credentials to login
2. Click "Customer Login" from home page
3. Enter the email and password used during booking
4. **Expected Result:** Should show customer profile with their appointments
5. **Verify:**
   - All customer's appointments are visible
   - Can view appointment details
   - Can cancel appointments (if feature is enabled)

## Common Issues and Solutions

### Issue: "Only 'Any Stylist' showing in dropdown"
**Solution:** 
- Check that seed data has initialized properly
- Verify that test1, test2, test3 are in the staff-members KV store
- Check browser console for errors

### Issue: "No available times showing"
**Solution:**
- Verify that staff schedules exist for test1, test2, test3
- Check that the selected date is not in the past
- Verify that selected date is within working hours (Mon-Sat, 9 AM - 6 PM)
- Check that the time slots are not all booked

### Issue: "Admin cannot login"
**Solution:**
- Verify username is exactly `admin` (not `owner@ocholab.com`)
- Verify password is exactly `admin` (not `owner123`)
- Check browser console for KV store errors
- Verify the application has proper Spark runtime configuration

### Issue: "Maria or Paula still showing"
**Solution:**
- Clear browser cache and reload
- Check that migration logic ran in use-seed-data.ts
- Verify the KV store has been updated with new staff

## Success Criteria

All tests should pass with the following outcomes:
- ✅ Admin can login with `admin` / `admin`
- ✅ test1, test2, test3 can all login with their respective credentials
- ✅ All three stylists appear in the booking dropdown
- ✅ Available time slots appear when date and stylist are selected
- ✅ Appointments can be booked with each stylist
- ✅ All services are available for all three stylists
- ✅ Admin can see all appointments in the dashboard
- ✅ No references to Maria or Paula appear anywhere

## Notes for Production Deployment

1. **Security:** Change default passwords before production deployment
2. **Backup:** Ensure KV store data is backed up regularly
3. **Monitoring:** Set up monitoring for the nginx service
4. **SSL:** Configure SSL/TLS certificates for HTTPS
5. **Performance:** Monitor VM resources (t3.micro has limited resources)
6. **Logs:** Configure proper logging for debugging issues
