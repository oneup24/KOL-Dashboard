import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * The share link a KOL receives is a real path on the host (`/c/<slug>/`),
 * but the app routes on the hash (`/#/c/<slug>`). These helpers bridge the
 * two so the same URL works for campaigns that exist only at runtime.
 */

/**
 * Reads the campaign slug out of a real browser path.
 *
 * The pattern matches the tail of the path, so it works on a domain root
 * (`/c/slug/`) and under a sub-path (`/KOL-Dashboard/c/slug/`) alike. A path
 * that merely contains a `/c/` folder further up (`/c/slug/extra`) does not
 * match, so the helper never guesses.
 */
export const publicSlugFromPath = (pathname: string): string | null => {
  const match = /\/c\/([^/]+)\/?$/.exec(pathname);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

/**
 * Rewrites the fragment to the public campaign route BEFORE the router is
 * created.
 *
 * HashRouter reads `window.location.hash` exactly once, when it is built. If
 * the hash is still empty at that moment the router starts on "/", which is
 * the marketer dashboard — a KOL following the share link would see the
 * dashboard chrome (or the access-code screen) flash past before the
 * redirect lands. Normalising the fragment first means the very first paint
 * is already the public page.
 *
 * Only the fragment changes; the path stays exactly as it was served.
 */
export const normalizePublicPath = (): void => {
  if (typeof window === "undefined") return;
  const slug = publicSlugFromPath(window.location.pathname);
  if (!slug) return;
  const target = `#/c/${slug}`;
  if (window.location.hash === target) return;
  window.location.hash = target;
};

/**
 * The in-router half of the bridge: a real `/c/<slug>` path becomes the
 * `#/c/<slug>` hash route.
 *
 * `normalizePublicPath()` (called before the app mounts) normally does the
 * job; this component is the safety net for anything that changes the path
 * afterwards, and it is also what keeps the route correct if the app is
 * mounted into an already-open document.
 *
 * It renders nothing — it is a router helper, not a page.
 */
const PublicPathRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // One redirect per slug. After the public page has been shown, the
  // visitor's own hash navigation (or the marketer moving to another
  // screen) must not be yanked back to the campaign.
  const redirectedTo = useRef<string | null>(null);

  useEffect(() => {
    const slug = publicSlugFromPath(window.location.pathname);
    if (!slug) return;

    const current = location.pathname.replace(/\/+$/, "");
    if (current === `/c/${slug}`) {
      redirectedTo.current = slug;
      return;
    }
    if (redirectedTo.current === slug) return;

    redirectedTo.current = slug;
    navigate(`/c/${slug}`, { replace: true });
  }, [location.pathname, navigate]);

  return null;
};

export default PublicPathRedirect;
