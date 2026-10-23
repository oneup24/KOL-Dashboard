import { findStore } from "@/data/stores";
import type { Application, Campaign, Kol, MessageTemplate, Store } from "@/types";

/**
 * Default WhatsApp copy for every workflow stage of an application.
 * Placeholders use `{{variable}}` syntax — see `MESSAGE_VARIABLES`.
 */
export const seedMessageTemplates: MessageTemplate[] = [
  {
    id: "TPL-SALES-PREPARE",
    name: "Store prep — product ready",
    scope: "sales_prepare",
    channel: "whatsapp",
    isDefault: true,
    body: `Hi {{store_name}} team 👋

Please prepare 1 unit for KOL collection — ref {{ref}}.

• KOL: {{kol_name}} ({{handle}}) · {{platform}}
• WhatsApp: {{whatsapp}}
• Campaign: {{campaign_name}} ({{campaign_code}})
• Product: {{product_name}} — variant {{variant}}
• Store: {{store_name}}
• Address: {{store_address}}
• Tel: {{store_phone}}

Please set the unit aside under the name "{{kol_name}}" and mark it ready once the KOL has collected. Ref: {{ref}}

Thanks!
— {{manager_name}} · FX Creations`,
  },
  {
    id: "TPL-KOL-APPROVED",
    name: "KOL approved",
    scope: "kol_approved",
    channel: "whatsapp",
    isDefault: true,
    body: `Hi {{kol_name}} 🎉 You've been approved for {{campaign_name}}!

We're preparing your {{product_name}} ({{variant}}) for collection now. I'll send the store details and your shooting brief here shortly.

Your referral code: {{promo_code}}
Discount offered to your audience: {{discount}}

Reply here if you have any questions. Thanks for partnering with FX Creations!`,
  },
  {
    id: "TPL-KOL-PICKUP",
    name: "KOL pickup ready",
    scope: "kol_pickup",
    channel: "whatsapp",
    isDefault: true,
    body: `Hi {{kol_name}} ✨ Your {{product_name}} ({{variant}}) is ready for collection at {{store_name}}.

🕒 Hours: {{store_hours}}
📍 {{store_address}}
☎️ {{store_phone}}

Just show the name "{{kol_name}}" (ref {{ref}}) at the counter. Let me know once collected, and I'll send over the shooting brief.

Thanks!`,
  },
  {
    id: "TPL-KOL-BRIEF",
    name: "KOL shooting brief",
    scope: "kol_brief",
    channel: "whatsapp",
    isDefault: true,
    body: `Hi {{kol_name}} 📋 Here's the shooting brief for {{campaign_name}}.

Product: {{product_name}} ({{variant}}) — {{product_url}}

Deliverables:
{{deliverables}}

Requirements:
{{requirements}}

Posting window: {{post_start}} → {{post_end}}
Mandatory tags: {{mandatory_tags}}
Disclosure: {{disclosure}}
Full brief: {{brief_url}}

Your promo code: {{promo_code}}
Discount offered to your audience: {{discount}}
{{fee}}

When your post is live, please reply here with the link so we can track it. Thank you! 🙏`,
  },
  {
    id: "TPL-KOL-DENIED",
    name: "KOL declined",
    scope: "kol_denied",
    channel: "whatsapp",
    isDefault: true,
    body: `Hi {{kol_name}} 👋

Thanks for applying to {{campaign_name}} — we really appreciated your interest and had a close look at your profile.

This time we're not able to move forward, mainly because the brief for this campaign is already covered by creators who match the audience profile more closely. It was a close call.

We'll keep your profile in our creator database, so we'd love to invite you to a future campaign that fits your content better.

Thanks again, and good luck with your content!
— {{manager_name}} · FX Creations`,
  },
  {
    id: "TPL-KOL-REMINDER",
    name: "KOL reminder",
    scope: "kol_reminder",
    channel: "whatsapp",
    isDefault: true,
    body: `Hi {{kol_name}} 👋 Just a friendly nudge about {{campaign_name}}:

{{stage_note}}

If everything is on track, no action needed — just reply "👍" so we know we're good.

Thanks for your patience!
— {{manager_name}} · FX Creations`,
  },
];

/**
 * Every variable a template may use, with a human label and a group
 * (KOL / Campaign / Product / Store / Ops).
 */
