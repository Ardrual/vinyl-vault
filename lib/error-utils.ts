// Secure error handling utilities
export function sanitizeError(error: unknown): { message: string; details?: any } {
  // In production, never expose internal error details
  if (process.env.NODE_ENV === "production") {
    return {
      message: "An error occurred while processing your request"
    }
  }

  // In development, provide more details but still sanitize sensitive information
  if (error instanceof Error) {
    return {
      message: "Development Error", 
      details: sanitizeErrorMessage(error.message)
    }
  }

  return {
    message: "Unknown error occurred",
    details: typeof error === "string" ? sanitizeErrorMessage(error) : "Unknown error type"
  }
}

function sanitizeErrorMessage(message: string): string {
  // Remove potential sensitive information from error messages
  const sensitivePatterns = [
    /password[=:]\s*[^\s]+/gi,
    /token[=:]\s*[^\s]+/gi,
    /key[=:]\s*[^\s]+/gi,
    /secret[=:]\s*[^\s]+/gi,
    /api[_-]?key[=:]\s*[^\s]+/gi,
    /database[_-]?url[=:]\s*[^\s]+/gi,
    /connection[_-]?string[=:]\s*[^\s]+/gi,
  ]

  let sanitized = message
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, "[REDACTED]")
  }

  return sanitized
}

// Rate limiting error with proper error codes
export function createRateLimitError(remaining: number, resetTime: number) {
  return {
    error: "Rate limit exceeded",
    message: "Too many requests. Please try again later.",
    headers: {
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": resetTime.toString(),
      "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString()
    }
  }
}

// Validation error with sanitized details
export function createValidationError(zodError: any) {
  return {
    error: "Validation failed",
    details: zodError.errors?.map((err: any) => ({
      field: err.path?.join(".") || "unknown",
      message: err.message || "Invalid value"
    })) || []
  }
}