
import React from 'react';
import { Portfolio, Stock, Position } from '../types';
import { Wallet, PieChart, Briefcase } from 'lucide-react';

interface PortfolioViewProps {
  portfolio: Portfolio;
  stocks: Record<string, Stock>;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ portfolio, stocks }) => {
  /* Explicitly cast Object.values to Position[] to avoid 'unknown' type errors in reduce callback */
  const totalStockValue = (Object.values(portfolio.positions) as Position[]).reduce((acc, pos) => {
    const currentPrice = stocks[pos.symbol]?.price || 0;
    return acc + (pos.shares * currentPrice);
  }, 0);

  const totalValue = portfolio.cash + totalStockValue;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Briefcase className="text-indigo-400" size={20} />
        <h2 className="text-lg font-bold">Your Portfolio</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-black/30 p-4 rounded-xl border border-zinc-800/50">
          <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
            <Wallet size={12} /> Cash Balance
          </div>
          <div className="text-xl font-bold text-zinc-100">${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-black/30 p-4 rounded-xl border border-zinc-800/50">
          <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
            <PieChart size={12} /> Net Worth
          </div>
          <div className="text-xl font-bold text-zinc-100">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">My Positions</h3>
        {Object.keys(portfolio.positions).length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-sm">
            No positions yet. Start trading!
          </div>
        ) : (
          <div className="space-y-3">
            {/* Explicitly cast Object.values to Position[] to avoid 'unknown' type errors in map callback */}
            {(Object.values(portfolio.positions) as Position[]).map((pos) => {
              if (pos.shares === 0) return null;
              const stock = stocks[pos.symbol];
              /* Handle potential undefined stock gracefully */
              if (!stock) return null;

              const currentValue = pos.shares * stock.price;
              const profitLoss = currentValue - (pos.shares * pos.averagePrice);
              const isProfit = profitLoss >= 0;

              return (
                <div key={pos.symbol} className="flex items-center justify-between p-3 bg-zinc-800/50 border border-zinc-800 rounded-xl">
                  <div>
                    <div className="font-bold">{pos.symbol}</div>
                    <div className="text-xs text-zinc-500">{pos.shares} Shares</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className={`text-xs ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfit ? '+' : ''}${profitLoss.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioView;
