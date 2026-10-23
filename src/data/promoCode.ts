import type { Campaign, Kol } from "@/types";

/**
 * Promo code contract — swap the format in ONE place.
 *
 *   {prefix}   -> PROMO_CODE_PREFIX
 *   {campaign} -> campaign code, e.g. "AGS"
 *   {kol}      -> zero-padded KOL id, e.g. "042"
 *
 * Result: FX-AGS-042
 */
export const PROMO_CODE_PREFIX = "FX";
export const PROMO_CODE_FORMAT = "{prefix}-{campaign}-{kol}";

/** Alphabet used for the collision-breaking suffix (e.g. FX-AGS-042-X7). */
export const PROMO_CODE_SUFFIX_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Example of a rendered code — used by the UI as a format hint. */
export const PROMO_CODE_EXAMPLE = "FX-AGS-042";

const KOL_ID_PAD = 3;

export const campaignCodePart = (
  campaign: Pick<Campaign, "campaignCode" | "name">,
): string => {
  const explicit = (campaign.campaignCode ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (explicit) return explicit;
  const fromName = campaign.name.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return fromName.slice(0, 3) || "GEN";
};

export const kolCodePart = (kolId: number): string =>
  String(kolId).padStart(KOL_ID_PAD, "0");

export const formatPromoCode = (campaignPart: string, kolPart: string): string =>
  PROMO_CODE_FORMAT.replace("{prefix}", PROMO_CODE_PREFIX)
    .replace("{campaign}", campaignPart)
    .replace("{kol}", kolPart);

/** Builds the canonical (uncollided) promo code for a campaign + KOL pair. */
export const buildPromoCode = (
  campaign: Pick<Campaign, "campaignCode" | "name">,
  kol: Pick<Kol, "id">,
): string => formatPromoCode(campaignCodePart(campaign), kolCodePart(kol.id));

/** Random 2-char suffix (A-Z0-9) used to break promo code collisions. */
export const randomPromoSuffix = (length = 2): string => {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * PROMO_CODE_SUFFIX_ALPHABET.length);
    out += PROMO_CODE_SUFFIX_ALPHABET[index];
  }
  return out;
};

/**
 * Parses a promo code back into its parts.
 * Accepts the canonical `FX-AGS-042` form and the collision-suffixed
 * `FX-AGS-042-X7` form.
 */
export const parsePromoCode = (
  code: string,
): { campaignCode: string; kolNumber: number } | null => {
  const normalised = code.trim().toUpperCase();
  if (!normalised) return null;

  const withPrefix = /^([A-Z0-9]+)-([A-Z0-9]+)-(\d{1,6})(?:-[A-Z0-9]{2})?$/.exec(normalised);
  if (withPrefix) {
    return { campaignCode: withPrefix[2], kolNumber: Number(withPrefix[3]) };
  }

  const withoutPrefix = /^([A-Z0-9]+)-(\d{1,6})(?:-[A-Z0-9]{2})?$/.exec(normalised);
  if (withoutPrefix) {
    return { campaignCode: withoutPrefix[1], kolNumber: Number(withoutPrefix[2]) };
  }

  return null;
};

/**
 * Discount shown on the application for a given campaign.
 * Attribution-only campaigns (no commission) get `undefined`.
 */
export const discountForCampaign = (campaign: Campaign): string | undefined => {
  if (campaign.commissionPct > 0) return `${campaign.commissionPct}%`;
  return undefined;
};
