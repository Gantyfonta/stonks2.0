
import React from 'react';
import { Stock } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockListProps {
  stocks: Record<string, Stock>;
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

const StockList: React.FC<StockListProps> = ({ stocks, selectedSymbol, onSelect }) => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <h3 className="text-sm font-semibold text-zinc-400 px-2 mb-2 uppercase tracking-wider">Watchlist</h3>
      {/* Explicitly cast Object.values to Stock[] to fix the 'unknown' type errors for property access */}
      {(Object.values(stocks) as Stock[]).map((stock) => {
        const isSelected = selectedSymbol === stock.symbol;
        const isUp = stock.changePercent >= 0;
        
        return (
          <button
            key={stock.symbol}
            onClick={() => onSelect(stock.symbol)}
            className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
              isSelected 
                ? 'bg-zinc-800 ring-1 ring-zinc-700 shadow-lg' 
                : 'hover:bg-zinc-900'
            }`}
          >
            <div className="flex flex-col items-start">
              <span className="font-bold text-zinc-100 group-hover:text-white transition-colors">
                {stock.symbol}
              </span>
              <span className="text-xs text-zinc-500 truncate max-w-[100px]">
                {stock.name}
              </span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-zinc-100">${stock.price.toFixed(2)}</div>
              <div className={`text-xs flex items-center justify-end gap-1 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default StockList;
