// lib/utils/crypto-helpers.ts
import { binanceService } from '@/lib/api/binance';

// Cache for asset names and market data
let assetDataCache: Map<string, { name: string; marketCap: number; lastUpdate: number }> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getAssetName = async (symbol: string): Promise<string> => {
  try {
    // Check cache first
    const cached = assetDataCache.get(symbol);
    if (cached && Date.now() - cached.lastUpdate < CACHE_DURATION) {
      return cached.name;
    }

    // Get from trading pairs API
    const pairs = await binanceService.getTradingPairs(symbol, 10);
    const pair = pairs.find(p => p.baseAsset === symbol);
    
    if (pair) {
      // Store in cache
      const existing = assetDataCache.get(symbol) || { name: '', marketCap: 0, lastUpdate: 0 };
      assetDataCache.set(symbol, {
        ...existing,
        name: pair.baseAsset,
        lastUpdate: Date.now()
      });
      return pair.baseAsset;
    }
    
    return symbol;
  } catch (error) {
    console.error('Failed to get asset name:', error);
    return symbol;
  }
};

export const getMarketCapFromTicker = async (symbol: string): Promise<number> => {
  try {
    // Get ticker data for market cap calculation
    const ticker = await binanceService.getTicker(`${symbol}USDT`);
    
    if (ticker) {
      // Calculate approximate market cap from volume and price
      // This is a rough estimation - in production use proper market cap API
      const price = parseFloat(ticker.lastPrice);
      const volume24h = parseFloat(ticker.quoteVolume);
      
      // Very rough estimation based on volume/market cap ratios
      // Typically volume is 5-20% of market cap for major coins
      const estimatedMarketCap = volume24h * 10; // Rough 10% ratio
      
      // Store in cache
      const existing = assetDataCache.get(symbol) || { name: symbol, marketCap: 0, lastUpdate: 0 };
      assetDataCache.set(symbol, {
        ...existing,
        marketCap: estimatedMarketCap,
        lastUpdate: Date.now()
      });
      
      return estimatedMarketCap;
    }
    
    return 0;
  } catch (error) {
    console.error('Failed to get market cap:', error);
    return 0;
  }
};

// Get all market data from tickers
export const getAllMarketData = async () => {
  try {
    const tickers = await binanceService.getAllTickers();
    
    return tickers.map(ticker => {
      const baseAsset = ticker.symbol.replace('USDT', '').replace('BUSD', '');
      
      return {
        symbol: baseAsset,
        name: baseAsset, // Will be replaced by getAssetName if needed
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.quoteVolume),
        high24h: parseFloat(ticker.highPrice),
        low24h: parseFloat(ticker.lowPrice),
        marketCap: parseFloat(ticker.quoteVolume) * 10, // Rough estimation
      };
    });
  } catch (error) {
    console.error('Failed to get all market data:', error);
    return [];
  }
};