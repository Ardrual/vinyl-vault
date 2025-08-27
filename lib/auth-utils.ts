export const isDevelopment = process.env.NODE_ENV === "development"

export function createGuestUser() {
  return {
    id: "guest-user",
    displayName: "Guest User",
    primaryEmail: "guest@example.com",
  }
}

export function getEffectiveUser(stackUser: any) {
  if (isDevelopment && !stackUser) {
    return createGuestUser()
  }
  return stackUser
}
