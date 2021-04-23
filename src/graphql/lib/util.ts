type TradingPair = {
  displaySymbol: string
  baseCurrency: string
  quoteCurrency: string
  marketDataLast24HourPriceAggregate: any
}

export const filterArgsPerTickerPair = (
  tickerPair: string,
  tradingPairs: TradingPair[],
): TradingPair[] =>
  tradingPairs.filter((pair) => pair.displaySymbol === tickerPair)
