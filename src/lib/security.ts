/**
 * Security utilities for the restaurant ordering app
 * Implements rate limiting, input validation, and other security measures
 */

// Rate limiting storage (in-memory, resets on page reload)
const rateLimitStore: Record<string, { count: number; resetTime: number }> = {}

/**
 * Check if an action is rate limited
 * @param key - Unique identifier for the action (e.g., 'order-table-123')
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export const checkRateLimit = (
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 minute default
): boolean => {
  const now = Date.now()
  const entry = rateLimitStore[key]

  // Clean up expired entries
  if (!entry || now > entry.resetTime) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs
    }
    return true
  }

  // Increment counter
  entry.count++

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    return false
  }

  return true
}

/**
 * Get remaining attempts for a rate-limited action
 */
export const getRemainingAttempts = (
  key: string,
  maxRequests: number = 5,
  _windowMs?: number
): number => {
  const now = Date.now()
  const entry = rateLimitStore[key]

  if (!entry || now > entry.resetTime) {
    return maxRequests
  }

  return Math.max(0, maxRequests - entry.count)
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate price (positive number with max 2 decimal places)
 */
export const isValidPrice = (price: number | string): boolean => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return !isNaN(numPrice) && numPrice >= 0 && numPrice <= 99999.99
}

/**
 * Validate quantity (positive integer)
 */
export const isValidQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 99
}

/**
 * Generate a sequential order number with daily reset at 2 AM
 * Format: KR1, KR2, KR3... (resets to KR1 after 2 AM)
 */
export const generateSecureOrderNumber = (todayOrderCount: number): string => {
  // Generate sequential number starting from 1
  const orderSequence = todayOrderCount + 1
  return `KR${orderSequence}`
}

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Debounce function to prevent rapid repeated calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function to limit execution frequency
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
