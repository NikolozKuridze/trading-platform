// Authentication Types
export interface LoginCommand {
  emailOrUsername: string;
  password: string;
  twoFactorCode?: string | null;
  rememberMe?: boolean | null;
}

export interface LoginForRedirectCommand {
  emailOrUsername: string;
  password: string;
}

export interface RegisterUserCommand {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phoneNumber: string;
}

export interface AuthenticationResult {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  name: string;
  exp: number;
  tradingAccountId: string | null;
  requiresTwoFactor: boolean;
}

export interface RefreshTokenCommand {
  accessToken: string;
  refreshToken: string;
}

export interface UseRecoveryCodeCommand {
  email: string;
  password: string;
  recoveryCode: string;
}

export interface ChangePasswordCommand {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SetupTwoFactorResponse {
  secret: string;
  qrCodeUri: string;
  manualEntryKey: string;
  appName: string;
}

export interface VerifyTwoFactorCommand {
  code: string;
}

export interface VerifyTwoFactorResponse {
  isVerified: boolean;
  recoveryCodes: string[];
}

export interface DisableTwoFactorCommand {
  code: string;
}

export interface UserSettingsQueryResponse {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string | null;
  isEmailConfirmed: boolean;
  isTwoFactorEnabled: boolean;
}

// Trading Account Types
export interface TradingAccountDto {
  id: string;
  userId: string;
  accountNumber: string;
  displayName: string;
  accountType: string;
  status: string;
  initialBalance: number;
  enableSpotTrading: boolean;
  enableFuturesTrading: boolean;
  maxLeverage: number;
  createdAt: string;
  verifiedAt: string | null;
  suspendedAt: string | null;
  suspensionReason: string | null;
}

export interface CreateAccountRequest {
  displayName: string;
}

export interface CreateAccountViaAdminRequest {
  clientUserId: string;
  displayName: string;
}

export interface SuspendAccountRequest {
  reason: string;
}

// Order Types
export enum OrderType {
  Market = 0,
  Limit = 1,
  StopLimit = 2,
  StopMarket = 3,
}

export enum OrderSide {
  Buy = 0,
  Sell = 1,
}

export interface CreateOrderRequest {
  tradingAccountId: string;
  symbol: string;
  orderType: OrderType;
  side: OrderSide;
  quantity: number;
  price?: number | null;
}

export interface MarketOrderRequest {
  tradingAccountId: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
}

export interface LimitOrderRequest {
  tradingAccountId: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
}

export interface OrderDto {
  id: string;
  tradingPairSymbol: string;
  orderType: string;
  side: string;
  price: number;
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  status: string;
  createdAt: string;
}

export interface PagedResultOfOrderDto {
  items: OrderDto[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Position Types
export enum PositionSide {
  Long = 0,
  Short = 1,
}

export interface OpenPositionRequest {
  tradingAccountId: string;
  symbol: string;
  side: PositionSide;
  quantity: number;
  leverage: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
}

export interface PositionDto {
  id: string;
  symbol: string;
  side: string;
  entryPrice: number;
  quantity: number;
  leverage: number;
  margin: number;
  liquidationPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercentage: number;
  currentPrice: number;
  status: string;
  openedAt: string;
  stopLoss: number | null;
  takeProfit: number | null;
}

export interface UpdateStopLossRequest {
  stopLossPrice: number;
}

export interface UpdateTakeProfitRequest {
  takeProfitPrice: number;
}

// Wallet Types
export interface CreateWalletRequest {
  tradingAccountId: string;
  currency: string;
}

export interface WalletDto {
  id: string;
  currency: string;
  availableBalance: number;
  lockedBalance: number;
  totalBalance: number;
  usdEquivalent: number;
  lastPriceUpdate: string;
}

export interface DepositRequest {
  tradingAccountId: string;
  currency: string;
  amount: number;
}

export interface WithdrawRequest {
  tradingAccountId: string;
  currency: string;
  amount: number;
}

export interface AssetHoldingDto {
  currency: string;
  balance: number;
  usdPrice: number;
  usdValue: number;
  percentage: number;
  change24h: number;
}

export interface PortfolioDto {
  tradingAccountId: string;
  totalUsdValue: number;
  holdings: AssetHoldingDto[];
  timestamp: string;
}

// Analytics Types
export interface PnLDto {
  totalPnL: number;
  realizedPnL: number;
  unrealizedPnL: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  dailyBreakdown: DailyPnLDto[];
}

export interface DailyPnLDto {
  date: string;
  pnL: number;
  tradeCount: number;
  volume: number;
}

export interface TradingHoursAnalysisDto {
  hourlyPerformance: HourlyPerformanceDto[];
  bestHour: number;
  worstHour: number;
  bestHourPnL: number;
  worstHourPnL: number;
}

export interface HourlyPerformanceDto {
  hour: number;
  tradeCount: number;
  totalPnL: number;
  averagePnL: number;
  winRate: number;
}

// Price Management Types
export interface SetPriceOverrideRequest {
  symbol: string;
  price: number;
  expiresAt?: string | null;
  reason?: string | null;
}

export interface PriceOverrideDto {
  id: string;
  managerId: string;
  symbol: string;
  overridePrice: number;
  effectiveFrom: string;
  effectiveUntil: string | null;
  isActive: boolean;
  reason: string | null;
}

export interface ExecuteTradeRequest {
  buyOrderId: string;
  sellOrderId: string;
  price: number;
  quantity: number;
}

// Manager Control Types
export interface ManipulatePnLRequest {
  targetPrice: number;
}

export interface ForceCloseRequest {
  closePrice: number;
  reason: string;
}

export interface AdjustExecutionRequest {
  overridePrice: number;
}

export interface GlobalManipulationRequest {
  symbol: string;
  targetPrice: number;
  durationMinutes: number;
}

// Error Response
export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
}

// WebSocket Types
export interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
  volume24h: number;
  change24h: number;
  high24h: number;
  low24h: number;
}

export interface OrderBookUpdate {
  symbol: string;
  bids: [number, number][];
  asks: [number, number][];
  timestamp: number;
}

export interface TradeUpdate {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: number;
}