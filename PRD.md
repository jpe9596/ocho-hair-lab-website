# Planning Guide

A sophisticated, modern website for Ocho Hair Lab that showcases salon services, enables appointment scheduling, and introduces the talented team of stylists in an elegant, engaging digital experience.

**Experience Qualities**:
1. **Luxurious** - Every element should evoke premium quality and refinement, making visitors feel they're discovering an upscale beauty destination
2. **Warm** - While sophisticated, the site maintains an inviting, approachable atmosphere that makes clients feel welcomed and comfortable
3. **Contemporary** - Clean, minimalist aesthetics with thoughtful interactions that feel fresh and current, reflecting modern beauty industry standards

**Complexity Level**: Light Application (multiple features with basic state)
  - The site includes multiple sections (services, booking, team profiles) with interactive elements like a booking form and navigation, but maintains straightforward state management for appointments and service selection.

## Essential Features

### Service Showcase
- **Functionality**: Displays all salon services with descriptions, duration, and pricing
- **Purpose**: Informs potential clients about available treatments and helps them make informed decisions
- **Trigger**: User scrolls to services section or clicks "Services" navigation link
- **Progression**: View services grid → Select service card for details → See expanded information with pricing and duration → Option to book that service
- **Success criteria**: All services clearly visible with complete information; users can easily understand what's offered

### Appointment Booking
- **Functionality**: Interactive form for scheduling salon appointments with service selection, date/time picking, contact information, and automated SMS notifications via Twilio
- **Purpose**: Converts website visitors into booked clients by streamlining the reservation process and providing instant confirmation
- **Trigger**: User clicks "Book Appointment" CTA button or completes service selection
- **Progression**: Click booking CTA → Select desired service(s) → Choose preferred stylist (optional) → Pick date and time → Enter contact details (including phone for SMS) → Submit appointment request → Receive SMS confirmation → See confirmation toast
- **Success criteria**: Form validates inputs, stores appointments in KV storage, sends SMS to customer and salon staff, provides clear confirmation feedback

### Team Profiles
- **Functionality**: Showcases the salon owner and stylists with photos, bios, and specialties
- **Purpose**: Builds trust and personal connection by introducing the talented individuals behind the services
- **Trigger**: User navigates to "Team" or "About" section
- **Progression**: View team section → Browse stylist cards → Click for expanded bio and specialties → Optional: select stylist for appointment
- **Success criteria**: Each team member has compelling profile with personality; easy to understand individual specialties

### Hero Section
- **Functionality**: Eye-catching landing section featuring the Ocho Hair Lab brand and primary CTA
- **Purpose**: Immediately communicates brand identity and guides visitors toward booking
- **Trigger**: Page load
- **Progression**: Visual impact → Read tagline → Click primary CTA to book
- **Success criteria**: Strong first impression; clear value proposition; compelling call-to-action

### Navigation
- **Functionality**: Smooth scrolling navigation to different sections of the single-page site
- **Purpose**: Enables easy exploration of all site content
- **Trigger**: User clicks navigation links
- **Progression**: Click nav item → Smooth scroll to target section → Section highlighted
- **Success criteria**: Navigation remains accessible; smooth scrolling behavior; clear active section indication

### Admin Dashboard
- **Functionality**: Owner-only panel displaying all booked appointments with management capabilities
- **Purpose**: Allows salon owner to view, track, and manage customer appointments
- **Trigger**: Automatically displayed for app owner when logged in
- **Progression**: Owner views site → Admin panel appears below Team section → View all appointments sorted by date → Delete appointments if needed → Contact customers via phone/email
- **Success criteria**: Only visible to owner; displays all appointment details; allows deletion; shows contact information

## Edge Case Handling

- **No Services Available**: Display elegant empty state with message to check back soon
- **Form Validation Errors**: Inline validation with helpful error messages guiding correct input format
- **Double Booking Prevention**: Show unavailable time slots as disabled in the booking interface
- **Mobile Responsiveness**: All sections adapt gracefully to mobile viewports with touch-friendly interactions
- **Long Team Bios**: Truncate with "Read more" expansion to maintain layout consistency
- **Missing Images**: Fallback to elegant placeholder patterns or gradients
- **SMS Delivery Failures**: Graceful fallback to success message mentioning email confirmation if SMS fails
- **Non-owner Access**: Admin panel automatically hidden for regular visitors
- **Phone Number Formatting**: Accept various phone formats with validation for SMS delivery

## Design Direction

The design should evoke the feeling of stepping into a high-end beauty sanctuary - sophisticated yet welcoming, modern yet timeless. The aesthetic should reflect the warm beige and black from the logo, creating an atmosphere of refined luxury. Every element should feel intentional and polished, from smooth animations to carefully balanced whitespace, making visitors feel they're in expert hands.

## Color Selection

Drawing from the logo's elegant beige and bold black, the palette creates a sophisticated, spa-like atmosphere with warm neutral tones and striking contrast.

