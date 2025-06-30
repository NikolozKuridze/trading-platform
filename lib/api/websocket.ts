import { PriceUpdate, OrderBookUpdate, TradeUpdate } from './types';

type MessageHandler = (data: any) => void;

class TradingWebSocket {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private shouldReconnect: boolean = true;
  private url: string;
  private subscriptions: Map<string, Set<MessageHandler>> = new Map();
  private messageQueue: any[] = [];
  private isConnected: boolean = false;

  constructor(url: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5193') {
    this.url = url;
  }

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Append token to URL if provided
        const wsUrl = token ? `${this.url}?token=${token}` : this.url;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.flushMessageQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnected = false;
          
          if (this.shouldReconnect) {
            setTimeout(() => this.reconnect(token), this.reconnectInterval);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private async reconnect(token?: string) {
    console.log('Attempting to reconnect WebSocket...');
    try {
      await this.connect(token);
      // Resubscribe to all channels
      this.resubscribeAll();
    } catch (error) {
      console.error('Failed to reconnect:', error);
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.messageQueue = [];
  }

  private handleMessage(data: any) {
    const { type, payload } = data;
    const handlers = this.subscriptions.get(type);
    
    if (handlers) {
      handlers.forEach(handler => handler(payload));
    }
  }

  subscribe(type: string, handler: MessageHandler) {
    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(type, new Set());
    }
    
    this.subscriptions.get(type)!.add(handler);
    
    // Send subscription message to server
    this.send({
      action: 'subscribe',
      channel: type,
    });
  }

  unsubscribe(type: string, handler: MessageHandler) {
    const handlers = this.subscriptions.get(type);
    if (handlers) {
      handlers.delete(handler);
      
      if (handlers.size === 0) {
        this.subscriptions.delete(type);
        
        // Send unsubscription message to server
        this.send({
          action: 'unsubscribe',
          channel: type,
        });
      }
    }
  }

  private send(message: any) {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message to send when connected
      this.messageQueue.push(message);
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  private resubscribeAll() {
    this.subscriptions.forEach((_, type) => {
      this.send({
        action: 'subscribe',
        channel: type,
      });
    });
  }

  // Market data methods
  subscribeToPriceUpdates(symbol: string, handler: (update: PriceUpdate) => void) {
    this.subscribe(`price.${symbol}`, handler);
  }

  unsubscribeFromPriceUpdates(symbol: string, handler: (update: PriceUpdate) => void) {
    this.unsubscribe(`price.${symbol}`, handler);
  }

  subscribeToOrderBook(symbol: string, handler: (update: OrderBookUpdate) => void) {
    this.subscribe(`orderbook.${symbol}`, handler);
  }

  unsubscribeFromOrderBook(symbol: string, handler: (update: OrderBookUpdate) => void) {
    this.unsubscribe(`orderbook.${symbol}`, handler);
  }

  subscribeToTrades(symbol: string, handler: (trade: TradeUpdate) => void) {
    this.subscribe(`trades.${symbol}`, handler);
  }

  unsubscribeFromTrades(symbol: string, handler: (trade: TradeUpdate) => void) {
    this.unsubscribe(`trades.${symbol}`, handler);
  }

  // Account updates
  subscribeToAccountUpdates(accountId: string, handler: MessageHandler) {
    this.subscribe(`account.${accountId}`, handler);
  }

  unsubscribeFromAccountUpdates(accountId: string, handler: MessageHandler) {
    this.unsubscribe(`account.${accountId}`, handler);
  }

  // Order updates
  subscribeToOrderUpdates(accountId: string, handler: MessageHandler) {
    this.subscribe(`orders.${accountId}`, handler);
  }

  unsubscribeFromOrderUpdates(accountId: string, handler: MessageHandler) {
    this.unsubscribe(`orders.${accountId}`, handler);
  }

  // Position updates
  subscribeToPositionUpdates(accountId: string, handler: MessageHandler) {
    this.subscribe(`positions.${accountId}`, handler);
  }

  unsubscribeFromPositionUpdates(accountId: string, handler: MessageHandler) {
    this.unsubscribe(`positions.${accountId}`, handler);
  }
}

// Export singleton instance
export const tradingWS = new TradingWebSocket();

// React hook for WebSocket
import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useTradingStore } from '@/lib/store/tradingStore';

export function useTradingWebSocket() {
  const { isAuthenticated } = useAuthStore();
  const { selectedSymbol, selectedAccount, updateMarketData, updateOrderBook, addRecentTrade } = useTradingStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  useEffect(() => {
    if (isAuthenticated && token) {
      tradingWS.connect(token);
    }

    return () => {
      if (!isAuthenticated) {
        tradingWS.disconnect();
      }
    };
  }, [isAuthenticated, token]);

  // Subscribe to market data for selected symbol
  useEffect(() => {
    if (!selectedSymbol || !isAuthenticated) return;

    const handlePriceUpdate = (update: PriceUpdate) => {
      updateMarketData(update);
    };

    const handleOrderBookUpdate = (update: OrderBookUpdate) => {
      updateOrderBook(update);
    };

    const handleTradeUpdate = (trade: TradeUpdate) => {
      addRecentTrade(trade);
    };

    tradingWS.subscribeToPriceUpdates(selectedSymbol, handlePriceUpdate);
    tradingWS.subscribeToOrderBook(selectedSymbol, handleOrderBookUpdate);
    tradingWS.subscribeToTrades(selectedSymbol, handleTradeUpdate);

    return () => {
      tradingWS.unsubscribeFromPriceUpdates(selectedSymbol, handlePriceUpdate);
      tradingWS.unsubscribeFromOrderBook(selectedSymbol, handleOrderBookUpdate);
      tradingWS.unsubscribeFromTrades(selectedSymbol, handleTradeUpdate);
    };
  }, [selectedSymbol, isAuthenticated, updateMarketData, updateOrderBook, addRecentTrade]);

  // Subscribe to account updates
  useEffect(() => {
    if (!selectedAccount || !isAuthenticated) return;

    const handleAccountUpdate = (update: any) => {
      // Handle account balance updates
      console.log('Account update:', update);
    };

    const handleOrderUpdate = (update: any) => {
      // Handle order updates
      console.log('Order update:', update);
      useTradingStore.getState().loadOrders();
    };

    const handlePositionUpdate = (update: any) => {
      // Handle position updates
      console.log('Position update:', update);
      useTradingStore.getState().loadPositions();
    };

    tradingWS.subscribeToAccountUpdates(selectedAccount.id, handleAccountUpdate);
    tradingWS.subscribeToOrderUpdates(selectedAccount.id, handleOrderUpdate);
    tradingWS.subscribeToPositionUpdates(selectedAccount.id, handlePositionUpdate);

    return () => {
      tradingWS.unsubscribeFromAccountUpdates(selectedAccount.id, handleAccountUpdate);
      tradingWS.unsubscribeFromOrderUpdates(selectedAccount.id, handleOrderUpdate);
      tradingWS.unsubscribeFromPositionUpdates(selectedAccount.id, handlePositionUpdate);
    };
  }, [selectedAccount, isAuthenticated]);

  const subscribeToSymbol = useCallback((symbol: string) => {
    // Additional method to manually subscribe to a symbol
    const handlePriceUpdate = (update: PriceUpdate) => {
      updateMarketData(update);
    };

    tradingWS.subscribeToPriceUpdates(symbol, handlePriceUpdate);

    return () => {
      tradingWS.unsubscribeFromPriceUpdates(symbol, handlePriceUpdate);
    };
  }, [updateMarketData]);

  return {
    subscribeToSymbol,
  };
}