import axios from 'axios';

const BINANCE_API_URL = process.env.NEXT_PUBLIC_BINANCE_API_URL || 'http://localhost:5268';

const binanceApi = axios.create({
  baseURL: BINANCE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const response = await binanceApi.get(`/api/Binance/orderbook/${symbol}`, {
      params: { limit }
    });
    return response.data;
  },

  // Historical Data
  async getHistoricalData(symbol: string, interval: string = '1h', limit: number = 500) {
    const response = await binanceApi.get(`/api/Binance/historical-data/${symbol}`, {
      params: { interval, limit }
    });
    return response.data;
  },
};