export const isDevelopment = process.env.NODE_ENV === "development"

export function createGuestUser() {
  return {
    id: "guest-user",
    displayName: "Guest User",
    primaryEmail: "guest@example.com",
  }
}

export function getEffectiveUser(stackUser: any) {
  // Only allow guest users in development AND when explicitly enabled
  if (isDevelopment && !stackUser && process.env.ALLOW_GUEST_ACCESS === "true") {
    return createGuestUser()
  }
  return stackUser
}
