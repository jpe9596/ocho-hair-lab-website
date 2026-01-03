# Quick Start Guide for Ubuntu 24.04 Deployment

## Overview
This guide provides quick deployment instructions for the Ocho Hair Lab website on Ubuntu 24.04 with nginx.

## New Credentials (Effective Immediately)

### Admin Login
- **Username:** `admin`
- **Password:** `admin`
- **Access:** Full admin dashboard

### Staff Logins
All three stylists available for booking:
- **test1:** Username: `test1`, Password: `test1`
- **test2:** Username: `test2`, Password: `test2`
- **test3:** Username: `test3`, Password: `test3`

## What Changed?

### Before
- Admin: `owner@ocholab.com` / `owner123`
- Staff: Maria and Paula with password `supersecret`
- Only "Any Stylist" showing in dropdown
- No available times

### After
- Admin: `admin` / `admin`
- Staff: test1, test2, test3 (each with password matching username)
- All three stylists show in dropdown
- Available times display correctly
- All staff can perform all services

## Deployment Steps

1. **Deploy the application** to your Ubuntu 24.04 VM
   ```bash
   # Build the application
   npm install
   npm run build
   ```

2. **Configure nginx** to serve from the `dist` directory

3. **Start the application** and navigate to the website

4. **First Load:** The system will automatically:
   - Detect old staff (Maria/Paula) if they exist
   - Migrate to new staff (test1, test2, test3)
   - Create proper schedules for all staff
   - Assign all services to all staff members

## Quick Verification

### Step 1: Test Admin Login
1. Click "Staff Login" in footer
2. Login with `admin` / `admin`
3. ✅ Should see Admin Dashboard with all features

### Step 2: Test Booking
1. Go to home page
2. Click "Book Appointment"
3. Check "Preferred Stylist" dropdown
4. ✅ Should see: Any Available, test1, test2, test3
5. Select a stylist
6. ✅ All services should appear
7. Select services
8. Select a date
9. ✅ Available times should appear (9:00 AM - 6:00 PM range)
10. Complete booking
11. ✅ Booking should succeed

### Step 3: Test Staff Login
1. Click "Staff Login"
2. Login as `test1` / `test1`
3. ✅ Should see test1's dashboard

## Common Issues & Solutions

### Issue: Still seeing Maria or Paula
**Solution:** Clear browser cache or hard refresh (Ctrl+Shift+R)

### Issue: No stylists in dropdown
**Solution:** 
- Check browser console for errors
- Verify the app is running with Spark runtime or proper KV store configuration
- Wait a few seconds for seed data to initialize

### Issue: No available times
**Solution:**
- Verify schedules exist for test1, test2, test3
- Check that selected date is in working days (Mon-Sat)
- Check that time is within working hours (9 AM - 6 PM)

### Issue: Admin cannot login with admin/admin
**Solution:**
- Verify you're using exactly `admin` (not `owner@ocholab.com`)
- Check browser console for KV store errors
- Verify Spark runtime is properly configured

## Files Modified

1. `src/hooks/use-seed-data.ts` - Core seed data and migration logic
2. `DEFAULT_CREDENTIALS.md` - Updated credentials documentation
3. `STAFF_LOGIN_GUIDE.md` - Updated login guide
4. `DEPLOYMENT_TESTING.md` - Comprehensive testing guide
5. `IMPLEMENTATION_SUMMARY.md` - Detailed implementation notes

## Next Steps

1. ✅ Code changes complete
2. ✅ Documentation updated
3. ✅ Build verified
4. ⏳ Deploy to Ubuntu 24.04 VM
5. ⏳ Test admin login
6. ⏳ Test booking flow
7. ⏳ Verify all functionality

## Support

For detailed testing procedures, see:
- `DEPLOYMENT_TESTING.md` - Comprehensive test scenarios
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details
- `DEFAULT_CREDENTIALS.md` - Complete credential reference

## Security Warning

⚠️ **IMPORTANT:** These credentials are for testing only. Before production:
- Change all passwords to strong, unique values
- Implement proper authentication
- Enable HTTPS with valid SSL certificates
- Follow security best practices in `IMPLEMENTATION_SUMMARY.md`
