# Quick Fix Guide - Ubuntu 24.04 VM Issues

## What Was Fixed

### Issue 1: Admin Login Failing
**Problem**: Could not login with `owner@ocholab.com` / `owner123`  
**Cause**: KV store data not loaded when login attempted  
**Fix**: Added loading screen to ensure data loads before login page shows

### Issue 2: Missing Stylists in Booking
**Problem**: Only "Any Stylist" in dropdown, Maria and Paula missing  
**Cause**: Staff data not loaded when booking dialog opened  
**Fix**: Loading screen prevents booking until data is ready

## Quick Test (2 Minutes)

### Test 1: Admin Login ✓
1. Open the website
2. Wait for loading screen (< 1 second)
3. Click "Staff Login" in footer
4. Enter: `owner@ocholab.com` / `owner123`
5. Click "Sign In"
6. **Expected**: Redirects to Admin Dashboard

### Test 2: Stylist Dropdown ✓
1. Open the website  
2. Wait for loading screen
3. Click "Book Appointment"
4. Click "Preferred Stylist" dropdown
5. **Expected**: See "Any Available", "Maria", and "Paula"

## If Issues Persist

### Check Console Logs
Open browser console (F12) and look for:
```
🌱 SEED DATA: ✅ INITIALIZATION COMPLETE
   📊 Staff members: 3
   📊 Services: 14
```

If you don't see this, refresh the page.

### Adjust Timing (If Needed)
If your VM is very slow, edit `src/hooks/use-seed-data.ts`:

```typescript
const SEED_INIT_DELAY_MS = 200   // Increase to 500 for slow VMs
const SEED_VERIFY_DELAY_MS = 500 // Increase to 1000 for slow VMs
```

Then rebuild: `npm run build`

### Manual Verification
In browser console:
```javascript
// Should show 3 staff members
await spark.kv.get("staff-members")

// Should show 14 services
await spark.kv.get("salon-services")
```

## All Test Credentials

### Admin/Owner
- Username: `owner@ocholab.com`
- Password: `owner123`
- Access: Admin Dashboard

### Maria (Staff)
- Username: `maria`
- Password: `supersecret`
- Access: Staff Dashboard

### Paula (Staff)
- Username: `paula`
- Password: `supersecret`
- Access: Staff Dashboard

## Need More Help?

See `FIX_SUMMARY.md` for:
- Detailed testing procedures
- Troubleshooting guide
- Console verification commands
- Technical implementation details

## Summary

✅ **Loading screen** added - ensures data loads before app renders  
✅ **Timing delays** increased - accommodates slower VMs  
✅ **Error messages** improved - clearer feedback when issues occur  
✅ **Console logging** enhanced - easier debugging  
✅ **Documentation** comprehensive - testing and troubleshooting covered
