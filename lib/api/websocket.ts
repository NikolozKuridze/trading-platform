import { PriceUpdate, OrderBookUpdate, TradeUpdate } from './types';

type MessageHandler = (data: any) => void;

interface WebSocketMessage {
  type: string;
  payload: any;
  channel?: string;
  symbol?: string;
}

class TradingWebSocket {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private shouldReconnect: boolean = true;
  private url: string;
  private subscriptions: Map<string, Set<MessageHandler>> = new Map();
  private messageQueue: any[] = [];
  private isConnected: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(url: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5193/ws') {
    this.url = url;
  }

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Append token to URL if provided
        const wsUrl = token ? `${this.url}?token=${token}` : this.url;
        console.log('Connecting to WebSocket:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          
          // Clear any pending reconnect
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
          }
          
          // Start ping interval to keep connection alive
          this.startPingInterval();
          
          // Flush any queued messages
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
          this.stopPingInterval();
          
          if (this.shouldReconnect && !this.reconnectTimeout) {
            this.reconnectTimeout = setTimeout(() => {
              this.reconnect(token);
            }, this.reconnectInterval);
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
      // Resubscribe to all channels after reconnection
      this.resubscribeAll();
    } catch (error) {
      console.error('Failed to reconnect:', error);
      
      // Schedule another reconnect
      if (this.shouldReconnect && !this.reconnectTimeout) {
        this.reconnectTimeout = setTimeout(() => {
          this.reconnect(token);
        }, this.reconnectInterval);
      }
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.stopPingInterval();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.subscriptions.clear();
    this.messageQueue = [];
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.send({ action: 'ping' });
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private handleMessage(data: WebSocketMessage) {
    const { type, payload, channel, symbol } = data;
    
    // Handle pong response
    if (type === 'pong') {
      return;
    }
    
    // Build the subscription key
    let subscriptionKey = type;
    if (channel) {
      subscriptionKey = channel;
    } else if (type && symbol) {
      subscriptionKey = `${type}.${symbol}`;
    }
    
    const handlers = this.subscriptions.get(subscriptionKey);
    
    if (handlers) {
      handlers.forEach(handler => handler(payload));
    }
  }

  subscribe(channel: string, handler: MessageHandler) {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    
    this.subscriptions.get(channel)!.add(handler);
    
    // Send subscription message to server
    this.send({
      action: 'subscribe',
      channel: channel,
    });
  }

  unsubscribe(channel: string, handler: MessageHandler) {
    const handlers = this.subscriptions.get(channel);
    if (handlers) {
      handlers.delete(handler);
      
      if (handlers.size === 0) {
        this.subscriptions.delete(channel);
        
        // Send unsubscription message to server
        this.send({
          action: 'unsubscribe',
          channel: channel,
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
    this.subscriptions.forEach((_, channel) => {
      this.send({
        action: 'subscribe',
        channel: channel,
      });
    });
  }

  // Market data methods - Binance integration
  subscribeToPriceUpdates(symbol: string, handler: (update: PriceUpdate) => void) {
    this.subscribe(`ticker.${symbol.toUpperCase()}`, handler);
  }

  unsubscribeFromPriceUpdates(symbol: string, handler: (update: PriceUpdate) => void) {
    this.unsubscribe(`ticker.${symbol.toUpperCase()}`, handler);
  }

  subscribeToOrderBook(symbol: string, handler: (update: OrderBookUpdate) => void) {
    this.subscribe(`orderbook.${symbol.toUpperCase()}`, handler);
  }

  unsubscribeFromOrderBook(symbol: string, handler: (update: OrderBookUpdate) => void) {
    this.unsubscribe(`orderbook.${symbol.toUpperCase()}`, handler);
  }

  subscribeToTrades(symbol: string, handler: (trade: TradeUpdate) => void) {
    this.subscribe(`trades.${symbol.toUpperCase()}`, handler);
  }

  unsubscribeFromTrades(symbol: string, handler: (trade: TradeUpdate) => void) {
    this.unsubscribe(`trades.${symbol.toUpperCase()}`, handler);
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
import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useTradingStore } from '@/lib/store/tradingStore';
import { binanceService } from '@/lib/services/binanceService';

export function useTradingWebSocket() {
  const { isAuthenticated } = useAuthStore();
  const { 
    selectedSymbol, 
    selectedAccount, 
    updateMarketData, 
    updateOrderBook, 
    addRecentTrade 
  } = useTradingStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const connectionRef = useRef<boolean>(false);

  // Initialize WebSocket connection
  useEffect(() => {
    const initConnection = async () => {
      if (isAuthenticated && token && !connectionRef.current) {
        try {
          await tradingWS.connect(token);
          connectionRef.current = true;
        } catch (error) {
          console.error('Failed to connect WebSocket:', error);
        }
      }
    };

    initConnection();

    return () => {
      if (!isAuthenticated) {
        tradingWS.disconnect();
        connectionRef.current = false;
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

    // Subscribe to WebSocket streams
    tradingWS.subscribeToPriceUpdates(selectedSymbol, handlePriceUpdate);
    tradingWS.subscribeToOrderBook(selectedSymbol, handleOrderBookUpdate);
    tradingWS.subscribeToTrades(selectedSymbol, handleTradeUpdate);

    // Optionally check stream status via REST API
    const checkStreamStatus = async () => {
      try {
        const tickerStatus = await binanceService.getTickerStreamStatus(selectedSymbol);
        const tradesStatus = await binanceService.getTradesStreamStatus(selectedSymbol);
        console.log('Stream status:', { ticker: tickerStatus, trades: tradesStatus });
      } catch (error) {
        console.error('Failed to check stream status:', error);
      }
    };

    checkStreamStatus();

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
      
      // Update the account in the accounts array
      const currentAccounts = useTradingStore.getState().accounts;
      const updatedAccounts = currentAccounts.map(acc => 
        acc.id === update.accountId ? { ...acc, ...update } : acc
      );
      useTradingStore.getState().setAccounts(updatedAccounts);
      
      // Update selected account if it's the one being updated
      const selectedAccount = useTradingStore.getState().selectedAccount;
      if (selectedAccount && selectedAccount.id === update.accountId) {
        useTradingStore.getState().setSelectedAccount({ ...selectedAccount, ...update });
      }
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
    isConnected: connectionRef.current,
  };
}