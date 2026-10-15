/**
 * Private deployment policy: only the /139 139Yun mount is redirect-only.
 * Other storage drivers and mounts retain their normal proxy behavior.
 *
 * A 302 cannot guarantee that the user's network can reach the upstream CDN:
 * failures after the redirect belong to the browser; the Worker MUST NOT fall
 * back to fetching or streaming bytes.
 */
export function isStrict139DirectOnly(storage: any): boolean {
  const driver = String(storage?.driver || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
  const mount = String(storage?.mount_path ?? storage?.mountPath ?? "")
    .replace(/\/+$/, "")
  return driver === "139yun" && mount === "/139"
}

/**
 * Only hand out an absolute, externally hosted HTTPS URL.
 * Prevent redirect loops to this OpenList site (including www) and to
 * workers.dev; preserve the provider's signed query string untouched.
 * Caller still uses assertSafeUrl to reject private/unsafe destinations.
 */
export function getStrict139RedirectUrl(
  rawUrl: unknown,
  requestUrl: string,
): string | null {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) return null
  try {
    const target = new URL(rawUrl)
    const incoming = new URL(requestUrl)
    const targetHost = target.hostname.toLowerCase()
    const incomingHost = incoming.hostname.toLowerCase().replace(/^www\./, "")
    if (
      target.protocol !== "https:" ||
      target.username ||
      target.password ||
      !targetHost ||
      targetHost.endsWith(".workers.dev") ||
      targetHost.replace(/^www\./, "") === incomingHost
    ) {
      return null
    }
    return target.toString()
  } catch {
    return null
  }
}
