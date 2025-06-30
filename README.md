# Premium Trading Platform

A modern, professional cryptocurrency trading platform built with Next.js 14, TypeScript, and Tailwind CSS. Features include spot and futures trading, real-time market data, portfolio management, and advanced analytics.

![Trading Platform](https://via.placeholder.com/1200x600/1a1a1a/3b82f6?text=Premium+Trading+Platform)

## Features

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Two-factor authentication (2FA) support
- Secure session management
- Password reset flow
- Email verification

### 📊 Trading Features
- **Spot Trading**: Buy and sell cryptocurrencies instantly
- **Futures Trading**: Trade with leverage up to 125x
- **Real-time Charts**: Professional trading charts powered by TradingView
- **Order Book**: Live order book with depth visualization
- **Order Types**: Market, Limit, Stop-Loss, Take-Profit
- **Position Management**: Track and manage open positions
- **Trade History**: Complete transaction history

### 💰 Wallet & Portfolio
- Multi-currency wallet support
- Secure deposit/withdrawal interface
- Real-time balance updates
- Portfolio performance tracking
- Transaction history
- P&L analytics

### 📈 Analytics & Reporting
- Daily/Weekly/Monthly P&L reports
- Trading performance metrics
- Win rate and profit factor analysis
- Best/Worst trading hours analysis
- Portfolio distribution charts

### 🎨 User Experience
- Responsive design (mobile, tablet, desktop)
- Dark/Light theme support
- Real-time notifications
- Multi-language ready (i18n)
- Advanced data tables with filtering/sorting
- Smooth animations and transitions

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **API Client**: Axios with interceptors
- **Charts**: TradingView Lightweight Charts
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- npm 9+ or yarn
- Docker (for containerized deployment)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-username/trading-platform.git
cd trading-platform
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and update the API endpoints:

```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:5168
NEXT_PUBLIC_TRADING_API_URL=http://localhost:5193
```

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Deployment

### Build and run with Docker

```bash
# Build the Docker image
docker build -t trading-platform .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_AUTH_API_URL=http://localhost:5168 \
  -e NEXT_PUBLIC_TRADING_API_URL=http://localhost:5193 \
  trading-platform
```

### Using Docker Compose

```bash
docker-compose up -d
```

This will start the application on port 3000.

## Project Structure

```
trading-platform/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── trading/          # Trading components
│   ├── wallet/           # Wallet components
│   ├── dashboard/        # Dashboard components
│   └── layout/           # Layout components
├── lib/                   # Utilities and services
│   ├── api/              # API service layer
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── public/               # Static assets
├── styles/               # Global styles
└── docker/               # Docker configuration
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript compiler
npm run format          # Format code with Prettier

# Docker
npm run docker:build    # Build Docker image
npm run docker:run      # Run Docker container
```

## API Integration

The platform integrates with two backend services:

1. **Authentication API** (`http://localhost:5168`)
   - User registration/login
   - Session management
   - 2FA setup/verification
   - Password reset

2. **Trading API** (`http://localhost:5193`)
   - Trading operations
   - Market data
   - Wallet management
   - Analytics

## Key Features Implementation

### Authentication Flow
- JWT tokens stored in localStorage
- Automatic token refresh
- Protected routes with auth guards
- Persistent sessions

### Real-time Updates
- WebSocket connection for live prices
- Order book updates
- Position tracking
- Balance updates

### State Management
- Global auth state with Zustand
- Trading state management
- Optimistic UI updates
- Cache management with React Query

## Performance Optimizations

- Server-side rendering (SSR) for initial page loads
- Static generation for marketing pages
- Image optimization with Next.js Image
- Code splitting and lazy loading
- API response caching
- Debounced search inputs
- Virtual scrolling for large lists

## Security Considerations

- HTTPS only in production
- Secure HttpOnly cookies for auth tokens
- CSRF protection
- Input validation and sanitization
- Rate limiting on API calls
- Content Security Policy (CSP) headers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@tradingplatform.com or join our Slack channel.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [TradingView](https://www.tradingview.com/) - Charting library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework