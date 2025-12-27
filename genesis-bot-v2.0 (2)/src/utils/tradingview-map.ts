export function mapToTradingViewSymbol(asset: string): string {
  const map: Record<string, string> = {
    'EUR/USD': 'FX:EURUSD',
    'GBP/USD': 'FX:GBPUSD',
    'USD/JPY': 'FX:USDJPY',
    'USD/CHF': 'FX:USDCHF',
    'AUD/USD': 'FX:AUDUSD',
    'EUR/JPY': 'FX:EURJPY',
    'GBP/JPY': 'FX:GBPJPY',
    'BTC/USDT': 'BINANCE:BTCUSDT',
    'ETH/USDT': 'BINANCE:ETHUSDT',
    'US100 (NASDAQ)': 'OANDA:NAS100',
    'US500 (S&P500)': 'OANDA:SPX500USD',
    'US30 (DOW)': 'OANDA:US30USD',
    'GER40 (DAX)': 'OANDA:DE30EUR'
  };
  return map[asset] || 'FX:EURUSD';
}

export function mapToTradingViewInterval(timeframe: string): string {
  const map: Record<string, string> = {
    'M1': '1',
    'M3': '3',
    'M5': '5',
    'M15': '15',
    'M30': '30',
    'H1': '60'
  };
  return map[timeframe] || '15';
}