# Mail Pilot - Project Documentation

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Demo Login**
   - Email: `demo@mailpilot.com`
   - Password: `demo123`

## 📋 Features Implemented

### ✅ Landing Page
- Modern SaaS design with hero section
- Features showcase
- Call-to-action buttons
- Responsive layout

### ✅ Authentication
- Login with validation
- Registration with password strength check
- Protected routes
- Auto-redirect when authenticated
- Token-based auth with localStorage

### ✅ Dashboard Overview
- Credit balance display
- Campaign statistics
- User count
- Average open rates
- Recent activity feed
- Quick action buttons

### ✅ User Management
- CSV file import with preview
- Excel file import (.xlsx, .xls)
- User listing with search
- Add users manually
- Delete users
- Status indicators

### ✅ Campaign Management
- Create campaigns
- Select email templates
- Choose recipients
- Credit validation before sending
- Campaign status tracking
- Performance metrics (open rate, click rate)
- Delete campaigns

### ✅ Email Template Builder
- Drag-and-drop interface
- Add text blocks (HTML)
- Add image blocks (URL)
- Reorder blocks
- Edit content inline
- Delete blocks
- Preview templates
- Save as JSON schema

### ✅ Template Management
- List all templates
- Create new templates
- Edit existing templates
- Duplicate templates
- Delete templates
- Preview final email

### ✅ Credits System
- Display available credits
- Track credit usage
- Credit history with transactions
- Purchase credit packages
- Prevent sending without credits
- Deduct credits on campaign send

### ✅ Settings Page
- Profile information
- Change password
- Email notification preferences
- Account deletion (danger zone)

## 🏗️ Architecture

### API Layer (Mock Mode)
All API calls are currently mocked with simulated responses. Files in `src/api/`:
- `config.js` - Centralized API endpoints
- `apiClient.js` - Axios wrapper with interceptors
- `auth.api.js` - Authentication endpoints
- `users.api.js` - User CRUD operations
- `campaigns.api.js` - Campaign operations
- `templates.api.js` - Template management
- `credits.api.js` - Credit tracking

To connect real backend: Set `MOCK_MODE = false` in each API file.

### State Management (Zustand)
Global state stores in `src/store/`:
- `authStore.js` - User authentication
- `userStore.js` - User management
- `campaignStore.js` - Campaign data
- `templateStore.js` - Template data
- `creditStore.js` - Credit balance and history

### Routing
- Public routes: Landing, Login, Register
- Protected routes: All dashboard pages
- Auto-redirect based on auth state

### Components
- **Common**: Button, Input, Modal, Loader, Card
- **Layout**: Sidebar, Navbar, DashboardLayout
- **Specialized**: EmailBuilder (drag-and-drop)

## 🎨 Styling

- **Framework**: Tailwind CSS
- **Color Scheme**: Primary blue (#3b82f6)
- **Responsive**: Mobile-first design
- **Dark Sidebar**: Professional dashboard look

## 📦 Dependencies

### Core
- react: ^18.3.1
- react-dom: ^18.3.1
- react-router-dom: ^7.1.3

### State & HTTP
- zustand: ^5.0.3
- axios: ^1.7.9

### UI & Interactions
- tailwindcss: ^3.4.17
- @dnd-kit/core: ^6.3.1
- @dnd-kit/sortable: ^9.0.0

### File Processing
- papaparse: ^5.4.1
- xlsx: ^0.18.5

## 🔧 Configuration Files

- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind customization
- `postcss.config.js` - PostCSS setup
- `.env.example` - Environment variables template

## 📱 Pages Structure

```
/                    → Landing Page
/login               → Login Page
/register            → Register Page
/dashboard           → Dashboard Overview
/dashboard/users     → User Management
/dashboard/campaigns → Campaign Management
/dashboard/templates → Template Builder
/dashboard/credits   → Credits & Purchases
/dashboard/settings  → User Settings
```

## 🎯 User Flow

1. **First Visit** → Landing page
2. **Sign Up/Login** → Authentication
3. **Dashboard** → View stats
4. **Import Users** → CSV/Excel upload
5. **Create Template** → Email builder
6. **Create Campaign** → Select template & users
7. **Send Campaign** → Credit deduction
8. **View Results** → Analytics

## 💾 Data Storage

- **Authentication**: localStorage (token + user)
- **Mock Data**: In-memory (resets on refresh)
- **Templates**: JSON schema format
- **Users**: Object array
- **Campaigns**: Object array with metrics

## 🔐 Security Features

- Protected routes with auth guards
- Token-based authentication
- Input validation on all forms
- XSS protection (React defaults)
- Password strength validation

## 🚀 Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production
npm run preview
```

Deploy the `dist` folder to any static hosting:
- Vercel
- Netlify  
- AWS S3 + CloudFront
- GitHub Pages

## 📊 Performance

- Code splitting via React Router
- Lazy loading components
- Optimized Tailwind CSS (purge unused)
- Fast Vite HMR in development
- Production builds < 500KB gzipped

## 🧪 Testing Tips

1. Login with demo credentials
2. Import sample CSV (create one with name, email columns)
3. Create email template with drag-and-drop
4. Create campaign and preview
5. Check credit deduction on send
6. View transaction history

## 🔄 Future Enhancements

- Real backend integration
- Email service provider integration (SendGrid, etc.)
- Advanced analytics dashboard
- A/B testing campaigns
- Scheduled campaigns
- Email automation workflows
- Contact segmentation
- Custom user fields
- Email open/click tracking
- Unsubscribe management

## 📝 Notes

- All data is mocked and resets on page refresh
- File uploads are parsed but not persisted
- Payment integration is demo-only
- API responses have 500ms simulated delay
- Templates stored as JSON, not raw HTML

## 🐛 Known Limitations

- No real email sending (mock only)
- No persistent storage
- Limited to single user session
- No real-time updates
- Basic analytics (no charts yet)

---

**Built by**: Senior Frontend Architect
**Stack**: React 18 + Vite + Tailwind CSS
**Date**: January 2026