export const MESSAGE_VARIABLES: { key: string; label: string; group: string }[] = [
  { key: "kol_name", label: "KOL name", group: "KOL" },
  { key: "handle", label: "Social handle", group: "KOL" },
  { key: "whatsapp", label: "WhatsApp number", group: "KOL" },
  { key: "email", label: "Email", group: "KOL" },
  { key: "followers", label: "Follower count", group: "KOL" },
  { key: "platform", label: "Primary platform", group: "KOL" },
  { key: "niche", label: "Niche", group: "KOL" },
  { key: "campaign_name", label: "Campaign name", group: "Campaign" },
  { key: "campaign_code", label: "Campaign code", group: "Campaign" },
  { key: "requirements", label: "Campaign requirements", group: "Campaign" },
  { key: "deliverables", label: "Deliverables list", group: "Campaign" },
  { key: "mandatory_tags", label: "Mandatory hashtags", group: "Campaign" },
  { key: "disclosure", label: "Disclosure text", group: "Campaign" },
  { key: "post_start", label: "Posting window start", group: "Campaign" },
  { key: "post_end", label: "Posting window end", group: "Campaign" },
  { key: "application_deadline", label: "Application deadline", group: "Campaign" },
  { key: "brief_url", label: "Brief document link", group: "Campaign" },
  { key: "product_name", label: "Product name", group: "Product" },
  { key: "product_url", label: "Product link", group: "Product" },
  { key: "variant", label: "Product variant", group: "Product" },
  { key: "promo_code", label: "Promo code", group: "Product" },
  { key: "discount", label: "Discount value", group: "Product" },
  { key: "fee", label: "Fee / commission wording", group: "Product" },
  { key: "store_name", label: "Store name", group: "Store" },
  { key: "store_address", label: "Store address", group: "Store" },
  { key: "store_hours", label: "Store opening hours", group: "Store" },
  { key: "store_phone", label: "Store phone", group: "Store" },
  { key: "ref", label: "Application reference", group: "Ops" },
  { key: "manager_name", label: "Campaign manager", group: "Ops" },
  { key: "today", label: "Today's date", group: "Ops" },
  { key: "stage_note", label: "Stage-specific note", group: "Ops" },
];

/**
 * Replaces `{{key}}` occurrences with the matching value.
 * Unknown keys are left untouched so a missing value is visible, not silently
 * blanked out.
 */
export const renderTemplate = (
  template: string,
  vars: Record<string, string>,
): string => {
  const rendered = template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] ?? match : match,
  );

  // A line that held nothing but a placeholder and resolved to an empty
  // string is noise in a message the marketer is about to send — drop it.
  const sourceLines = template.split("\n");
  return rendered
    .split("\n")
    .filter((line, index) => {
      const original = (sourceLines[index] ?? "").trim();
      const onlyPlaceholder = /^\{\{\w+\}\}$/.test(original);
      return !(onlyPlaceholder && line.trim() === "");
    })
    .join("\n");
};

/**
 * The fee wording shown to a KOL. Respects the campaign owner's "show the fee
 * details" toggle — when it is off there is nothing to say, and saying
 * "gift" invites a KOL to ask for money.
 */
const feeText = (campaign?: Campaign): string => {
  if (!campaign || !campaign.feeDisplayEnabled) return "";
  const explicit = campaign.feeDisplayText?.trim();
  if (explicit) return explicit;
  if (campaign.feeModel === "flat") {
    return `Flat fee of $${campaign.feePerKol.toLocaleString("en-US")} per KOL`;
  }
  if (campaign.feeModel === "commission") {
    return `${campaign.commissionPct}% commission per sale`;
  }
  if (campaign.feeModel === "flat_commission") {
    return `Flat fee of $${campaign.feePerKol.toLocaleString("en-US")} plus ${campaign.commissionPct}% commission`;
  }
  return "A special gift for every selected KOL";
};

export interface MessageVarsInput {
  application: Application;
  kol?: Kol;
  campaign?: Campaign;
  store?: Store;
}

/**
 * Builds the variable bag consumed by `renderTemplate`.
 * Multi-line values (requirements, deliverables) are formatted here so
 * templates stay readable.
 */
export const buildMessageVars = ({
  application,
  kol,
  campaign,
  store,
}: MessageVarsInput): Record<string, string> => {
  const resolvedStore = store ?? findStore(application.pickupStoreId);
  const variant = campaign?.variants.find((v) => v.id === application.variantId);
  const deliverables =
    campaign?.deliverables
      .map(
        (d) =>
          `- ${d.count}× ${d.type} on ${d.platform}${d.length ? ` (${d.length})` : ""}`,
      )
      .join("\n") ?? "";

  return {
    kol_name: kol?.name ?? "",
    handle: kol ? `@${kol.handle}` : "",
    whatsapp: kol?.whatsapp ?? "",
    email: kol?.email ?? "",
    followers: kol ? kol.followers.toLocaleString("en-US") : "",
    platform: kol?.primaryPlatform ?? "",
    niche: kol?.niches.join(", ") ?? "",
    campaign_name: campaign?.name ?? "",
    campaign_code: campaign?.campaignCode ?? "",
    requirements: campaign?.requirements.join("\n") ?? "",
    deliverables,
    mandatory_tags: campaign?.mandatoryTags.join(" ") ?? "",
    disclosure: campaign?.disclosureText ?? "",
    post_start: campaign?.postStartDate ?? "",
    post_end: campaign?.postEndDate ?? "",
    application_deadline: campaign?.applicationDeadline ?? "",
    brief_url: campaign?.briefDocUrl ?? "",
    product_name: campaign?.productName ?? "",
    product_url: campaign?.productUrl ?? "",
    variant: variant?.label ?? "",
    promo_code: application.promoCode ?? "",
    discount: application.discountValue ?? "",
    fee: feeText(campaign),
    store_name: resolvedStore?.name ?? "",
    store_address: resolvedStore?.address ?? "",
    store_hours: resolvedStore?.hours ?? "",
    store_phone: resolvedStore?.phone ?? "",
    ref: application.id,
    manager_name: campaign?.manager ?? "",
    today: new Date().toISOString().slice(0, 10),
    stage_note: "",
  };
};
