/**
 * Creates an unpredictable OAuth state token without relying on randomUUID,
 * which is unavailable in older browsers and non-secure contexts.
 */
export function createOAuthState(cryptoApi = globalThis.crypto) {
  if (!cryptoApi?.getRandomValues) {
    throw new Error('Secure sign-in requires HTTPS or a supported browser.')
  }

  const bytes = new Uint8Array(32)
  cryptoApi.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}
