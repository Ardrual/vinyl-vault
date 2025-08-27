// Utility functions for secure IP address extraction
export function getClientIP(request: Request): string {
  // In production, prefer the rightmost IP in X-Forwarded-For chain (most trusted)
  // In development, allow any IP extraction method
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const cfConnectingIP = request.headers.get("cf-connecting-ip") // Cloudflare
  
  // Production: Trust only specific headers and validate
  if (process.env.NODE_ENV === "production") {
    // Prioritize Cloudflare's header if present (most reliable in Vercel/CF setup)
    if (cfConnectingIP && isValidIP(cfConnectingIP)) {
      return cfConnectingIP
    }
    
    // Use rightmost IP from X-Forwarded-For (closest to the load balancer)
    if (forwarded) {
      const ips = forwarded.split(",").map(ip => ip.trim())
      const trustedIP = ips[ips.length - 1]
      if (trustedIP && isValidIP(trustedIP)) {
        return trustedIP
      }
    }
    
    // Fallback to X-Real-IP
    if (realIP && isValidIP(realIP)) {
      return realIP
    }
  } else {
    // Development: More permissive but still validated
    if (forwarded) {
      const firstIP = forwarded.split(",")[0]?.trim()
      if (firstIP && isValidIP(firstIP)) {
        return firstIP
      }
    }
    
    if (realIP && isValidIP(realIP)) {
      return realIP
    }
  }
  
  // Final fallback for anonymous requests
  return "anonymous"
}

// Basic IP validation to prevent injection
function isValidIP(ip: string): boolean {
  if (!ip || ip.length > 45) return false // Max IPv6 length
  
  // IPv4 pattern
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  
  // IPv6 pattern (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}