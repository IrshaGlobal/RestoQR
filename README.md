# Restaurant QR Ordering SaaS - MVP

A modern QR-based restaurant ordering system that allows customers to scan table QR codes, browse menus, place orders without payment, and track order status in real-time.

## Features

### Customer Experience
- **QR Code Scanning**: Customers scan table-specific QR codes to access menus
- **Menu Browsing**: Browse by categories with search functionality
- **Cart System**: Add/remove items, adjust quantities, add special instructions
- **Order Tracking**: Real-time status updates (New → Preparing → Ready → Delivered) via Supabase Realtime
- **Help Requests**: One-tap waiter assistance button
- **Mobile-First**: Optimized for smartphones and tablets

### Staff Dashboard
- **Live Orders**: Real-time incoming orders via Supabase Realtime
- **Status Management**: Update order status with one tap
- **Kitchen Mode**: Fullscreen optimized view for kitchen tablets
- **Help Alerts**: High-priority notifications for customer assistance requests
- **Sound Notifications**: Audio alerts for new orders (with mute toggle)
- **Order Filtering**: Filter by status tabs (All, New, Preparing, Ready, Delivered)

### Admin Dashboard
- **Restaurant Settings**: Toggle open/closed status, edit name and currency
- **Menu Management**: Add/edit/delete menu items with images, allergens, prep times
- **Table Management**: Add/remove tables, generate and download QR codes
- **Staff Management**: Invite team members with role assignments
- **Statistics**: Today's orders, revenue, and active tables overview

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand with localStorage persistence
- **Routing**: React Router v7
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime subscriptions
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for menu images)
- **Hosting**: Vercel (recommended)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works great)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resto
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at https://app.supabase.com
   - Go to SQL Editor and run the contents of `supabase-setup.sql`
   - This creates all tables, RLS policies, indexes, and storage buckets

4. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

You can find these values in your Supabase dashboard under Project Settings > API.

5. Create your first admin user:
   - Go to Authentication > Users in Supabase dashboard
   - Click "Add User" and create an account
   - Note the user ID
   - Run this SQL in SQL Editor (replace placeholders):
   ```sql
   INSERT INTO restaurant_staff (user_id, restaurant_id, role)
   VALUES ('your-user-id-here', 'your-restaurant-id-here', 'admin');
   ```
   
   First, create a restaurant:
   ```sql
   INSERT INTO restaurants (name, currency, is_open) 
   VALUES ('My Restaurant', '$', true) 
   RETURNING id;
   ```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
resto/
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   ├── lib/
│   │   ├── utils.ts     # Utility functions
│   │   └── supabase.ts  # Supabase client & types
│   ├── pages/
│   │   ├── LandingPage.tsx      # Marketing landing page
│   │   ├── CustomerMenu.tsx     # Customer ordering interface
│   │   ├── StaffDashboard.tsx   # Staff order management
│   │   └── AdminDashboard.tsx   # Restaurant admin panel
│   ├── stores/
│   │   ├── cart.ts              # Shopping cart state
│   │   └── restaurant.ts        # Restaurant data state
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # Entry point
│   └── index.css        # Design system & global styles
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── tsconfig.json
```

## Database Schema

The application uses the following core tables:

- `restaurants`: Restaurant information and settings
- `tables`: Table numbers and QR code mappings
- `categories`: Menu item categories
- `menu_items`: Food and beverage items
- `orders`: Customer orders with status tracking
- `order_items`: Individual items within orders
- `help_requests`: Customer assistance requests
- `staff`: Staff member accounts and roles

## Demo Mode

The application includes demo data that works without a Supabase backend:

- **Landing Page**: [/](http://localhost:5173/)
- **Customer Menu**: `/menu?table=1&restaurant=demo`
- **Staff Dashboard**: `/staff`
- **Admin Dashboard**: `/admin`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

## Design System

The application uses a warm, appetizing color palette designed for restaurants:

- **Primary**: Orange/amber tones (#FF6B35) - stimulates appetite
- **Success**: Green for completed statuses
- **Warning**: Yellow for preparing/in-progress
- **Info**: Blue for new orders
- **Destructive**: Red for urgent alerts

All colors are defined as HSL values in `src/index.css` and referenced through semantic tokens in `tailwind.config.ts`.

## Key Features Implementation

### Cart Persistence
Shopping cart persists across page refreshes using Zustand's persist middleware with localStorage.

### Real-time Updates
Supabase Realtime subscriptions provide instant order updates without page refreshes.

### Kitchen Mode
Fullscreen-optimized view hides non-essential UI elements for mounted kitchen tablets.

### QR Code Generation
Each table has a unique QR code linking to the customer menu with table parameters encoded.

## Future Enhancements (Post-MVP)

- Online payment integration (Stripe/PayPal)
- Customer accounts and order history
- Loyalty programs and points
- Advanced analytics and heatmaps
- Thermal printer integration
- Inventory management
- Table reservations
- Multi-language support
- Dark mode

## License

MIT License - feel free to use this for your restaurant or SaaS product!

## Support

For issues or questions, please open an issue on the GitHub repository.
