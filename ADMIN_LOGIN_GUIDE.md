# Admin Login Guide for Ocho Hair Lab

## How Admin Access Works

The Ocho Hair Lab website uses **GitHub Spark's built-in authentication system** to secure admin features. There is no separate username/password login - instead, it uses your GitHub account.

## Accessing the Private Admin Dashboard

### Step 1: Make Sure You're Logged In
The admin features are automatically available when you (the owner) are logged into the Spark app with your GitHub account. Spark handles authentication in the background.

### Step 2: Access the Admin Dashboard

You have **two ways** to access the private admin dashboard:

**Method 1: Click the "Admin" link in the navigation**
- When logged in as owner, you'll see an "Admin" link in the top navigation bar (with a shield icon)
- Click it to access the private admin dashboard

**Method 2: Direct URL**
- Navigate to your website URL and add `#admin` at the end
- Example: `https://your-spark-url.com/#admin`
- This will take you directly to the admin dashboard

### Step 3: View Admin Features

The private admin dashboard includes **two main tabs**:

#### 📊 Analytics & Appointments Tab
- **Summary Cards**: Total appointments, upcoming, completed, and total revenue
- **Date Filters**: Quick filters (This Week, This Month, Last 7/30 Days) or custom date ranges
- **5 Sub-Tabs**:
  - **Upcoming**: All future appointments with full customer details
  - **Past**: Historical appointment records
  - **Services**: Service analytics ranked by bookings and revenue
  - **Staff**: Staff performance metrics and revenue tracking
  - **Sales**: Revenue summaries and top-performing services

#### 📅 Staff Schedules Tab
- **Working Hours**: Set daily hours for each stylist
- **Break Times**: Configure break periods when stylists are unavailable
- **Blocked Dates**: Mark vacation days and time off
- All settings automatically update the public booking calendar

### Step 4: Manage Appointments

From the Analytics & Appointments tab, you can:
- View all appointment details (name, phone, email, service, date, time, notes)
- Delete appointments using the trash icon
- Contact customers directly via clickable phone/email links
- Filter by custom date ranges to analyze specific periods
- See confirmation and reminder status for each booking

### Step 5: Exit Admin Dashboard

- Click the "Exit Admin" button in the top right to return to the public website
- Or simply navigate to the home page URL

## Security Features

**✅ What's Protected:**
- The entire admin dashboard is only visible to the GitHub account owner
- Regular visitors cannot access the dashboard even if they know the URL
- Access is verified server-side using `spark.user().isOwner`
- Unauthorized access attempts show an "Access Denied" message

**✅ What's Hidden from Public:**
- Admin navigation link (only shows for owner)
- All customer contact information (phone, email)
- Appointment analytics and revenue data
- Staff scheduling controls
- The admin dashboard itself is completely separate from the public site

## Who Can See What?

**Owner (You):**
- Full admin dashboard access at `#admin`
- "Admin" link in navigation
- All customer and business data
- Complete management controls

**Regular Visitors:**
- Public website only (home, services, gallery, team, contact)
- Book appointments
- View their own appointments at `#profile`
- Cannot see or access admin features

## Accessing on Different Devices

To access admin features from mobile or different computers:

1. Navigate to your Spark app URL
2. Log into GitHub with the account that owns the Spark app
3. Click "Admin" in the navigation or go to `#admin`
4. The dashboard will appear automatically

## Privacy & Data Security

- Customer data is stored in Spark's encrypted key-value storage
- Phone numbers and emails are only visible in the admin dashboard
- No customer data appears on the public website
- Admin dashboard requires owner authentication
- All sensitive data stays private to you

## Troubleshooting

**Can't see the Admin link?**
1. Verify you're logged into GitHub with the owner account
2. Refresh the page
3. Clear browser cache

**Access Denied message?**
1. Make sure you're using the GitHub account that created the Spark app
2. Log out and log back into GitHub
3. Try accessing via `#admin` URL directly

**Dashboard not loading?**
1. Check your internet connection
2. Refresh the page
3. Clear browser cache and reload

## Quick Access

**Admin Dashboard URL Pattern:**
```
https://your-spark-url.com/#admin
```

Bookmark this URL for quick access to your private admin dashboard!
