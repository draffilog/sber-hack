/**
 * Format a number with commas and specified decimal places
 */
export function formatNumber(value: number, decimals: number = 0): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  // Format large numbers with abbreviations
  if (value >= 1e9) {
    return (value / 1e9).toFixed(decimals) + 'B';
  } else if (value >= 1e6) {
    return (value / 1e6).toFixed(decimals) + 'M';
  } else if (value >= 1e3) {
    return (value / 1e3).toFixed(decimals) + 'K';
  }
  
  // Otherwise, use standard formatting with commas
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format a dollar amount with symbol, commas, and decimals
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }
  
  return '$' + formatNumber(value, decimals);
}

/**
 * Format a percentage with sign and decimals
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  const sign = value > 0 ? '+' : '';
  return sign + value.toFixed(decimals) + '%';
}

/**
 * Format a date string from a timestamp
 */
export function formatDate(timestamp: number | string): string {
  if (!timestamp) return '';
  
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
  return date.toLocaleDateString();
}

/**
 * Format a blockchain address with ellipsis in the middle
 */
export function formatAddress(address: string, prefixLength: number = 6, suffixLength: number = 4): string {
  if (!address || address.length < prefixLength + suffixLength + 3) {
    return address || '';
  }
  
  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
} 