/* @flow */
declare module 'ccxt' {
  // error.js -----------------------------------------

  declare export class BaseError extends Error {
    constructor(message: string): this;
  }

  declare export class ExchangeError extends BaseError {
    constructor(message: string): this;
  }

  declare export class NotSupported extends ExchangeError {
    constructor(message: string): this;
  }

  declare export class AuthenticationError extends ExchangeError {
    constructor(message: string): this;
  }

  declare export class InvalidNonce extends ExchangeError {
    constructor(message: string): this;
  }

  declare export class InsufficientFunds extends ExchangeError {
    constructor(message: string): this;
  }

  declare export class InvalidOrder extends ExchangeError {
    constructor(message: string): this;
  }

  declare export class OrderNotFound extends InvalidOrder {
    constructor(message: string): this;
  }

  declare export class OrderNotCached extends InvalidOrder {
    constructor(message: string): this;
  }

  declare export class CancelPending extends InvalidOrder {
    constructor(message: string): this;
  }

  declare export class NetworkError extends BaseError {
    constructor(message: string): this;
  }

  declare export class DDoSProtection extends NetworkError {
    constructor(message: string): this;
  }

  declare export class RequestTimeout extends NetworkError {
    constructor(message: string): this;
  }

  declare export class ExchangeNotAvailable extends NetworkError {
    constructor(message: string): this;
  }

  // -----------------------------------------------

  declare export var version: string;
  declare export var exchanges: string[];

  declare export interface MinMax {
    max: number;
    min: number;
  }

  declare export interface Market {
    [key: string]: any;
    base: string;
    id: string;
    info: any;
    limits: { amount: MinMax, price: MinMax, cost?: MinMax };
    lot: number;
    precision: { amount: number, price: number };
    quote: string;
    symbol: string;
  }

  declare export interface Order {
    id: string;
    info: {};
    timestamp: number;
    datetime: string;
    status: 'open' | 'closed' | 'canceled';
    symbol: string;
    type: 'market' | 'limit';
    side: 'buy' | 'sell';
    price: number;
    cost: number;
    amount: number;
    filled: number;
    remaining: number;
    fee: number;
  }

  declare export interface OrderBook {
    asks: [number, number][];
    bids: [number, number][];
    datetime: string;
    timestamp: number;
    nonce: number;
  }

  declare export interface Trade {
    amount: number; // amount of base currency
    datetime: string; // ISO8601 datetime with milliseconds;
    id: string; // string trade id
    info: {}; // the original decoded JSON as is
    order?: string; // string order id or undefined/None/null
    price: number; // float price in quote currency
    timestamp: number; // Unix timestamp in milliseconds
    type?: 'market' | 'limit'; // order type, 'market', 'limit' or undefined/None/null
    side: 'buy' | 'sell';
    symbol: string; // symbol in CCXT format
  }

  declare export interface Ticker {
    ask: number;
    average?: number;
    baseVolume?: number;
    bid: number;
    change?: number;
    close?: number;
    datetime: string;
    first?: number;
    high: number;
    info: Object;
    last?: number;
    low: number;
    open?: number;
    percentage?: number;
    quoteVolume?: number;
    symbol: string;
    timestamp: number;
    vwap?: number;
  }

  declare export interface Tickers {
    info: any;
    [symbol: string]: Ticker;
  }

  declare export interface Currency {
    id: string;
    code: string;
  }

  declare export interface Balance {
    free: number;
    used: number;
    total: number;
  }

  declare export interface PartialBalances {
    [currency: string]: number;
  }

  declare export interface Balances {
    info: any;
    [key: string]: Balance;
  }

  declare export interface DepositAddress {
    currency: string;
    address: string;
    status: string;
    info: any;
  }

  // timestamp, open, high, low, close, volume
  declare export type OHLCV = [number, number, number, number, number, number];

  declare export class Exchange {
    // constructor(config?: { [$Keys<Exchange>]: $ElementType<Exchange, key> }): this;
    // allow dynamic keys
    [key: string]: any;
    // properties
    hash: any;
    hmac: any;
    jwt: any;
    binaryConcat: any;
    stringToBinary: any;
    stringToBase64: any;
    base64ToBinary: any;
    base64ToString: any;
    binaryToString: any;
    utf16ToBase64: any;
    urlencode: any;
    pluck: any;
    unique: any;
    extend: any;
    deepExtend: any;
    flatten: any;
    groupBy: any;
    indexBy: any;
    sortBy: any;
    keysort: any;
    decimal: any;
    safeFloat: any;
    safeString: any;
    safeInteger: any;
    safeValue: any;
    capitalize: any;
    json: JSON.stringify;
    sum: any;
    ordered: any;
    aggregate: any;
    truncate: any;
    name: string;
    nodeVersion: string;
    fees: Object;
    enableRateLimit: boolean;
    countries: string;
    // set by loadMarkets
    markets: { [symbol: string]: Market };
    marketsById: { [id: string]: Market };
    currencies: { [symbol: string]: Currency };
    ids: string[];
    symbols: string[];
    id: string;
    proxy: string;
    parse8601: typeof Date.parse;
    milliseconds: typeof Date.now;
    rateLimit: number; // milliseconds = seconds * 1000
    timeout: number; // milliseconds
    verbose: boolean;
    twofa: boolean; // two-factor authentication
    substituteCommonCurrencyCodes: boolean;
    timeframes: any;
    has: { [what: string]: any }; // https://github.com/ccxt/ccxt/pull/1984
    balance: Object;
    orderbooks: Object;
    orders: Object;
    trades: Object;
    userAgent: { 'User-Agent': string } | false;

