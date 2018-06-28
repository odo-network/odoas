/* @flow */
const PriceMap: Map<string, number> = new Map();

function getSymbolPrice(symbol: string = 'ETH') {
  return PriceMap.get(symbol);
}

function setSymbolPrice(symbol: string, price: number) {
  PriceMap.set(symbol, price);
}

export { getSymbolPrice, setSymbolPrice };
