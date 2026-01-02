# Quick Test Guide - Maria & Paula 14 Services

## 🎯 What to Test
Verify that Maria and Paula both show all 14 services when booking an appointment.

---

## ⚡ Quick Test (2 minutes)

### Step 1: Open App
- Navigate to the home page

### Step 2: Test Maria
1. Click **"Book Appointment"** button
2. Select **"Maria"** from the Preferred Stylist dropdown
3. **COUNT THE SERVICES** - Should see 4 categories with 14 total services:
   - ✅ Tinte (4)
   - ✅ Corte & Styling (5)
   - ✅ Bespoke Color (3)
   - ✅ Treatments (2)

### Step 3: Test Paula
1. In same dialog, change to **"Paula"**
2. **COUNT THE SERVICES** - Should see same 14 services in 4 categories

### Step 4: Verify Console
1. Press **F12** to open browser console
2. Look for these lines:
   ```
   📊 Quick verification:
      - Total services: 14 (Expected: 14)
      - Maria services: 14 (Expected: 14)
      - Paula services: 14 (Expected: 14)
   ```

---

## ✅ Expected: All 14 Services

### Tinte (4 services)
1. Retoque de Raiz
2. Full Head Tint
3. 0% AMONIACO
4. Toner/Gloss

### Corte & Styling (5 services)
5. Corte & Secado
6. Secado (short)
7. Secado (mm)
8. Secado (long)
9. Waves/peinado

### Bespoke Color (3 services)
10. Balayage
11. Baby Lights
12. Selfie Contour

### Treatments (2 services)
13. Posion Nº17
14. Posion Nº 8

---

## 🔍 Visual Check
When you select Maria or Paula, the services section should look like this:

```
Services * (Select one or more)
┌─────────────────────────────────────┐
│ Tinte                               │
│ ☐ Retoque de Raiz                   │
│ ☐ Full Head Tint                    │
│ ☐ 0% AMONIACO                       │
│ ☐ Toner/Gloss                       │
│                                     │
│ Corte & Styling                     │
│ ☐ Corte & Secado                    │
│ ☐ Secado (short)                    │
│ ☐ Secado (mm)                       │
│ ☐ Secado (long)                     │
│ ☐ Waves/peinado                     │
│                                     │
│ Bespoke Color                       │
│ ☐ Balayage                          │
│ ☐ Baby Lights                       │
│ ☐ Selfie Contour                    │
│                                     │
│ Treatments                          │
│ ☐ Posion Nº17                       │
│ ☐ Posion Nº 8                       │
└─────────────────────────────────────┘
```

---

## 🧪 One-Command Test

Open browser console (F12) and paste this:

```javascript
spark.kv.get("staff-members").then(staff => {
  const maria = staff.find(s => s.username === "maria")
  const paula = staff.find(s => s.username === "paula")
  const mariaCount = maria?.availableServices?.length || 0
  const paulaCount = paula?.availableServices?.length || 0
  
  console.log("%c🎯 SERVICE COUNT TEST", "font-size: 16px; font-weight: bold")
  console.log(`Maria: ${mariaCount}/14 services ${mariaCount === 14 ? '✅' : '❌'}`)
  console.log(`Paula: ${paulaCount}/14 services ${paulaCount === 14 ? '✅' : '❌'}`)
  
  if (mariaCount === 14 && paulaCount === 14) {
    console.log("%c✅ TEST PASSED - Both have all services!", "color: green; font-weight: bold")
  } else {
    console.log("%c❌ TEST FAILED - Missing services!", "color: red; font-weight: bold")
  }
})
```

---

## 🐛 Diagnostic Panel

Look for a panel in the **bottom-right corner** of the screen that shows:
- Staff Members count
- Services per stylist
- Status checks (should all be green ✅)

---

## ❌ Common Issues

### "No stylists available"
- **Fix**: Refresh the page
- **Why**: Seed data needs to load

### "No services configured"
- **Fix**: Check console logs for errors
- **Why**: Service assignment may have failed

### Different services for Maria vs Paula
- **Fix**: Should NOT happen - report as bug
- **Why**: Both should have identical service lists

---

## 📊 Pass/Fail Criteria

### ✅ PASS if:
- Maria shows 14 services in 4 categories
- Paula shows 14 services in 4 categories
- Console shows 14/14 for both
- Can select multiple services
- Selected services show as badges

### ❌ FAIL if:
- Either stylist shows less than 14 services
- Services differ between Maria and Paula
- Cannot select services
- Console shows errors

---

## 🚀 Full Booking Test (Optional)

If quick test passes, try a complete booking:

1. Select Maria
2. Check **any 3 services** (e.g., Retoque de Raiz, Toner/Gloss, Corte & Secado)
3. Pick a date (not Sunday)
4. Pick a time
5. Fill form: Name, Email, Phone, Password
6. Click "Request Appointment"
7. **Expected**: Success message, appointment saved

---

## 📝 Report Results

**Maria Services**: ___/14 ✅ ❌  
**Paula Services**: ___/14 ✅ ❌  
**Overall**: PASS ✅ / FAIL ❌

**Notes**: ________________________________

---

**For detailed testing**: See `TEST_RESULTS_MARIA_PAULA.md`  
**For background**: See `MARIA_PAULA_BOOKING_TEST.md`
