# 🚀 Mail Pilot - Getting Started

## ✅ Project Status: READY TO RUN

Your Mail Pilot CRM is fully built and ready to use!

## 🎯 Quick Start (3 steps)

### 1. Start the Development Server
The server is already running at: http://localhost:5174/

If not running:
```bash
npm run dev
```

### 2. Open in Browser
Navigate to: http://localhost:5174/

### 3. Login with Demo Account
- **Email**: demo@mailpilot.com
- **Password**: demo123

## 🎨 What You'll See

### Landing Page (/)
- Modern SaaS design
- Feature showcase
- "Sign In" button → redirects to login

### Login Page (/login)
- Demo credentials are displayed
- Form validation
- Redirects to dashboard on success

### Dashboard (/dashboard)
- **Overview**: Stats, recent campaigns, quick actions
- **Users**: Import CSV/Excel, manage contacts
- **Campaigns**: Create and send email campaigns
- **Templates**: Drag-and-drop email builder
- **Credits**: Purchase and track credits (starts with 5000)
- **Settings**: Profile and preferences

## 🧪 Quick Testing Guide

### Test User Import
1. Go to Dashboard → Users
2. Click "Import CSV/Excel"
3. Create a simple CSV file:
   ```csv
   name,email,status
   John Doe,john@test.com,active
   Jane Smith,jane@test.com,active
   ```
4. Upload and preview
5. Click Import

### Test Email Template Builder
1. Go to Dashboard → Templates
2. Click "Create Template"
3. Enter name and subject
4. Click "Add Text Block" or "Add Image Block"
5. Drag blocks to reorder
6. Edit content inline
7. Save template

### Test Campaign Creation
1. Go to Dashboard → Campaigns
2. Click "Create Campaign"
3. Enter campaign name and subject
4. Select a template
5. Review recipient count and credit cost
6. Create campaign (saves as draft)
7. Click "Send Campaign" on the draft
8. Confirm credit deduction

### Test Credit Purchase
1. Go to Dashboard → Credits
2. View current balance (5000 initial)
3. Click a credit package
4. Complete purchase (demo mode)
5. See updated balance
6. Check transaction history

## 📁 Key Files to Explore

### API Layer
- `src/api/apiClient.js` - HTTP client with interceptors
- `src/api/*.api.js` - All API endpoints (currently mocked)

### State Management
- `src/store/*.js` - Zustand stores for global state

### Components
- `src/components/common/` - Reusable UI components
- `src/components/layout/` - Dashboard layout
- `src/components/dragDrop/EmailBuilder.jsx` - Email builder

### Pages
- `src/pages/Landing.jsx` - Landing page
- `src/pages/Auth/` - Login/Register
- `src/pages/Dashboard/` - All dashboard pages

## 🎨 Customization

### Change Branding
1. **Colors**: Edit `tailwind.config.js`
2. **Logo**: Search for ✈️ emoji and replace
3. **App Name**: Update "Mail Pilot" in components

### Connect Real Backend
1. Set `MOCK_MODE = false` in `src/api/*.api.js`
2. Update `VITE_API_BASE_URL` in `.env`
3. Implement backend endpoints matching the API structure

## 🛠️ Available Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install new package
npm install package-name
```

## 📱 Test on Different Devices

The app is fully responsive:
- **Desktop**: Optimized layout with sidebar
- **Tablet**: Adjusted spacing
- **Mobile**: Stacked layout, hamburger menu

## 🔍 Troubleshooting

### Port Already in Use
If port 5173/5174 is busy:
```bash
# Kill the process or specify a port
npm run dev -- --port 3000
```

### Dependencies Not Found
```bash
npm install
```

### Tailwind Styles Not Loading
Check that `src/styles/tailwind.css` is imported in `App.jsx`

### Routes Not Working
Make sure React Router is properly configured in `src/routes/AppRoutes.jsx`

## 🎯 Next Steps

1. ✅ Test all features with demo account
2. ✅ Try importing sample users
3. ✅ Build an email template
4. ✅ Create and send a campaign
5. ✅ Check credit tracking
6. 📝 Customize branding/colors
7. 🔌 Connect to real backend (optional)
8. 🚀 Deploy to production

## 📊 Production Build

When ready to deploy:

```bash
# Create optimized build
npm run build

# Test production build locally
npm run preview

# Deploy the 'dist' folder to:
# - Vercel
# - Netlify
# - AWS S3
# - Any static hosting
```

## 💡 Pro Tips

- **Credits**: Start with 5000 credits (mock data)
- **Templates**: Stored as JSON, easy to modify
- **Mock API**: Has 500ms delay to simulate network
- **Data**: Resets on page refresh (no persistence)
- **Validation**: All forms have real-time validation

## 🎉 You're All Set!

Your enterprise-grade CRM is ready. Start exploring at:
**http://localhost:5174/**

Login: demo@mailpilot.com / demo123

---

Need help? Check `PROJECT_DOCS.md` for detailed documentation.
