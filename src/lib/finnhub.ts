const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

export async function getStockPrice(symbol: string): Promise<number> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    const data = await response.json();
    return data.c; // Current price
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return 0;
  }
}