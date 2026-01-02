# 🧪 Quick Test: Maria & Paula Staff Login

## Test Credentials

### Maria
```
Username: maria
Password: supersecret
```

### Paula
```
Username: paula
Password: supersecret
```

---

## Quick Test Steps

### 1️⃣ Test Maria Login
1. Go to Staff Login (footer button or `#staff` URL)
2. Enter: `maria` / `supersecret`
3. Click "Sign In"
4. ✅ Should see: "Welcome back, Maria!"
5. ✅ Dashboard shows "Senior Stylist" role
6. ✅ NO admin features visible

### 2️⃣ Test Paula Login
1. Logout if logged in
2. Go to Staff Login
3. Enter: `paula` / `supersecret`
4. Click "Sign In"
5. ✅ Should see: "Welcome back, Paula!"
6. ✅ Dashboard shows "Senior Stylist" role
7. ✅ NO admin features visible

### 3️⃣ Test Invalid Login
1. Try: `maria` / `wrongpassword`
2. ✅ Should see: "Invalid username or password"

### 4️⃣ Test Case Insensitivity
1. Try: `MARIA` / `supersecret`
2. ✅ Should work (username is case-insensitive)
3. Try: `maria` / `SUPERSECRET`
4. ✅ Should fail (password is case-sensitive)

---

## Expected Dashboard Features

### ✅ What They CAN See:
- Today's Appointments (their own only)
- Upcoming Appointments (their own only)
- Past Appointments (their own only)
- Customer details: name, email, phone
- Service details: services, durations, times
- Logout button

### ❌ What They CANNOT See:
- Staff Management
- Services Management
- Staff Schedule Management
- Analytics Dashboard
- SMS/WhatsApp Configuration
- Any admin-only features

---

## Quick Console Verification

```javascript
// Verify staff members exist
const staff = await spark.kv.get("staff-members")
console.log("Maria:", staff?.find(s => s.username === "maria"))
console.log("Paula:", staff?.find(s => s.username === "paula"))
```

---

## Troubleshooting

**Can't login?**
- Refresh page to trigger seed data
- Check console for initialization logs
- Verify credentials exactly as shown above

**No appointments showing?**
- Book a test appointment first
- Make sure to select Maria or Paula as stylist
- Appointments must have status "confirmed"

---

## All Systems Ready ✅

Both Maria and Paula accounts are:
- ✅ Seeded with correct credentials
- ✅ Assigned "Senior Stylist" role
- ✅ Given access to all 14 services
- ✅ Configured as non-admin users
- ✅ Ready to login and view their appointments

**Start testing now!** 🚀
