/**
 * The access code for the marketer dashboard.
 *
 * IMPORTANT: this is a speed bump, not authentication. The code is a
 * build-time env var, so it is inlined into the bundle and anyone who can
 * read the JavaScript can read the code. The real boundary is who can open
 * the Google Sheet, or a password-protected site / Cloudflare Access in
 * front of the deployment. What the gate does buy is that a link that leaks
 * into a group chat does not hand a stranger the KOL contact list.
 *
 * Set it in Netlify under Site configuration -> Environment variables and
 * redeploy. When it is absent the dashboard stays open — the marketer must
 * never be locked out of their own tool by a missing env var.
 */
export const dashboardCode = (import.meta.env.VITE_DASHBOARD_CODE ?? "").trim();

/** True when a code is configured — i.e. when the dashboard is gated. */
export const isDashboardGated = (): boolean => dashboardCode.length > 0;
