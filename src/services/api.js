/* ═══════════════════════════════════════════════════════════════
   FinTech Ledger — API Service Layer
   All requests route through the API Gateway on port 8080
   ═══════════════════════════════════════════════════════════════ */

const BASE = 'http://localhost:8080';

/* ── Token helpers ── */
export const getToken = () => localStorage.getItem('ft_token');
export const setToken = (t) => localStorage.setItem('ft_token', t);
export const clearToken = () => { localStorage.removeItem('ft_token'); localStorage.removeItem('ft_user'); };
export const getUser = () => { try { return JSON.parse(localStorage.getItem('ft_user')); } catch { return null; } };
export const setUser = (u) => localStorage.setItem('ft_user', JSON.stringify(u));
export const isLoggedIn = () => !!getToken();

/* ── Core request wrapper ── */
let onUnauthorized = null;
export const setOnUnauthorized = (fn) => { onUnauthorized = fn; };

async function request(method, path, body, noAuth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (!noAuth && getToken()) headers['Authorization'] = 'Bearer ' + getToken();
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(BASE + path, opts);
  if (res.status === 401 || res.status === 403) {
    clearToken();
    if (onUnauthorized) onUnauthorized();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }
  if (res.status === 204) return null;

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || text || `Error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/* ══════════ AUTH ══════════ */
export async function register(fullName, email, password) {
  const data = await request('POST', '/api/auth/register', { fullName, email, password }, true);
  setToken(data.token); setUser(data.user);
  return data;
}

export async function login(email, password) {
  const data = await request('POST', '/api/auth/login', { email, password }, true);
  setToken(data.token); setUser(data.user);
  return data;
}

export function logout() { clearToken(); }

/* ══════════ WALLETS ══════════ */
export const getWallets = () => request('GET', '/api/wallets');
export const getWallet = (id) => request('GET', '/api/wallets/' + id);
export const createWallet = (currency) => request('POST', '/api/wallets', { currency });
export const deposit = (walletId, amount) => request('POST', `/api/wallets/${walletId}/deposit`, { amount });
export const withdraw = (walletId, amount) => request('POST', `/api/wallets/${walletId}/withdraw`, { amount });

/* ══════════ TRADES ══════════ */
export const getOpenTrades = (page = 0, size = 10) => request('GET', `/api/trades?page=${page}&size=${size}`);
export const getMyTrades = (page = 0, size = 10) => request('GET', `/api/trades/my?page=${page}&size=${size}`);
export const getTrade = (id) => request('GET', '/api/trades/' + id);
export const createTrade = (sellCurrency, buyCurrency, sellAmount, exchangeRate, expirationHours) =>
  request('POST', '/api/trades', { sellCurrency, buyCurrency, sellAmount, exchangeRate, expirationHours });
export const acceptTrade = (id) => request('POST', `/api/trades/${id}/accept`);
export const updateTrade = (id, sellAmount, exchangeRate) => request('PUT', `/api/trades/${id}`, { sellAmount, exchangeRate });
export const deleteTrade = (id) => request('DELETE', `/api/trades/${id}`);
export const getOracleRates = (base) => request('GET', `/api/trades/oracle/rates?base=${base}`);

/* ══════════ LEDGER ══════════ */
export const getLedger = (walletId, page = 0, size = 10) => request('GET', `/api/ledger/wallet/${walletId}?page=${page}&size=${size}`);
export const getAuditLedger = (page = 0, size = 10) => request('GET', `/api/ledger/admin/audit?page=${page}&size=${size}`);

/* ══════════ ADMIN ══════════ */
export const getMetricsUsers = () => request('GET', '/api/auth/admin/metrics/users');
export const getLiquidity = () => request('GET', '/api/wallets/admin/metrics/liquidity');
export const getRevenue = () => request('GET', '/api/wallets/admin/metrics/revenue');
export const reconcile = () => request('POST', '/api/ledger/admin/reconcile');
export const toggleFreezeWallet = (walletId) => request('POST', `/api/wallets/admin/${walletId}/toggle-freeze`);
export const promoteUser = (userId) => request('POST', `/api/auth/admin/users/${userId}/promote`);
export const getHealth = async (service = '') => {
  try {
    const path = service ? `/api/${service}/health` : '/actuator/health';
    const res = await fetch(BASE + path);
    return res.ok ? await res.json() : { status: 'DOWN' };
  } catch {
    return { status: 'DOWN' };
  }
};

/* ══════════ CONSTANTS ══════════ */
export const CURRENCIES = ['USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY','HKD','NZD','SEK','KRW','SGD','NOK','MXN','INR','RUB','ZAR','TRY','BRL','TWD','DKK','PLN','THB','IDR','HUF','CZK','ILS','CLP','PHP','AED','COP','SAR','MYR','RON','BTC','ETH'];

export const CURRENCY_NAMES = {
  USD:'US Dollar',EUR:'Euro',GBP:'British Pound',JPY:'Japanese Yen',AUD:'Australian Dollar',
  CAD:'Canadian Dollar',CHF:'Swiss Franc',CNY:'Chinese Yuan',HKD:'Hong Kong Dollar',
  NZD:'New Zealand Dollar',SEK:'Swedish Krona',KRW:'South Korean Won',SGD:'Singapore Dollar',
  NOK:'Norwegian Krone',MXN:'Mexican Peso',INR:'Indian Rupee',RUB:'Russian Ruble',
  ZAR:'South African Rand',TRY:'Turkish Lira',BRL:'Brazilian Real',TWD:'Taiwan Dollar',
  DKK:'Danish Krone',PLN:'Polish Zloty',THB:'Thai Baht',IDR:'Indonesian Rupiah',
  HUF:'Hungarian Forint',CZK:'Czech Koruna',ILS:'Israeli Shekel',CLP:'Chilean Peso',
  PHP:'Philippine Peso',AED:'UAE Dirham',COP:'Colombian Peso',SAR:'Saudi Riyal',
  MYR:'Malaysian Ringgit',RON:'Romanian Leu',BTC:'Bitcoin',ETH:'Ethereum'
};

export const currName = (c) => CURRENCY_NAMES[c] || c;
export const fmt = (n) => parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
export const fmtDate = (d) => { if (!d) return '—'; try { return new Date(d).toLocaleString(); } catch { return d; } };
