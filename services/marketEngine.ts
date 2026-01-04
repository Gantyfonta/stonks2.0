
import { Stock, PricePoint } from '../types';

/**
 * Simulates a single price tick for a stock based on its volatility and current trend.
 */
export const updateStockPrice = (stock: Stock): Stock => {
  const { price, volatility, trend } = stock;
  
  // Brownian motion style movement + trend bias
  // random range between -0.5 and 0.5
  const randomFactor = Math.random() - 0.5;
  
  // Trend can push the price in a direction (e.g. news impact)
  const drift = trend * volatility * 2;
  
  const changePercent = (randomFactor * volatility) + drift;
  const changeAmount = price * changePercent;
  const newPrice = Math.max(0.01, price + changeAmount);
  
  const newHistory: PricePoint[] = [
    ...stock.history.slice(-29), // Keep last 30 points
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), price: newPrice }
  ];

  return {
    ...stock,
    price: newPrice,
    change: newPrice - stock.history[stock.history.length - 1].price,
    changePercent: ((newPrice / stock.history[stock.history.length - 1].price) - 1) * 100,
    history: newHistory,
    // Slowly decay trend back to 0
    trend: trend * 0.95
  };
};
