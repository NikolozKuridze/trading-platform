import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe, 
  Users, 
  TrendingUp,
  Lock,
  Smartphone,
  Clock,
  DollarSign,
  ChevronDown,
  Menu,
  X,
  Star,
  Check,
  Bitcoin,
  Banknote,
  Wallet,
  LineChart,
  Bot,
  Coins,
  Key
} from 'lucide-react';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  
  // Market data animation
  const [marketData, setMarketData] = useState([
    { symbol: 'BTC', price: 43250.50, change: 2.45 },
    { symbol: 'ETH', price: 2280.30, change: -0.82 },
    { symbol: 'BNB', price: 315.20, change: 1.23 },
    { symbol: 'SOL', price: 98.45, change: 5.67 },
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(coin => ({
        ...coin,
        price: coin.price * (1 + (Math.random() - 0.5) * 0.002),
        change: coin.change + (Math.random() - 0.5) * 0.1
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Trading Tools",
      description: "Professional charting, technical indicators, and real-time market data",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Grade Security",
      description: "Multi-signature wallets, 2FA, and cold storage for maximum protection",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Execution",
      description: "Ultra-low latency matching engine processing millions of orders per second",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Markets Access",
      description: "Trade 500+ cryptocurrencies across spot and futures markets",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80"
    }
  ];

  const tradingPairs = [
    { base: 'BTC', quote: 'USDT', volume: '2.8B' },
    { base: 'ETH', quote: 'USDT', volume: '1.5B' },
    { base: 'BNB', quote: 'USDT', volume: '892M' },
    { base: 'SOL', quote: 'USDT', volume: '654M' },
    { base: 'XRP', quote: 'USDT', volume: '421M' },
    { base: 'ADA', quote: 'USDT', volume: '312M' },
  ];

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      features: [
        'Spot Trading',
        'Basic Charts',
        'Mobile App',
        'Email Support',
        '0.1% Trading Fee'
      ]
    },
    {
      name: 'Pro',
      price: '$29',
      popular: true,
      features: [
        'Everything in Starter',
        'Futures Trading (10x)',
        'Advanced Charts',
        'API Access',
        'Priority Support',
        '0.075% Trading Fee'
      ]
    },
    {
      name: 'Enterprise',
      price: '$99',
      features: [
        'Everything in Pro',
        'Futures Trading (100x)',
        'Custom Trading Bots',
        'Dedicated Manager',
        'VIP Support',
        '0.05% Trading Fee'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black to-black" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight 
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-black/90 backdrop-blur-xl border-b border-gray-800' : ''
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <LineChart className="w-6 h-6" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                TradePro
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {['Markets', 'Trade', 'Futures', 'Earn', 'Learn'].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Log In
                </motion.button>
              </Link>
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-gray-800"
            >
              <div className="container mx-auto px-6 py-4 space-y-4">
                {['Markets', 'Trade', 'Futures', 'Earn', 'Learn'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-gray-300 hover:text-white transition-colors py-2"
                  >
                    {item}
                  </a>
                ))}
                <div className="pt-4 space-y-2">
                  <Link href="/auth/login" className="block">
                    <button className="w-full px-6 py-2 border border-gray-700 rounded-lg">
                      Log In
                    </button>
                  </Link>
                  <Link href="/auth/register" className="block">
                    <button className="w-full px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                Trade Crypto
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Like a Pro
                </span>
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Experience the future of cryptocurrency trading with advanced tools, 
                lightning-fast execution, and institutional-grade security.
              </p>
              
              {/* Live Market Ticker */}
              <div className="mb-8 p-4 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800">
                <div className="grid grid-cols-2 gap-4">
                  {marketData.map((coin, i) => (
                    <motion.div
                      key={coin.symbol}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Bitcoin className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium">{coin.symbol}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">${coin.price.toFixed(2)}</div>
                        <div className={`text-sm ${coin.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-medium text-lg flex items-center justify-center space-x-2 w-full sm:w-auto"
                  >
                    <span>Start Trading Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border border-gray-700 rounded-xl font-medium text-lg hover:bg-gray-900/50 transition-colors"
                >
                  View Demo
                </motion.button>
              </div>
            </motion.div>

            {/* Hero Image/Animation */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative w-full h-[600px]">
                {/* 3D Trading Interface Preview */}
                <motion.div
                  animate={{ 
                    rotateY: [0, 10, 0],
                    rotateX: [0, -5, 0]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl"
                  style={{ perspective: 1000 }}
                >
                  {/* Chart Lines */}
                  <svg className="absolute inset-0 w-full h-full">
                    <motion.path
                      d="M0,300 Q150,200 300,250 T600,200"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* UI Elements */}
                  <div className="absolute top-4 left-4 right-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex space-x-2">
                        {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
                          <div key={tf} className="px-3 py-1 bg-gray-700/50 rounded text-xs">
                            {tf}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Book Preview */}
                  <div className="absolute bottom-4 right-4 w-48 bg-gray-800/80 backdrop-blur rounded-lg p-3">
                    <div className="text-xs font-medium mb-2">Order Book</div>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between text-xs mb-1">
                        <span className="text-red-400">{(43250.50 + i * 10).toFixed(2)}</span>
                        <span className="text-gray-400">{(Math.random() * 2).toFixed(4)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-700 my-1" />
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between text-xs mb-1">
                        <span className="text-green-400">{(43250.50 - (i + 1) * 10).toFixed(2)}</span>
                        <span className="text-gray-400">{(Math.random() * 2).toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 text-gray-400" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { value: '$2.8B+', label: 'Daily Trading Volume' },
              { value: '500K+', label: 'Active Traders' },
              { value: '180+', label: 'Countries Supported' },
              { value: '0.05%', label: 'Lowest Fees' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-400 mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need to
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Trade Successfully
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Professional trading tools, real-time data, and advanced features designed for both beginners and experts
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Feature Showcase */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  whileHover={{ x: 10 }}
                  onClick={() => setActiveFeature(i)}
                  className={`p-6 rounded-xl cursor-pointer transition-all ${
                    activeFeature === i
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50'
                      : 'bg-gray-900/50 border border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      activeFeature === i
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                        : 'bg-gray-800'
                    }`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Feature Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[600px] rounded-2xl overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeFeature}
                  src={features[activeFeature].image}
                  alt={features[activeFeature].title}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trading Pairs */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Trade Top Cryptocurrencies
            </h2>
            <p className="text-xl text-gray-400">
              Access the most liquid markets with tight spreads
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tradingPairs.map((pair, i) => (
              <motion.div
                key={`${pair.base}/${pair.quote}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Coins className="w-10 h-10 text-yellow-500" />
                    <div>
                      <div className="font-semibold text-lg">{pair.base}/{pair.quote}</div>
                      <div className="text-sm text-gray-400">24h Volume</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${pair.volume}</div>
                  </div>
                </div>
                <Link href="/auth/register">
                  <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    Trade Now
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Choose Your Trading Plan
            </h2>
            <p className="text-xl text-gray-400">
              Start free and upgrade as you grow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-2xl ${
                  plan.popular
                    ? 'bg-gradient-to-b from-blue-500/20 to-purple-500/20 border-2 border-blue-500'
                    : 'bg-gray-900/50 border border-gray-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-1">
                    {plan.price}
                    {plan.price !== 'Free' && <span className="text-lg text-gray-400">/month</span>}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
        
        <div className="container mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Your Security is Our
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Top Priority
                </span>
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                We employ industry-leading security measures to ensure your funds and data remain safe at all times.
              </p>

              <div className="space-y-6">
                {[
                  { icon: <Shield />, title: 'Cold Storage', desc: '95% of funds stored offline' },
                  { icon: <Lock />, title: 'Multi-Sig Wallets', desc: 'Multiple signatures required' },
                  { icon: <Smartphone />, title: '2FA Protection', desc: 'Two-factor authentication' },
                  { icon: <Bot />, title: 'AI Monitoring', desc: '24/7 threat detection' },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative w-full h-[500px]">
                {/* Security Shield Animation */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-80 h-80 rounded-full border border-blue-500/20" />
                  <div className="absolute w-60 h-60 rounded-full border border-purple-500/20" />
                  <div className="absolute w-40 h-40 rounded-full border border-pink-500/20" />
                  
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute"
                  >
                    <Shield className="w-20 h-20 text-blue-400" />
                  </motion.div>
                </motion.div>

                {/* Floating Security Icons */}
                {[Lock, Key, Shield, Smartphone].map((Icon, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [-20, 20, -20],
                      x: [-10, 10, -10],
                    }}
                    transition={{
                      duration: 4 + i,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                    className={`absolute ${
                      i === 0 ? 'top-10 left-10' :
                      i === 1 ? 'top-10 right-10' :
                      i === 2 ? 'bottom-10 left-10' :
                      'bottom-10 right-10'
                    }`}
                  >
                    <Icon className="w-8 h-8 text-gray-600" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 lg:p-20 rounded-3xl overflow-hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }} />
            </div>

            <div className="relative text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl lg:text-6xl font-bold mb-6"
              >
                Ready to Start Trading?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl lg:text-2xl mb-10 text-gray-200 max-w-3xl mx-auto"
              >
                Join over 500,000 traders who trust our platform for their cryptocurrency trading needs
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-black rounded-xl font-medium text-lg hover:bg-gray-100 transition-colors"
                  >
                    Create Free Account
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-white rounded-xl font-medium text-lg hover:bg-white/10 transition-colors"
                >
                  Contact Sales
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex items-center justify-center space-x-6 text-sm"
              >
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Start trading in minutes</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-gray-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <LineChart className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold">TradePro</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-sm">
                The most trusted cryptocurrency trading platform with advanced tools and security.
              </p>
              <div className="flex space-x-4">
                {['Twitter', 'Discord', 'Telegram', 'GitHub'].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <Star className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {[
              {
                title: 'Products',
                links: ['Spot Trading', 'Futures Trading', 'Options', 'Staking', 'NFT Marketplace']
              },
              {
                title: 'Company',
                links: ['About Us', 'Careers', 'Press', 'Blog', 'Security']
              },
              {
                title: 'Support',
                links: ['Help Center', 'Contact Us', 'API Docs', 'System Status', 'Bug Bounty']
              }
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                © 2024 TradePro. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;