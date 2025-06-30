import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { tradingService } from '@/lib/api/trading';
import {
  OrderDto,
  PositionDto,
  TradingAccountDto,
  PriceUpdate,
  OrderBookUpdate,
  TradeUpdate,
  OrderSide,
  PositionSide,
} from '@/api/types';

interface MarketData {
  [symbol: string]: {
    price: number;
    change24h: number;
    volume24h: number;
    high24h: number;
    low24h: number;
    lastUpdate: number;
  };
}

interface OrderBook {
  [symbol: string]: {
    bids: [number, number][];
    asks: [number, number][];
    lastUpdate: number;
  };
}

interface TradingState {
  // Account
  selectedAccount: TradingAccountDto | null;
  accounts: TradingAccountDto[];
  
  // Market Data
  selectedSymbol: string;
  marketData: MarketData;
  orderBook: OrderBook;
  recentTrades: TradeUpdate[];
  
  // Orders & Positions
  openOrders: OrderDto[];
  orderHistory: OrderDto[];
  positions: PositionDto[];
  
  // UI State
  isLoadingOrders: boolean;
  isLoadingPositions: boolean;
  isPlacingOrder: boolean;
  
  // Actions
  setSelectedAccount: (account: TradingAccountDto | null) => void;
  setAccounts: (accounts: TradingAccountDto[]) => void;
  setSelectedSymbol: (symbol: string) => void;
  updateMarketData: (update: PriceUpdate) => void;
  updateOrderBook: (update: OrderBookUpdate) => void;
  addRecentTrade: (trade: TradeUpdate) => void;
  
  // Order Actions
  loadOrders: (status?: string) => Promise<void>;
  placeMarketOrder: (side: 'buy' | 'sell', quantity: number) => Promise<string>;
  placeLimitOrder: (side: 'buy' | 'sell', quantity: number, price: number) => Promise<string>;
  cancelOrder: (orderId: string) => Promise<void>;
  
  // Position Actions
  loadPositions: (status?: string) => Promise<void>;
  openPosition: (side: 'long' | 'short', quantity: number, leverage: number, stopLoss?: number, takeProfit?: number) => Promise<string>;
  closePosition: (positionId: string) => Promise<void>;
  updateStopLoss: (positionId: string, price: number) => Promise<void>;
  updateTakeProfit: (positionId: string, price: number) => Promise<void>;
  
  // WebSocket helpers
  subscribeToSymbol: (symbol: string) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  selectedAccount: null,
  accounts: [],
  selectedSymbol: 'BTC/USDT',
  marketData: {},
  orderBook: {},
  recentTrades: [],
  openOrders: [],
  orderHistory: [],
  positions: [],
  isLoadingOrders: false,
  isLoadingPositions: false,
  isPlacingOrder: false,
};

