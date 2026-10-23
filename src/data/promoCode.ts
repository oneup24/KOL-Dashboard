import type { Campaign, Kol } from "@/types";

/**
 * Promo codes are configured per campaign — the campaign owner decides the
 * pattern in the campaign settings, so there is no single house format.
 *
 *   {campaign} -> the campaign code, e.g. "AGS"
 *   {kol}      -> the zero-padded KOL id, e.g. "042"
 *
 * A template containing {kol} produces a unique code per KOL (FX-AGS-042),
 * which is what you want for attribution. A template without it produces one
 * shared code for the whole campaign (FXSUMMER20). An empty template means
 * the campaign has no promo code at all.
 */
export const DEFAULT_PROMO_CODE_TEMPLATE = "FX-{campaign}-{kol}";

/** Alphabet used for the collision-breaking suffix (e.g. FX-AGS-042-X7). */
export const PROMO_CODE_SUFFIX_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const KOL_ID_PAD = 3;

/** Placeholder tokens the owner can use in the template. */
export const PROMO_CODE_TOKENS = [
  { token: "{campaign}", label: "Campaign code", example: "AGS" },
  { token: "{kol}", label: "KOL id", example: "042" },
];

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

/** True when the template produces a different code for each KOL. */
export const isPerKolTemplate = (template: string): boolean =>
  template.includes("{kol}");

/** Renders the template for a campaign + KOL pair. */
export const formatPromoCode = (
  template: string,
  campaignPart: string,
  kolPart: string,
): string =>
  template
    .trim()
    .replace(/\{campaign\}/g, campaignPart)
    .replace(/\{kol\}/g, kolPart)
    .replace(/\s+/g, "")
    .toUpperCase();

/** Builds the canonical (uncollided) promo code for a campaign + KOL pair. */
export const buildPromoCode = (
  campaign: Pick<Campaign, "campaignCode" | "name" | "promoCodeTemplate">,
  kol: Pick<Kol, "id">,
): string => {
  // An undefined template means the campaign predates the setting — fall back
  // to the house default. An explicitly empty template means "no promo code".
  const template =
    campaign.promoCodeTemplate === undefined
      ? DEFAULT_PROMO_CODE_TEMPLATE
      : campaign.promoCodeTemplate;
  if (!template.trim()) return "";
  return formatPromoCode(
    template,
    campaignCodePart(campaign),
    kolCodePart(kol.id),
  );
};

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
 * Parses a promo code back into its parts. Only the canonical per-KOL form
 * can be parsed — a shared campaign code carries no KOL id.
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
 * What the promo code is worth, as written by the campaign owner.
 * Falls back to the commission percentage when the owner left it blank.
 */
export const promoValueForCampaign = (campaign: Campaign): string | undefined => {
  const explicit = campaign.promoCodeValue?.trim();
  if (explicit) return explicit;
  if (campaign.commissionPct > 0) return `${campaign.commissionPct}%`;
  return undefined;
};
