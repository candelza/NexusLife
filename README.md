# Faith Nexus Hub - Spiritual Prayer Community

A modern, spiritual prayer community application built with React, TypeScript, and Supabase. Connect with your faith community, share prayer requests, and grow together in your spiritual journey.

## ✨ Features

- **🙏 Prayer Management**: Create, share, and respond to prayer requests
- **👥 Community Groups**: Join care groups and connect with members
- **📅 Event Calendar**: Organize and attend spiritual events
- **🔔 Real-time Notifications**: Stay updated with community activities
- **👤 Profile Management**: Complete user profiles with spiritual information
- **🎨 Beautiful UI**: Spiritual design system with warm, peaceful colors
- **📱 Responsive Design**: Works perfectly on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/candelza/NexusLife.git
cd NexusLife

# Install dependencies
npm install

# Start local Supabase
supabase start

# Start development server
npm run dev
```

Visit `http://localhost:8080` to see the application.

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Custom spiritual design system
- **State Management**: React hooks + Supabase real-time subscriptions

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # shadcn/ui components
│   ├── PrayerCard.tsx # Prayer display component
│   ├── NotificationBell.tsx # Real-time notifications
│   └── ProfileEditDialog.tsx # Profile management
├── pages/              # Application pages
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Profile.tsx     # User profile
│   ├── Calendar.tsx    # Event calendar
│   └── AdminSettings.tsx # Admin panel
├── integrations/       # External integrations
│   └── supabase/      # Supabase client & types
└── hooks/             # Custom React hooks
```

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run migrations: `supabase db push`
3. Update environment variables in `src/integrations/supabase/client.ts`

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎨 Design System

The application uses a custom spiritual design system with:
- **Warm, peaceful color palette**
- **Divine purple-blue gradients**
- **Gentle animations and transitions**
- **Spiritual typography** (Playfair Display + Inter)

## 📱 Features in Detail

### Prayer System
- Create and share prayer requests
- Like and comment on prayers
- Share prayers to Facebook
- Private and public prayer options
- Prayer categories and urgent flags

### Community Groups
- Join care groups
- Group-based prayer sharing
- Member management
- Group events and activities

### Real-time Features
- Live notifications
- Real-time prayer updates
- Instant messaging system
- Live event updates

### Admin Features
- User management
- Prayer moderation
- System administration
- Analytics dashboard

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deploy to Vercel
```bash
npm run build
vercel --prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Support

For support and questions:
- Create an issue on GitHub
- Join our community discussions
- Contact the development team

---

**Built with ❤️ for the spiritual community**
