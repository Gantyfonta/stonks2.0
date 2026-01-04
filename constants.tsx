
import { Stock } from './types';

export const INITIAL_CASH = 50000;
export const TICKER_INTERVAL = 3000; // 3 seconds
export const NEWS_INTERVAL = 45000; // 45 seconds

export const INITIAL_STOCKS: Record<string, Stock> = {
  'TECH': {
    symbol: 'TECH',
    name: 'TechnoCore Systems',
    price: 150.25,
    change: 0,
    changePercent: 0,
    volatility: 0.02,
    sector: 'Technology',
    description: 'Leading provider of cloud infrastructure and quantum computing hardware.',
    trend: 0,
    history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}:00`, price: 150 + Math.random() * 5 }))
  },
  'ZEN': {
    symbol: 'ZEN',
    name: 'Zenith BioMed',
    price: 85.40,
    change: 0,
    changePercent: 0,
    volatility: 0.035,
    sector: 'Healthcare',
    description: 'Pioneering gene editing and regenerative medicine therapies.',
    trend: 0,
    history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}:00`, price: 85 + Math.random() * 8 }))
  },
  'SOLR': {
    symbol: 'SOLR',
    name: 'Solaris Energy',
    price: 42.10,
    change: 0,
    changePercent: 0,
    volatility: 0.015,
    sector: 'Energy',
    description: 'The world\'s largest manufacturer of high-efficiency solar cells.',
    trend: 0,
    history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}:00`, price: 42 + Math.random() * 3 }))
  },
  'AUTO': {
    symbol: 'AUTO',
    name: 'Velocity Motors',
    price: 210.80,
    change: 0,
    changePercent: 0,
    volatility: 0.04,
    sector: 'Consumer Cyclical',
    description: 'Luxury electric vehicle manufacturer with a focus on autonomous driving.',
    trend: 0,
    history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}:00`, price: 210 + Math.random() * 12 }))
  },
  'COSM': {
    symbol: 'COSM',
    name: 'Cosmos Logistics',
    price: 12.45,
    change: 0,
    changePercent: 0,
    volatility: 0.01,
    sector: 'Industrials',
    description: 'Global shipping and automated warehouse management solutions.',
    trend: 0,
    history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}:00`, price: 12 + Math.random() * 0.5 }))
  }
};
