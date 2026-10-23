import { useEffect } from "react";
import type { Campaign } from "@/types";

const APP_TITLE = "FX Creations — KOL Dashboard";

/**
 * Creates or updates a `<meta>` tag in the document head.
 */
const setMeta = (attribute: "name" | "property", key: string, content: string) => {
  if (typeof document === "undefined") return;
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

/**
 * Keeps the browser tab title and the social preview meta tags in sync with
 * the campaign being shown. The public page is shared over Messenger and
 * WhatsApp, where the link preview is what sells the campaign.
 *
 * The tags are removed again when the campaign page is left so the dashboard
 * does not inherit a stale preview.
 */
export const useCampaignMeta = (campaign: Campaign | undefined): void => {
  useEffect(() => {
    if (!campaign) return;

    const title = `${campaign.productName} — FX Creations KOL Campaign`;
    const description =
      campaign.productDescription?.trim() || campaign.campaignBrief?.trim() || "";

    document.title = title;

    setMeta("name", "description", description);

    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", campaign.productImage);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", window.location.href);

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", campaign.productImage);

    return () => {
      document.title = APP_TITLE;
      const keys: { attribute: "name" | "property"; key: string }[] = [
        { attribute: "name", key: "description" },
        { attribute: "property", key: "og:title" },
        { attribute: "property", key: "og:description" },
        { attribute: "property", key: "og:image" },
        { attribute: "property", key: "og:type" },
        { attribute: "property", key: "og:url" },
        { attribute: "name", key: "twitter:card" },
        { attribute: "name", key: "twitter:title" },
        { attribute: "name", key: "twitter:description" },
        { attribute: "name", key: "twitter:image" },
      ];
      for (const { attribute, key } of keys) {
        document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove();
      }
    };
  }, [campaign]);
};

export default useCampaignMeta;
