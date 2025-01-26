import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface DashboardProps {
  holdings: {
    symbol: string;
    quantity: number;
    purchase_price: number;
    current_price: number;
  }[];
}

export function Dashboard({ holdings }: DashboardProps) {
  const totalValue = holdings.reduce(
    (sum, stock) => sum + stock.quantity * stock.current_price,
    0
  );

  const totalGainLoss = holdings.reduce(
    (sum, stock) =>
      sum + stock.quantity * (stock.current_price - stock.purchase_price),
    0
  );

  const bestPerformer = holdings.reduce((best, current) => {
    const currentReturn =
      ((current.current_price - current.purchase_price) / current.purchase_price) *
      100;
    const bestReturn =
      ((best.current_price - best.purchase_price) / best.purchase_price) * 100;
    return currentReturn > bestReturn ? current : best;
  }, holdings[0]);

  const chartData = holdings.map((stock) => ({
    name: stock.symbol,
    value: stock.quantity * stock.current_price,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <DollarSign className="w-6 h-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold">Total Portfolio Value</h3>
        </div>
        <p className="text-3xl font-bold">${totalValue.toFixed(2)}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          {totalGainLoss >= 0 ? (
            <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
          ) : (
            <TrendingDown className="w-6 h-6 text-red-500 mr-2" />
          )}
          <h3 className="text-lg font-semibold">Total Gain/Loss</h3>
        </div>
        <p
          className={`text-3xl font-bold ${
            totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'
          }`}
        >
          ${totalGainLoss.toFixed(2)}
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Best Performer</h3>
        {bestPerformer && (
          <>
            <p className="text-2xl font-bold">{bestPerformer.symbol}</p>
            <p className="text-green-500">
              +
              {(
                ((bestPerformer.current_price - bestPerformer.purchase_price) /
                  bestPerformer.purchase_price) *
                100
              ).toFixed(2)}
              %
            </p>
          </>
        )}
      </div>

      <div className="col-span-full bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Portfolio Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}