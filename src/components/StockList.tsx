import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface Stock {
  id: string;
  symbol: string;
  company_name: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
}

interface StockListProps {
  stocks: Stock[];
  onEdit: (stock: Stock) => void;
  onDelete: (id: string) => void;
}

export function StockList({ stocks, onEdit, onDelete }: StockListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Purchase Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gain/Loss
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.map((stock) => {
              const gainLoss =
                (stock.current_price - stock.purchase_price) * stock.quantity;
              const gainLossPercentage =
                ((stock.current_price - stock.purchase_price) /
                  stock.purchase_price) *
                100;

              return (
                <tr key={stock.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {stock.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {stock.company_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {stock.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${stock.purchase_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${stock.current_price.toFixed(2)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      gainLoss >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    ${gainLoss.toFixed(2)} ({gainLossPercentage.toFixed(2)}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(stock)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(stock.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}