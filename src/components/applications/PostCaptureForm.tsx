import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { ExternalLink, Link2, Save, ChartColumn } from "lucide-react";
import { useApplications } from "@/context/ApplicationsContext";
import { useKol } from "@/context/KolContext";
import { platformFromUrl } from "@/components/shared/workflow";
import type { Application, Campaign, Kol, KolPostMetrics, Platform } from "@/types";

interface PostCaptureFormProps {
  application: Application;
  kol: Kol | undefined;
  campaign: Campaign | undefined;
}

const POST_TYPES = [
  "Reel",
  "Story",
  "Carousel post",
  "Photo set",
  "TikTok",
  "Short video",
  "Long-form video",
  "RED post",
  "Live stream",
];

const toNumber = (raw: string): number | undefined => {
  const cleaned = raw.trim().replace(/,/g, "");
  if (!cleaned) return undefined;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : undefined;
};

const PostCaptureForm = ({ application, kol, campaign }: PostCaptureFormProps) => {
  const { updateStatus } = useApplications();
  const { addPost } = useKol();
  const uid = useId();

  const [postUrl, setPostUrl] = useState(application.postUrl ?? "");
  const [postDate, setPostDate] = useState(application.postDate ?? "");
  const [postType, setPostType] = useState<string>(application.postType ?? "");
  const [platform, setPlatform] = useState<Platform | "">(
    application.postPlatform ?? platformFromUrl(application.postUrl ?? "") ?? "",
  );
  const [reach, setReach] = useState(application.postMetrics?.reach?.toString() ?? "");
  const [views, setViews] = useState(application.postMetrics?.views?.toString() ?? "");
  const [likes, setLikes] = useState(application.postMetrics?.likes?.toString() ?? "");
  const [comments, setComments] = useState(
    application.postMetrics?.comments?.toString() ?? "",
  );
  const [saves, setSaves] = useState(application.postMetrics?.saves?.toString() ?? "");
  const [er, setEr] = useState(application.postMetrics?.er?.toString() ?? "");
  const [saved, setSaved] = useState(false);

  // Keep the platform in sync with the URL the marketer pasted in.
  useEffect(() => {
    const detected = platformFromUrl(postUrl);
    if (detected) setPlatform(detected);
  }, [postUrl]);

  const metrics = useMemo<KolPostMetrics>(() => {
    const value: KolPostMetrics = {};
    const reachValue = toNumber(reach);
    const viewsValue = toNumber(views);
    const likesValue = toNumber(likes);
    const commentsValue = toNumber(comments);
    const savesValue = toNumber(saves);
    const erValue = toNumber(er);
    if (reachValue !== undefined) value.reach = reachValue;
    if (viewsValue !== undefined) value.views = viewsValue;
    if (likesValue !== undefined) value.likes = likesValue;
    if (commentsValue !== undefined) value.comments = commentsValue;
    if (savesValue !== undefined) value.saves = savesValue;
    if (erValue !== undefined) value.er = erValue;
    return value;
  }, [reach, views, likes, comments, saves, er]);

  const autoEr = () => {
    const reachValue = toNumber(reach);
    const likesValue = toNumber(likes) ?? 0;
    const commentsValue = toNumber(comments) ?? 0;
    const savesValue = toNumber(saves) ?? 0;
    if (!reachValue) return;
    const computed = ((likesValue + commentsValue + savesValue) / reachValue) * 100;
    setEr(computed.toFixed(2));
  };

  const handleSave = () => {
    const trimmedUrl = postUrl.trim();
    if (!trimmedUrl) return;
    const resolvedPlatform = platform || platformFromUrl(trimmedUrl) || "Instagram";
    const trimmedType = postType.trim();
    // The product variant the KOL received — stored on the application.
    const variantId = application.variantId ?? campaign?.variants[0]?.id;

    updateStatus(application.id, application.status, {
      postUrl: trimmedUrl,
      postPlatform: resolvedPlatform,
      postDate: postDate.trim() || undefined,
      postType: trimmedType || undefined,
      postMetrics: metrics,
    });

    if (kol) {
      // One CRM post per post URL — editing the URL adds a new post, saving
      // the same URL again does not duplicate it.
      const alreadyRecorded = kol.posts.some((p) => p.postUrl === trimmedUrl);
      if (!alreadyRecorded) {
        addPost(kol.id, {
          id: `POST-${application.id}-${Date.now()}`,
          campaignId: application.campaignId,
          postUrl: trimmedUrl,
          platform: resolvedPlatform,
          postDate: postDate.trim() || new Date().toISOString().slice(0, 10),
          postType: trimmedType || undefined,
          variantId,
          metrics,
        });
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor={`${uid}-post-url`}>Post URL</Label>
          <div className="relative">
            <Link2
              size={14}
              className="absolute left-3 top-1/2 -translate-y-0.5 text-slate-400 pointer-events-none"
            />
            <input
              id={`${uid}-post-url`}
              type="url"
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              placeholder="https://www.instagram.com/p/..."
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
            />
          </div>
          {postUrl ? (
            <a
              href={postUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
            >
              Open post <ExternalLink size={10} />
            </a>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`${uid}-post-platform`}>Platform</Label>
            <select
              id={`${uid}-post-platform`}
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform | "")}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
            >
              <option value="">Auto-detect</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="Xiaohongshu">Xiaohongshu</option>
              <option value="YouTube">YouTube</option>
            </select>
          </div>
          <div>
            <Label htmlFor={`${uid}-post-date`}>Post date</Label>
            <input
              id={`${uid}-post-date`}
              type="date"
              value={postDate}
              onChange={(e) => setPostDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
            />
          </div>
          <div>
            <Label htmlFor={`${uid}-post-type`}>Post type</Label>
            <input
              id={`${uid}-post-type`}
              type="text"
              list="post-type-options"
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              placeholder="e.g. Reel"
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
            />
            <datalist id="post-type-options">
              {POST_TYPES.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
          <ChartColumn size={12} /> Metrics
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricInput label="Reach" value={reach} onChange={setReach} />
          <MetricInput label="Views" value={views} onChange={setViews} />
          <MetricInput label="Likes" value={likes} onChange={setLikes} />
          <MetricInput label="Comments" value={comments} onChange={setComments} />
          <MetricInput label="Saves" value={saves} onChange={setSaves} />
          <div>
            <Label htmlFor={`${uid}-post-er`}>ER %</Label>
            <div className="flex gap-1">
              <input
                id={`${uid}-post-er`}
                type="text"
                inputMode="decimal"
                value={er}
                onChange={(e) => setEr(e.target.value)}
                placeholder="5.2"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
              />
              <button
                type="button"
                onClick={autoEr}
                title="Compute from reach, likes, comments and saves"
                className="px-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-[10px] font-semibold uppercase"
              >
                Auto
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!postUrl.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          <Save size={14} /> {saved ? "Saved" : "Save post data"}
        </button>
        {campaign ? (
          <p className="text-xs text-slate-500">
            Saves to the application and to {kol?.name ?? "the KOL"}&apos;s CRM post history.
          </p>
        ) : null}
      </div>
    </div>
  );
};

const Label = ({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor: string;
}) => (
  <label
    htmlFor={htmlFor}
    className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5"
  >
    {children}
  </label>
);

const MetricInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
      />
    </div>
  );
};

export default PostCaptureForm;
