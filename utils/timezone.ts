/**
 * Timezone utility for IST (Indian Standard Time - UTC+5:30)
 * All date operations in the application should use IST regardless of deployment location
 */

// IST timezone identifier
export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Get current date and time in IST
 */
export function getNowIST(): Date {
  const now = new Date();
  // Convert to IST by using toLocaleString with Asia/Kolkata timezone
  const istString = now.toLocaleString('en-US', { timeZone: IST_TIMEZONE });
  return new Date(istString);
}

/**
 * Get today's date string in IST (YYYY-MM-DD format)
 */
export function getTodayDateIST(): string {
  const now = getNowIST();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as Date object in IST (time set to 00:00:00)
 */
export function getTodayIST(): Date {
  const todayString = getTodayDateIST();
  return new Date(todayString + 'T00:00:00.000Z');
}

/**
 * Convert any date to IST Date object
 */
export function toIST(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  const istString = d.toLocaleString('en-US', { timeZone: IST_TIMEZONE });
  return new Date(istString);
}

/**
 * Format date to IST string
 */
export function formatDateIST(date: Date | string, includeTime: boolean = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (includeTime) {
    return d.toLocaleString('en-US', { 
      timeZone: IST_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
  
  return d.toLocaleDateString('en-US', { 
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Get date in YYYY-MM-DD format from any date in IST
 */
export function getDateStringIST(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.toLocaleString('en-US', { timeZone: IST_TIMEZONE, year: 'numeric' });
  const month = d.toLocaleString('en-US', { timeZone: IST_TIMEZONE, month: '2-digit' });
  const day = d.toLocaleString('en-US', { timeZone: IST_TIMEZONE, day: '2-digit' });
  return `${year}-${month}-${day}`;
}

/**
 * Get start of month in IST
 */
export function getStartOfMonthIST(year: number, month: number): Date {
  // Create date in IST timezone
  const dateString = `${year}-${String(month).padStart(2, '0')}-01`;
  return new Date(dateString + 'T00:00:00.000+05:30');
}

/**
 * Get end of month in IST
 */
export function getEndOfMonthIST(year: number, month: number): Date {
  // Get the last day of the month
  const lastDay = new Date(year, month, 0).getDate();
  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return new Date(dateString + 'T23:59:59.999+05:30');
}

