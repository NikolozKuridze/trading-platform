import { tradingApi } from './client';
import {
  CreateOrderRequest,
  MarketOrderRequest,
  LimitOrderRequest,
  OrderDto,
  PagedResultOfOrderDto,
  TradingAccountDto,
  CreateAccountRequest,
  CreateAccountViaAdminRequest,
  SuspendAccountRequest,
  OpenPositionRequest,
  PositionDto,
  UpdateStopLossRequest,
  UpdateTakeProfitRequest,
  WalletDto,
  CreateWalletRequest,
  DepositRequest,
  WithdrawRequest,
  PortfolioDto,
  PnLDto,
  TradingHoursAnalysisDto,
  SetPriceOverrideRequest,
  PriceOverrideDto,
  ExecuteTradeRequest,
  ManipulatePnLRequest,
  ForceCloseRequest,
  AdjustExecutionRequest,
  GlobalManipulationRequest,
} from '@/types/api.types';

export const tradingService = {
  // Trading Account Management
  async createAccount(data: CreateAccountRequest): Promise<string> {
    const response = await tradingApi.post<string>('/api/TradingAccounts', data);
    return response.data;
  },

  async createAccountViaAdmin(data: CreateAccountViaAdminRequest): Promise<string> {
    const response = await tradingApi.post<string>('/api/TradingAccounts/create-account-via-admin', data);
    return response.data;
  },

  async getAccount(accountId: string): Promise<TradingAccountDto> {
    const response = await tradingApi.get<TradingAccountDto>(`/api/TradingAccounts/${accountId}`);
    return response.data;
  },

  async getUserAccounts(): Promise<TradingAccountDto[]> {
    const response = await tradingApi.get<TradingAccountDto[]>('/api/TradingAccounts/user');
    return response.data;
  },

  async getClientAccountsForAdmin(clientUserId: string): Promise<TradingAccountDto[]> {
    const response = await tradingApi.get<TradingAccountDto[]>('/api/TradingAccounts/client-accounts-for-admin', {
      params: { clientUserId },
    });
    return response.data;
  },

  async activateAccount(accountId: string): Promise<void> {
    await tradingApi.post(`/api/TradingAccounts/${accountId}/activate`);
  },

  async deactivateAccount(accountId: string): Promise<void> {
    await tradingApi.post(`/api/TradingAccounts/${accountId}/deactivate`);
  },

  async suspendAccount(accountId: string, data: SuspendAccountRequest): Promise<void> {
    await tradingApi.post(`/api/TradingAccounts/${accountId}/suspend`, data);
  },

  // Order Management
  async createOrder(data: CreateOrderRequest): Promise<string> {
    const response = await tradingApi.post<string>('/api/Trading/order', data);
    return response.data;
  },

  async createMarketOrder(data: MarketOrderRequest): Promise<string> {
    const response = await tradingApi.post<string>('/api/Trading/order/market', data);
    return response.data;
  },

  async createLimitOrder(data: LimitOrderRequest): Promise<string> {
    const response = await tradingApi.post<string>('/api/Trading/order/limit', data);
    return response.data;
  },

  async getOrders(
    tradingAccountId: string,
    status?: string,
    symbol?: string,
    pageIndex: number = 1,
    pageSize: number = 50
  ): Promise<PagedResultOfOrderDto> {
    const response = await tradingApi.get<PagedResultOfOrderDto>(`/api/Trading/orders/${tradingAccountId}`, {
      params: { status, symbol, pageIndex, pageSize },
    });
    return response.data;
  },

  async cancelOrder(orderId: string): Promise<void> {
    await tradingApi.delete(`/api/Trading/order/${orderId}`);
  },

  // Futures Trading
  async openPosition(data: OpenPositionRequest): Promise<string> {
    const response = await tradingApi.post<string>('/api/Futures/position', data);
    return response.data;
  },

  async getPositions(tradingAccountId: string, status?: string): Promise<PositionDto[]> {
    const response = await tradingApi.get<PositionDto[]>(`/api/Futures/positions/${tradingAccountId}`, {
      params: { status },
    });
    return response.data;
  },

  async closePosition(positionId: string): Promise<void> {
    await tradingApi.delete(`/api/Futures/position/${positionId}`);
  },

  async updateStopLoss(positionId: string, data: UpdateStopLossRequest): Promise<void> {
    await tradingApi.put(`/api/Futures/position/${positionId}/stop-loss`, data);
  },

  async updateTakeProfit(positionId: string, data: UpdateTakeProfitRequest): Promise<void> {
    await tradingApi.put(`/api/Futures/position/${positionId}/take-profit`, data);
  },

  // Wallet Management
  async createWallet(data: CreateWalletRequest): Promise<string> {
    const response = await tradingApi.post<string>('/api/Wallets', data);
    return response.data;
  },

  async getWallets(tradingAccountId: string): Promise<WalletDto[]> {
    const response = await tradingApi.get<WalletDto[]>(`/api/Wallets/${tradingAccountId}`);
    return response.data;
  },

  async getPortfolio(tradingAccountId?: string): Promise<PortfolioDto> {
    const url = tradingAccountId 
      ? `/api/Wallets/${tradingAccountId}/portfolio`
      : '/api/Wallets/portfolio';
    const response = await tradingApi.get<PortfolioDto>(url);
    return response.data;
  },

  async deposit(data: DepositRequest): Promise<void> {
    await tradingApi.post('/api/Wallets/deposit', data);
  },

  async withdraw(data: WithdrawRequest): Promise<void> {
    await tradingApi.post('/api/Wallets/withdraw', data);
  },

  // Analytics
  async getPnL(
    tradingAccountId: string,
    startDate?: string,
    endDate?: string,
    symbol?: string
  ): Promise<PnLDto> {
    const response = await tradingApi.get<PnLDto>(`/api/Analytics/pnl/${tradingAccountId}`, {
      params: { startDate, endDate, symbol },
    });
    return response.data;
  },

  async getTradingHoursAnalysis(
    tradingAccountId: string,
    days: number = 30
  ): Promise<TradingHoursAnalysisDto> {
    const response = await tradingApi.get<TradingHoursAnalysisDto>(
      `/api/Analytics/trading-hours/${tradingAccountId}`,
      { params: { days } }
    );
    return response.data;
  },

  // Price Management (Admin)
  async setPriceOverride(data: SetPriceOverrideRequest): Promise<void> {
    await tradingApi.post('/api/PriceManagement/override', data);
  },

  async removePriceOverride(symbol: string): Promise<void> {
    await tradingApi.delete(`/api/PriceManagement/override/${symbol}`);
  },

  async getPriceOverrides(): Promise<PriceOverrideDto[]> {
    const response = await tradingApi.get<PriceOverrideDto[]>('/api/PriceManagement/overrides');
    return response.data;
  },

  async executeTrade(data: ExecuteTradeRequest): Promise<string> {
    const response = await tradingApi.post<string>('/api/PriceManagement/trade/execute', data);
    return response.data;
  },

  // Manager Control (Admin)
  async manipulatePnL(positionId: string, data: ManipulatePnLRequest): Promise<void> {
    await tradingApi.post(`/api/ManagerControl/position/${positionId}/manipulate-pnl`, data);
  },

  async forceClosePosition(positionId: string, data: ForceCloseRequest): Promise<void> {
    await tradingApi.post(`/api/ManagerControl/position/${positionId}/force-close`, data);
  },

  async adjustOrderExecution(orderId: string, data: AdjustExecutionRequest): Promise<void> {
    await tradingApi.post(`/api/ManagerControl/order/${orderId}/adjust-execution`, data);
  },

  async setGlobalManipulation(data: GlobalManipulationRequest): Promise<void> {
    await tradingApi.post('/api/ManagerControl/price/global-manipulation', data);
  },
};

