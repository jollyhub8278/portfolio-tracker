import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { getStockPrice } from './lib/finnhub';
import { Dashboard } from './components/Dashboard';
import { StockList } from './components/StockList';
import { StockForm } from './components/StockForm';
import { Plus } from 'lucide-react';

interface Stock {
  id: string;
  symbol: string;
  company_name: string;
  quantity: number;
  purchase_price: number;
  current_price?: number;
}

function App() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStocks().catch((err) => {
      setError(err.message);
      setLoading(false);
    });
    const interval = setInterval(updatePrices, 10000); // Update prices every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStocks = async () => {
    try {
      // First, get the user's session
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) throw authError;
      if (!session) {
        throw new Error('Please sign in to view your portfolio');
      }

      // Get or create portfolio for the user
      let { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id')
        .single();

      if (portfolioError) {
        // If portfolio doesn't exist, create one
        const { data: newPortfolio, error: createError } = await supabase
          .from('portfolios')
          .insert({ user_id: session.user.id })
          .select()
          .single();

        if (createError) throw createError;
        portfolio = newPortfolio;

        // Add demo stocks for new portfolios
        const demoStocks = [
          { symbol: 'AAPL', name: 'Apple Inc.' },
          { symbol: 'MSFT', name: 'Microsoft Corporation' },
          { symbol: 'GOOGL', name: 'Alphabet Inc.' },
          { symbol: 'AMZN', name: 'Amazon.com Inc.' },
          { symbol: 'META', name: 'Meta Platforms Inc.' },
        ];

        for (const stock of demoStocks) {
          const price = await getStockPrice(stock.symbol);
          await supabase.from('stock_holdings').insert({
            portfolio_id: portfolio.id,
            symbol: stock.symbol,
            company_name: stock.name,
            quantity: 1,
            purchase_price: price,
          });
        }
      }

      const { data: holdings, error: holdingsError } = await supabase
        .from('stock_holdings')
        .select('*')
        .eq('portfolio_id', portfolio.id);

      if (holdingsError) throw holdingsError;

      const stocksWithPrices = await Promise.all(
        holdings.map(async (stock) => ({
          ...stock,
          current_price: await getStockPrice(stock.symbol),
        }))
      );

      setStocks(stocksWithPrices);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePrices = async () => {
    try {
      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => ({
          ...stock,
          current_price: await getStockPrice(stock.symbol),
        }))
      );
      setStocks(updatedStocks);
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  };

  const handleSubmit = async (stockData: Omit<Stock, 'id'>) => {
    try {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('id')
        .single();

      if (!portfolio) {
        setError('Portfolio not found');
        return;
      }

      if (selectedStock) {
        const { error } = await supabase
          .from('stock_holdings')
          .update(stockData)
          .eq('id', selectedStock.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('stock_holdings').insert({
          ...stockData,
          portfolio_id: portfolio.id,
        });

        if (error) throw error;
      }

      setShowForm(false);
      setSelectedStock(null);
      await fetchStocks();
    } catch (error) {
      console.error('Error saving stock:', error);
      setError('Failed to save stock. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stock_holdings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchStocks();
    } catch (error) {
      console.error('Error deleting stock:', error);
      setError('Failed to delete stock. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchStocks();
            }}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Tracker</h1>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Stock
          </button>
        </div>

        <Dashboard holdings={stocks} />
        <StockList
          stocks={stocks}
          onEdit={(stock) => {
            setSelectedStock(stock);
            setShowForm(true);
          }}
          onDelete={handleDelete}
        />

        {showForm && (
          <StockForm
            stock={selectedStock || undefined}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowForm(false);
              setSelectedStock(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;