    // methods
    getMarket(symbol: string): Market;
    describe(): any;
    defaults(): any;
    nonce(): number;
    encodeURIComponent(...args: any[]): string;
    checkRequiredCredentials(): void;
    initRestRateLimiter(): void;
    handleResponse(url: string, method: string, headers?: any, body?: any): any;
    defineRestApi(api: any, methodName: any, options?: { [x: string]: any }): void;
    fetch(url: string, method?: string, headers?: any, body?: any): Promise<any>;
    fetch2(
      path: any,
      api?: string,
      method?: string,
      params?: { [x: string]: any },
      headers?: any,
      body?: any,
    ): Promise<any>;
    setMarkets(markets: Market[], currencies?: Currency[]): { [symbol: string]: Market };
    loadMarkets(reload?: boolean): Promise<{ [symbol: string]: Market }>;
    fetchTicker(symbol: string, params?: { [x: string]: any }): Promise<Ticker>;
    fetchTickers(
      symbols?: string[],
      params?: { [x: string]: any },
    ): Promise<{ [x: string]: Ticker }>;
    fetchMarkets(): Promise<Market[]>;
    fetchOrderStatus(id: string, market: string): Promise<string>;
    encode(str: string): string;
    decode(str: string): string;
    account(): Balance;
    commonCurrencyCode(currency: string): string;
    market(symbol: string): Market;
    marketId(symbol: string): string;
    marketIds(symbols: string[]): string[];
    symbol(symbol: string): string;
    extractParams(str: string): string[];
    createOrder(
      symbol: string,
      type: string,
      side: string,
      amount: string,
      price?: string,
      params?: string,
    ): Promise<any>;
    fetchBalance(params?: any): Promise<Balances>;
    fetchTotalBalance(params?: any): Promise<PartialBalances>;
    fetchUsedBalance(params?: any): Promise<PartialBalances>;
    fetchFreeBalance(params?: any): Promise<PartialBalances>;
    fetchOrderBook(symbol: string, limit?: number, params?: any): Promise<OrderBook>;
    fetchTicker(symbol: string): Promise<Ticker>;
    fetchTickers(symbols?: string[]): Promise<Tickers>;
    fetchTrades(symbol: string, since?: number, limit?: number, params?: {}): Promise<Trade[]>;
    fetchOHLCV(
      symbol: string,
      timeframe?: string,
      since?: number,
      limit?: number,
      params?: any,
    ): Promise<OHLCV[]>;
    fetchOrders(symbol?: string, since?: number, limit?: number, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: string, since?: number, limit?: number, params?: {}): Promise<Order[]>;
    fetchCurrencies(params?: any): Promise<any>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    deposit(currency: string, amount: string, address: string, params?: {}): Promise<any>;
    fetchDepositAddress(currency: string, params?: {}): Promise<any>;
    withdraw(
      currency: string,
      amount: string,
      address: string,
      tag?: string,
      params?: {},
    ): Promise<any>;
    request(
      path: string,
      api?: string,
      method?: string,
      params?: any,
      headers?: any,
      body?: any,
    ): Promise<any>;
    YmdHMS(timestamp: string, infix: string): string;
    iso8601(timestamp: string): string;
    seconds(): number;
    microseconds(): number;
  }

  /* tslint:disable */