// Helper functions for trading calculations
export const calculatePositionValue = (
  quantity: number,
  currentPrice: number,
  leverage: number = 1
): number => {
  return quantity * currentPrice * leverage;
};

export const calculatePnL = (
  entryPrice: number,
  currentPrice: number,
  quantity: number,
  side: 'long' | 'short'
): number => {
  if (side === 'long') {
    return (currentPrice - entryPrice) * quantity;
  } else {
    return (entryPrice - currentPrice) * quantity;
  }
};

export const calculatePnLPercentage = (
  entryPrice: number,
  currentPrice: number,
  side: 'long' | 'short',
  leverage: number = 1
): number => {
  const priceChangePercent = ((currentPrice - entryPrice) / entryPrice) * 100;
  return side === 'long' 
    ? priceChangePercent * leverage 
    : -priceChangePercent * leverage;
};

export const calculateLiquidationPrice = (
  entryPrice: number,
  leverage: number,
  side: 'long' | 'short',
  maintenanceMarginRate: number = 0.005
): number => {
  const liquidationThreshold = 1 - (1 / leverage) + maintenanceMarginRate;
  
  if (side === 'long') {
    return entryPrice * (1 - liquidationThreshold);
  } else {
    return entryPrice * (1 + liquidationThreshold);
  }
};

export const calculateMarginRequired = (
  quantity: number,
  price: number,
  leverage: number
): number => {
  return (quantity * price) / leverage;
};

export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: currency === 'BTC' || currency === 'ETH' ? 8 : 2,
  }).format(amount);
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};