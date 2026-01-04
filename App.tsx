
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Globe, 
  Zap,
  LayoutDashboard,
  Newspaper,
  ChevronRight,
  Info
} from 'lucide-react';
import { MarketState, Stock, Position, NewsItem } from './types';
import { INITIAL_STOCKS, INITIAL_CASH, TICKER_INTERVAL, NEWS_INTERVAL } from './constants';
import { updateStockPrice } from './services/marketEngine';
import { generateMarketNews, getMarketAnalysis } from './services/geminiService';
import StockList from './components/StockList';
import MarketChart from './components/MarketChart';
import PortfolioView from './components/PortfolioView';

const App: React.FC = () => {
  const [stocks, setStocks] = useState<Record<string, Stock>>(INITIAL_STOCKS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('TECH');
  const [portfolio, setPortfolio] = useState({
    cash: INITIAL_CASH,
    positions: {} as Record<string, Position>
  });
  const [news, setNews] = useState<NewsItem[]>([]);
  const [analysis, setAnalysis] = useState<string>("");
  const [tradeAmount, setTradeAmount] = useState<number>(10);
  const [isBuying, setIsBuying] = useState(true);

  const selectedStock = stocks[selectedSymbol];

  // Price update ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(symbol => {
          next[symbol] = updateStockPrice(next[symbol]);
        });
        return next;
      });
    }, TICKER_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // News ticker
  useEffect(() => {
    const fetchNews = async () => {
      const newNews = await generateMarketNews(stocks);
      setNews(prev => [newNews, ...prev].slice(0, 10));

      // Apply news impact to stocks
      if (newNews.affectedSymbol && stocks[newNews.affectedSymbol]) {
        setStocks(prev => {
          const updated = { ...prev };
          const impactValue = newNews.impact === 'positive' ? 0.4 : newNews.impact === 'negative' ? -0.4 : 0;
          updated[newNews.affectedSymbol].trend += impactValue;
          return updated;
        });
      }
    };

    fetchNews(); // Initial news
    const interval = setInterval(fetchNews, NEWS_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Analysis effect
  useEffect(() => {
    const fetchAnalysis = async () => {
      setAnalysis("Consulting analyst tools...");
      const text = await getMarketAnalysis(selectedStock);
      setAnalysis(text);
    };
    fetchAnalysis();
  }, [selectedSymbol]);

  const handleTrade = (type: 'BUY' | 'SELL') => {
    const price = selectedStock.price;
    const cost = tradeAmount * price;

    if (type === 'BUY') {
      if (portfolio.cash < cost) return alert("Insufficient funds!");
      
      setPortfolio(prev => {
        const currentPos = prev.positions[selectedSymbol] || { symbol: selectedSymbol, shares: 0, averagePrice: 0 };
        const totalShares = currentPos.shares + tradeAmount;
        const newAvg = ((currentPos.shares * currentPos.averagePrice) + cost) / totalShares;
        
        return {
          cash: prev.cash - cost,
          positions: {
            ...prev.positions,
            [selectedSymbol]: { ...currentPos, shares: totalShares, averagePrice: newAvg }
          }
        };
      });
    } else {
      const currentPos = portfolio.positions[selectedSymbol];
      if (!currentPos || currentPos.shares < tradeAmount) return alert("Not enough shares!");

      setPortfolio(prev => ({
        cash: prev.cash + cost,
        positions: {
          ...prev.positions,
          [selectedSymbol]: { ...currentPos, shares: currentPos.shares - tradeAmount }
        }
      }));
    }
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-16 md:w-64 border-r border-zinc-800 bg-[#09090b] flex flex-col items-center md:items-stretch transition-all">
        <div className="p-6 mb-4 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <Zap className="text-white fill-white" size={20} />
          </div>
          <h1 className="text-xl font-black hidden md:block tracking-tighter italic">STELLAR<span className="text-indigo-500">TRADE</span></h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <button className="flex items-center gap-3 w-full p-3 bg-zinc-800 text-zinc-100 rounded-xl transition-all">
            <LayoutDashboard size={20} className="text-indigo-400" />
            <span className="font-medium hidden md:block">Terminal</span>
          </button>
          <button className="flex items-center gap-3 w-full p-3 text-zinc-500 hover:bg-zinc-900 rounded-xl transition-all group">
            <Activity size={20} className="group-hover:text-zinc-300" />
            <span className="font-medium hidden md:block">Activity</span>
          </button>
          <button className="flex items-center gap-3 w-full p-3 text-zinc-500 hover:bg-zinc-900 rounded-xl transition-all group">
            <Globe size={20} className="group-hover:text-zinc-300" />
            <span className="font-medium hidden md:block">Markets</span>
          </button>
        </nav>

        <div className="mt-auto border-t border-zinc-800 p-4">
          <StockList 
            stocks={stocks} 
            selectedSymbol={selectedSymbol} 
            onSelect={setSelectedSymbol} 
          />
        </div>
      </aside>

      {/* Main Trading Floor */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Selected Asset</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{selectedStock.symbol}</span>
                <span className="text-zinc-500 text-sm hidden sm:inline">— {selectedStock.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Market Status</span>
              <span className="text-emerald-400 text-xs font-bold flex items-center justify-end gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Chart and Trade */}
              <div className="lg:col-span-2 space-y-8">
                {/* Price Display */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                      ${selectedStock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <div className={`flex items-center gap-2 font-bold ${selectedStock.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedStock.changePercent >= 0 ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                      {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                  <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg self-start">
                    {['1H', '1D', '1W', '1M', 'ALL'].map(t => (
                      <button key={t} className={`px-3 py-1 rounded text-xs font-bold transition-all ${t === '1D' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Chart */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 relative group">
                  <MarketChart 
                    data={selectedStock.history} 
                    color={selectedStock.changePercent >= 0 ? '#10b981' : '#f43f5e'} 
                  />
                </div>

                {/* Analysis Section (AI) */}
                <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-600/20 p-2 rounded-lg">
                      <Info className="text-indigo-400" size={20} />
                    </div>
                    <div>
                      <h3 className="text-indigo-300 font-bold mb-1 flex items-center gap-2">
                        Stellar Analytics <span className="bg-indigo-600 text-[10px] px-1.5 py-0.5 rounded text-white font-black">AI</span>
                      </h3>
                      <p className="text-zinc-400 text-sm italic leading-relaxed">
                        &quot;{analysis}&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Entry and Portfolio */}
              <div className="space-y-8">
                {/* Trade Box */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
                  <div className="flex gap-2 mb-6">
                    <button 
                      onClick={() => setIsBuying(true)}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${isBuying ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-800 text-zinc-500'}`}
                    >
                      Buy
                    </button>
                    <button 
                      onClick={() => setIsBuying(false)}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${!isBuying ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'bg-zinc-800 text-zinc-500'}`}
                    >
                      Sell
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Amount (Shares)</label>
                      <div className="flex items-center gap-3 bg-black/50 p-2 rounded-2xl border border-zinc-800 focus-within:border-indigo-500 transition-all">
                        <button 
                          onClick={() => setTradeAmount(Math.max(1, tradeAmount - 1))}
                          className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400"
                        >
                          <Minus size={18} />
                        </button>
                        <input 
                          type="number" 
                          value={tradeAmount}
                          onChange={(e) => setTradeAmount(Math.max(1, parseInt(e.target.value) || 0))}
                          className="bg-transparent text-center flex-1 font-bold text-lg outline-none"
                        />
                        <button 
                          onClick={() => setTradeAmount(tradeAmount + 1)}
                          className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Market Price</span>
                        <span className="font-medium">${selectedStock.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Estimated Total</span>
                        <span className="font-bold text-white text-lg">${(tradeAmount * selectedStock.price).toFixed(2)}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleTrade(isBuying ? 'BUY' : 'SELL')}
                      className={`w-full py-4 rounded-2xl font-black text-lg transition-all transform active:scale-95 ${
                        isBuying 
                          ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/30' 
                          : 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/30'
                      }`}
                    >
                      Execute Trade
                    </button>
                  </div>
                </div>

                {/* Portfolio Summary */}
                <PortfolioView portfolio={portfolio} stocks={stocks} />
              </div>
            </div>

            {/* News Feed Section */}
            <section className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Newspaper className="text-zinc-400" size={24} />
                  <h2 className="text-2xl font-black">Market Wire</h2>
                </div>
                <div className="h-px flex-1 mx-6 bg-zinc-800" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-zinc-600 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                    Waiting for news broadcast...
                  </div>
                ) : (
                  news.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                        item.impact === 'positive' 
                          ? 'bg-emerald-900/5 border-emerald-900/30 hover:bg-emerald-900/10' 
                          : item.impact === 'negative' 
                          ? 'bg-rose-900/5 border-rose-900/30 hover:bg-rose-900/10' 
                          : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                          {item.timestamp}
                        </span>
                        {item.affectedSymbol && (
                          <span className="text-[10px] font-black bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
                            {item.affectedSymbol}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-zinc-100 mb-2 leading-tight">
                        {item.headline}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