export const useTradingStore = create<TradingState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setSelectedAccount: (account) => set({ selectedAccount: account }),
    
    setAccounts: (accounts) => set({ accounts }),
    
    setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
    
    updateMarketData: (update) => {
      set((state) => ({
        marketData: {
          ...state.marketData,
          [update.symbol]: {
            price: update.price,
            change24h: update.change24h,
            volume24h: update.volume24h,
            high24h: update.high24h,
            low24h: update.low24h,
            lastUpdate: update.timestamp,
          },
        },
      }));
    },
    
    updateOrderBook: (update) => {
      set((state) => ({
        orderBook: {
          ...state.orderBook,
          [update.symbol]: {
            bids: update.bids,
            asks: update.asks,
            lastUpdate: update.timestamp,
          },
        },
      }));
    },
    
    addRecentTrade: (trade) => {
      set((state) => ({
        recentTrades: [trade, ...state.recentTrades.slice(0, 99)],
      }));
    },
    
    loadOrders: async (status) => {
      const { selectedAccount } = get();
      if (!selectedAccount) return;
      
      set({ isLoadingOrders: true });
      try {
        // Load all orders without status filter, then filter client-side
        const result = await tradingService.getOrders(selectedAccount.id);
        const orders = result.items;
        
        // Filter based on status
        const openOrders = orders.filter(o => 
          o.status === 'Pending' || 
          o.status === 'PartiallyFilled' || 
          o.status === 'New'
        );
        
        const completedOrders = orders.filter(o => 
          o.status === 'Filled' || 
          o.status === 'Cancelled' || 
          o.status === 'Rejected'
        );
        
        set({ 
          openOrders: openOrders,
          orderHistory: completedOrders 
        });
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        set({ isLoadingOrders: false });
      }
    },
    
    placeMarketOrder: async (side, quantity) => {
      const { selectedAccount, selectedSymbol } = get();
      if (!selectedAccount) throw new Error('No account selected');
      
      set({ isPlacingOrder: true });
      try {
        const orderId = await tradingService.createMarketOrder({
          tradingAccountId: selectedAccount.id,
          symbol: selectedSymbol,
          side: side === 'buy' ? OrderSide.Buy : OrderSide.Sell,
          quantity,
        });
        
        await get().loadOrders();
        return orderId;
      } finally {
        set({ isPlacingOrder: false });
      }
    },
    
    placeLimitOrder: async (side, quantity, price) => {
      const { selectedAccount, selectedSymbol } = get();
      if (!selectedAccount) throw new Error('No account selected');
      
      set({ isPlacingOrder: true });
      try {
        const orderId = await tradingService.createLimitOrder({
          tradingAccountId: selectedAccount.id,
          symbol: selectedSymbol,
          side: side === 'buy' ? OrderSide.Buy : OrderSide.Sell,
          quantity,
          price,
        });
        
        await get().loadOrders();
        return orderId;
      } finally {
        set({ isPlacingOrder: false });
      }
    },
    
    cancelOrder: async (orderId) => {
      await tradingService.cancelOrder(orderId);
      await get().loadOrders();
    },
    
    loadPositions: async (status) => {
      const { selectedAccount } = get();
      if (!selectedAccount) return;
      
      set({ isLoadingPositions: true });
      try {
        const positions = await tradingService.getPositions(selectedAccount.id, status);
        set({ positions });
      } catch (error) {
        console.error('Failed to load positions:', error);
      } finally {
        set({ isLoadingPositions: false });
      }
    },
    
    openPosition: async (side, quantity, leverage, stopLoss, takeProfit) => {
      const { selectedAccount, selectedSymbol } = get();
      if (!selectedAccount) throw new Error('No account selected');
      
      const positionId = await tradingService.openPosition({
        tradingAccountId: selectedAccount.id,
        symbol: selectedSymbol,
        side: side === 'long' ? PositionSide.Long : PositionSide.Short,
        quantity,
        leverage,
        stopLoss,
        takeProfit,
      });
      
      await get().loadPositions();
      return positionId;
    },
    
    closePosition: async (positionId) => {
      await tradingService.closePosition(positionId);
      await get().loadPositions();
    },
    
    updateStopLoss: async (positionId, price) => {
      await tradingService.updateStopLoss(positionId, { stopLossPrice: price });
      await get().loadPositions();
    },
    
    updateTakeProfit: async (positionId, price) => {
      await tradingService.updateTakeProfit(positionId, { takeProfitPrice: price });
      await get().loadPositions();
    },
    
    subscribeToSymbol: (symbol) => {
      // This is handled by the WebSocket hook
      console.log('Subscribing to symbol:', symbol);
    },
    
    reset: () => set(initialState),
  }))
);

// Subscribe to selected account changes
useTradingStore.subscribe(
  (state) => state.selectedAccount,
  (selectedAccount) => {
    if (selectedAccount) {
      useTradingStore.getState().loadOrders();
      useTradingStore.getState().loadPositions();
    }
  }
);