- **Primary Color**: Deep Black `oklch(0.15 0 0)` - Represents sophistication, professionalism, and the bold typography of the logo; used for primary text and key interactive elements
- **Secondary Colors**: 
  - Warm Beige `oklch(0.82 0.02 85)` - The signature logo background color creating warmth and luxury
  - Soft Taupe `oklch(0.75 0.015 75)` - A slightly darker neutral for cards and elevated surfaces
  - Cream `oklch(0.95 0.01 90)` - Near-white for backgrounds, providing softness over pure white
- **Accent Color**: Rich Espresso `oklch(0.25 0.01 70)` - A warm dark brown for hover states and subtle emphasis, bridging the black and beige
- **Foreground/Background Pairings**: 
  - Primary (Deep Black `oklch(0.15 0 0)`): White text `oklch(1 0 0)` - Ratio 16.5:1 ✓
  - Warm Beige `oklch(0.82 0.02 85)`: Deep Black `oklch(0.15 0 0)` - Ratio 10.8:1 ✓
  - Accent (Rich Espresso `oklch(0.25 0.01 70)`): White text `oklch(1 0 0)` - Ratio 12.3:1 ✓
  - Cream Background `oklch(0.95 0.01 90)`: Deep Black text `oklch(0.15 0 0)` - Ratio 14.2:1 ✓

## Font Selection

Typography should balance contemporary aesthetics with timeless elegance, reflecting both the modern "Lab" aspect and the refined beauty service offering.

- **Typographic Hierarchy**:
  - H1 (Hero Title/Logo Text): Unbounded Bold/64px/tight tracking (-0.02em) - Makes a statement on desktop
  - H2 (Section Headers): Unbounded SemiBold/36px/tight tracking
  - H3 (Service/Team Names): Inter SemiBold/24px/normal tracking
  - Body Text: Inter Regular/16px/relaxed line-height (1.6)
  - Small Text (Prices, Duration): Inter Medium/14px/normal tracking
  - CTA Buttons: Inter SemiBold/16px/slight letter spacing (0.01em)

## Animations

Animations should feel effortless and refined, enhancing the luxury experience without distracting from content. Use subtle fades and slides for section reveals as users scroll, gentle scale transforms on service cards on hover, and smooth page transitions when booking appointments. The booking form should have satisfying micro-interactions - checkmarks appearing, date pickers sliding in elegantly. All animations should use natural easing curves (ease-out for entrances, ease-in-out for transforms) keeping durations between 200-400ms for a polished, professional feel.

## Component Selection

- **Components**:
  - **Card**: For service items and team member profiles with hover effects revealing more information
  - **Button**: Primary CTAs for "Book Appointment" with the primary black style; secondary buttons in the warm beige
  - **Dialog**: For expanded team bios and booking form modal
  - **Form + Input + Label**: For the appointment booking form with proper validation
  - **Select**: For choosing services and stylists in booking flow
  - **Calendar**: React-day-picker integration for date selection
  - **Tabs**: Potential use for organizing services by category (cuts, color, treatments)
  - **Badge**: For highlighting stylist specialties or popular services
  - **Separator**: Subtle dividers between sections using the beige tone
  - **Scroll-area**: For smooth scrolling service and team sections
  - **Toast (Sonner)**: Success confirmations for appointment bookings

- **Customizations**:
  - Custom hero section with logo image integration and gradient background
  - Custom service cards with image backgrounds and gradient overlays
  - Smooth scroll navigation bar that becomes fixed on scroll with subtle backdrop blur
  - Custom date/time picker UI styled to match brand colors

- **States**:
  - Buttons: Rest state with black background, hover with subtle scale (1.02) and shadow, active with slight press effect
  - Service Cards: Rest with soft shadow, hover with lift (translateY -4px) and increased shadow, selected with border highlight
  - Form Inputs: Default with beige border, focus with black ring, error with destructive color, success with green accent
  - Navigation Links: Default in muted color, active section with black underline, hover with color transition

- **Icon Selection**:
  - Scissors (for cuts/services section)
  - Calendar (for booking/appointment actions)
  - Clock (for service duration)
  - User or Users (for team/about section)
  - Check or CheckCircle (for form success states)
  - MapPin (for location/contact)
  - Phone and Envelope (for contact methods)

- **Spacing**:
  - Section padding: py-20 md:py-32 for generous vertical breathing room
  - Container max-width: max-w-7xl with horizontal padding px-6 md:px-8
  - Card internal padding: p-6 md:p-8
  - Grid gaps: gap-6 for service/team grids, gap-4 for form elements
  - Section gaps: space-y-12 for major content blocks

- **Mobile**:
  - Hero text scales down from 64px to 40px, maintaining impact
  - Service/team grids: 1 column on mobile, 2 on tablet (md:grid-cols-2), 3 on desktop (lg:grid-cols-3)
  - Navigation: Collapsible hamburger menu on mobile with slide-in drawer
  - Booking form: Single column layout on mobile with larger touch targets (min 44px)
  - Fixed mobile bottom bar with "Book Now" CTA for easy access while scrolling
