import axios from 'axios';

const BINANCE_API_URL = process.env.NEXT_PUBLIC_BINANCE_API_URL || 'http://localhost:5268';

const binanceApi = axios.create({
  baseURL: BINANCE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
binanceApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Binance API Error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
}

export interface Ticker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface OrderBookEntry {
  price: string;
  quantity: string;
}

export interface OrderBook {
  lastUpdateId: number;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface Kline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

export interface StreamStatus {
  isActive: boolean;
  symbol: string;
  streamType: string;
  lastUpdate?: number;
}

export const binanceService = {
  // Trading Pairs
  async getTradingPairs(search?: string, pageSize?: number, pageIndex?: number) {
    const response = await binanceApi.get<TradingPair[]>('/api/Binance/trading-pairs', {
      params: { search, pageSize, pageIndex }
    });
    return response.data;
  },

  // Single Ticker
  async getTicker(symbol: string) {
    const response = await binanceApi.get<Ticker>(`/api/Binance/ticker/${symbol}`);
    return response.data;
  },

  // All Tickers
  async getAllTickers() {
    const response = await binanceApi.get<Ticker[]>('/api/Binance/tickers');
    return response.data;
  },

  // Order Book
  async getOrderBook(symbol: string, limit: number = 100) {
    const response = await binanceApi.get<OrderBook>(`/api/Binance/orderbook/${symbol}`, {
      params: { limit }
    });
    return response.data;
  },

  // Historical Data
  async getHistoricalData(symbol: string, interval: string = '1h', limit: number = 500) {
    const response = await binanceApi.get<Kline[]>(`/api/Binance/historical-data/${symbol}`, {
      params: { interval, limit }
    });
    return response.data;
  },

  // Stream Status - Ticker
  async getTickerStreamStatus(symbol: string) {
    const response = await binanceApi.get<StreamStatus>(`/api/Binance/stream/ticker/${symbol}/status`);
    return response.data;
  },

  // Stream Status - Trades
  async getTradesStreamStatus(symbol: string) {
    const response = await binanceApi.get<StreamStatus>(`/api/Binance/stream/trades/${symbol}/status`);
    return response.data;
  },

  // Stop Ticker Stream
  async stopTickerStream(symbol: string) {
    const response = await binanceApi.delete(`/api/Binance/stream/ticker/${symbol}`);
    return response.data;
  },

  // Stop Trades Stream
  async stopTradesStream(symbol: string) {
    const response = await binanceApi.delete(`/api/Binance/stream/trades/${symbol}`);
    return response.data;
  },

  // Helper function to format price
  formatPrice(price: string | number, decimals: number = 2): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(decimals);
  },

  // Helper function to format volume
  formatVolume(volume: string | number): string {
    const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
    if (numVolume >= 1000000) {
      return `${(numVolume / 1000000).toFixed(2)}M`;
    } else if (numVolume >= 1000) {
      return `${(numVolume / 1000).toFixed(2)}K`;
    }
    return numVolume.toFixed(2);
  },

  // Helper function to calculate percentage change
  calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  },
};