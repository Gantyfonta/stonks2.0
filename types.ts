
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  history: PricePoint[];
  volatility: number;
  sector: string;
  description: string;
  trend: number; // -1 to 1 impact on future price movements
}

export interface PricePoint {
  time: string;
  price: number;
}

export interface Position {
  symbol: string;
  shares: number;
  averagePrice: number;
}

export interface Portfolio {
  cash: number;
  positions: Record<string, Position>;
}

export interface NewsItem {
  id: string;
  timestamp: string;
  headline: string;
  content: string;
  impact: 'positive' | 'negative' | 'neutral';
  affectedSymbol?: string;
}

export interface MarketState {
  stocks: Record<string, Stock>;
  portfolio: Portfolio;
  news: NewsItem[];
  currentTime: number;
}