  declare export class _1broker extends Exchange {}
  declare export class _1btcxe extends Exchange {}
  declare export class acx extends Exchange {}
  declare export class allcoin extends okcoinusd {}
  declare export class anxpro extends Exchange {}
  declare export class bibox extends Exchange {}
  declare export class binance extends Exchange {}
  declare export class bit2c extends Exchange {}
  declare export class bitbank extends Exchange {}
  declare export class bitbay extends Exchange {}
  declare export class bitfinex extends Exchange {}
  declare export class bitfinex2 extends bitfinex {}
  declare export class bitflyer extends Exchange {}
  declare export class bithumb extends Exchange {}
  declare export class bitkk extends zb {}
  declare export class bitlish extends Exchange {}
  declare export class bitmarket extends Exchange {}
  declare export class bitmex extends Exchange {}
  declare export class bitso extends Exchange {}
  declare export class bitstamp extends Exchange {}
  declare export class bitstamp1 extends Exchange {}
  declare export class bittrex extends Exchange {}
  declare export class bitz extends Exchange {}
  declare export class bl3p extends Exchange {}
  declare export class bleutrade extends bittrex {}
  declare export class braziliex extends Exchange {}
  declare export class btcbox extends Exchange {}
  declare export class btcchina extends Exchange {}
  declare export class btcexchange extends btcturk {}
  declare export class btcmarkets extends Exchange {}
  declare export class btctradeim extends coinegg {}
  declare export class btctradeua extends Exchange {}
  declare export class btcturk extends Exchange {}
  declare export class btcx extends Exchange {}
  declare export class bxinth extends Exchange {}
  declare export class ccex extends Exchange {}
  declare export class cex extends Exchange {}
  declare export class chbtc extends zb {}
  declare export class chilebit extends foxbit {}
  declare export class cobinhood extends Exchange {}
  declare export class coincheck extends Exchange {}
  declare export class coinegg extends Exchange {}
  declare export class coinex extends Exchange {}
  declare export class coinexchange extends Exchange {}
  declare export class coinfloor extends Exchange {}
  declare export class coingi extends Exchange {}
  declare export class coinmarketcap extends Exchange {}
  declare export class coinmate extends Exchange {}
  declare export class coinnest extends Exchange {}
  declare export class coinone extends Exchange {}
  declare export class coinsecure extends Exchange {}
  declare export class coinspot extends Exchange {}
  declare export class coolcoin extends coinegg {}
  declare export class cryptopia extends Exchange {}
  declare export class dsx extends liqui {}
  declare export class ethfinex extends bitfinex {}
  declare export class exmo extends Exchange {}
  declare export class exx extends Exchange {}
  declare export class flowbtc extends Exchange {}
  declare export class foxbit extends Exchange {}
  declare export class fybse extends Exchange {}
  declare export class fybsg extends fybse {}
  declare export class gatecoin extends Exchange {}
  declare export class gateio extends Exchange {}
  declare export class gdax extends Exchange {}
  declare export class gemini extends Exchange {}
  declare export class getbtc extends _1btcxe {}
  declare export class hadax extends huobipro {}
  declare export class hitbtc extends Exchange {}
  declare export class hitbtc2 extends hitbtc {}
  declare export class huobi extends Exchange {}
  declare export class huobicny extends huobipro {}
  declare export class huobipro extends Exchange {}
  declare export class ice3x extends Exchange {}
  declare export class independentreserve extends Exchange {}
  declare export class indodax extends Exchange {}
  declare export class itbit extends Exchange {}
  declare export class jubi extends btcbox {}
  declare export class kraken extends Exchange {}
  declare export class kucoin extends Exchange {}
  declare export class kuna extends acx {}
  declare export class lakebtc extends Exchange {}
  declare export class lbank extends Exchange {}
  declare export class liqui extends Exchange {}
  declare export class livecoin extends Exchange {}
  declare export class luno extends Exchange {}
  declare export class lykke extends Exchange {}
  declare export class mercado extends Exchange {}
  declare export class mixcoins extends Exchange {}
  declare export class negociecoins extends Exchange {}
  declare export class nova extends Exchange {}
  declare export class okcoincny extends okcoinusd {}
  declare export class okcoinusd extends Exchange {}
  declare export class okex extends okcoinusd {}
  declare export class paymium extends Exchange {}
  declare export class poloniex extends Exchange {}
  declare export class qryptos extends Exchange {}
  declare export class quadrigacx extends Exchange {}
  declare export class quoinex extends qryptos {}
  declare export class southxchange extends Exchange {}
  declare export class surbitcoin extends foxbit {}
  declare export class therock extends Exchange {}
  declare export class tidebit extends Exchange {}
  declare export class tidex extends liqui {}
  declare export class urdubit extends foxbit {}
  declare export class vaultoro extends Exchange {}
  declare export class vbtc extends foxbit {}
  declare export class virwox extends Exchange {}
  declare export class wex extends liqui {}
  declare export class xbtce extends Exchange {}
  declare export class yobit extends liqui {}
  declare export class yunbi extends acx {}
  declare export class zaif extends Exchange {}
  declare export class zb extends Exchange {}

  declare interface CCXT {
    [key: string]: Class<Exchange>;
    version: typeof version;
    exchanges: typeof exchanges;
  }

  declare export default CCXT;
  /* tslint:enable */
}
