# Admin Login Guide for Ocho Hair Lab

## How Admin Access Works

The Ocho Hair Lab website uses **GitHub Spark's built-in authentication system** to secure admin features. There is no separate username/password login - instead, it uses your GitHub account.

## Accessing the Admin Dashboard

### Step 1: Make Sure You're Logged In
The admin features are automatically available when you (the owner) are logged into the Spark app with your GitHub account. Spark handles authentication in the background.

### Step 2: View the Admin Dashboard
Once logged in as the owner, scroll down on the homepage to the **Admin Dashboard** section. This section appears automatically and includes:

- **📊 Analytics Overview**: Total appointments, revenue, upcoming/completed counts
- **📅 Upcoming Appointments**: All future bookings with customer details
- **📜 Past Appointments**: Historical booking records
- **📈 Service Analytics**: Most popular services ranked by bookings and revenue
- **👥 Staff Performance**: Revenue and appointment counts per stylist
- **💰 Sales Analytics**: Revenue summaries and top-performing services

### Step 3: Manage Appointments
In the Admin Dashboard, you can:
- View all appointment details (customer name, phone, email, service, date, time)
- Delete appointments using the trash icon
- Contact customers directly via phone or email links
- Filter data by date ranges (This Week, This Month, Last 30 Days, or custom range)
- Track which customers received confirmation and reminder messages

### Step 4: Manage Staff Schedules
Scroll to the **Staff Schedule Management** section (appears between Team and Admin Dashboard). Here you can:
- Set working hours for each stylist by day of the week
- Configure break times
- Block specific dates for time off
- These settings automatically update the booking calendar to prevent conflicts

## Who Can See Admin Features?

**Only you** (the GitHub user who created this Spark app) can see:
- Admin Dashboard section
- Staff Schedule Management section

**Regular visitors** will NOT see these sections - they are automatically hidden for non-owners.

## How It Works Behind the Scenes

The app uses `spark.user()` to check if the current visitor is the owner:

```typescript
const user = await spark.user()
if (user.isOwner) {
  // Show admin features
}
```

This happens automatically when components load. No additional login form is needed.

## Accessing on Different Devices

If you want to access admin features from a mobile device or different computer:

1. Navigate to your Spark app URL
2. Make sure you're logged into GitHub with the same account that owns the Spark app
3. The admin sections will appear automatically

## Security Notes

- Admin features are protected at the component level
- Only the GitHub account owner can see and use admin functions
- Customer data (appointments) is stored securely in Spark's key-value storage
- WhatsApp and phone numbers are only visible to you in the admin panel

## Need Help?

If you're logged in as the owner but don't see the admin sections:
1. Refresh the page
2. Check that you're logged into GitHub
3. Verify you're using the GitHub account that created the Spark app
4. Clear your browser cache and reload

The admin dashboard should appear automatically below the Team section on your homepage.
