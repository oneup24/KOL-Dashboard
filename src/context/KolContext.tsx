import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { normaliseHandle, seedKols } from "@/data/seedKols";
import { useSheets } from "@/context/SheetsContext";
import type {
  Kol,
  KolPostRecord,
  KolSource,
  KolStats,
  KolStatus,
  KolTier,
  Platform,
} from "@/types";

export interface NewKolInput {
  name: string;
  handle: string;
  platform: Platform;
  followers: number;
  whatsapp: string;
  email: string;
  platforms?: Platform[];
  primaryPlatform?: Platform;
  er?: number;
  igHandle?: string;
  niches?: string[];
  region?: string;
  tier?: KolTier;
  rateCard?: string;
  source?: KolSource;
  status?: KolStatus;
  rating?: number;
  tags?: string[];
  notes?: string;
  avatar?: string;
}

interface KolContextValue {
  kols: Kol[];
  addKol: (input: NewKolInput) => Kol;
  updateKol: (id: number, partial: Partial<Kol>) => void;
  removeKol: (id: number) => void;
  findByHandle: (handle: string) => Kol | undefined;
  getById: (id: number) => Kol | undefined;
  addPost: (kolId: number, post: KolPostRecord) => void;
  getKolStats: (kolId: number) => KolStats;
  touchLastContacted: (kolId: number) => void;
}

const KolContext = createContext<KolContextValue | null>(null);

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=45";

const nextKolId = (existing: Kol[]): number =>
  existing.length === 0 ? 1 : Math.max(...existing.map((k) => k.id)) + 1;

/** Mean ER across the posts that report one, rounded to 1 decimal. */
const averageEr = (posts: KolPostRecord[]): number => {
  const values = posts
    .map((p) => p.metrics?.er)
    .filter((er): er is number => typeof er === "number" && Number.isFinite(er));
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, er) => sum + er, 0) / values.length;
  return Math.round(mean * 10) / 10;
};

/** The most recent `postDate` across the given posts (ISO strings sort lexically). */
const latestPostDate = (posts: KolPostRecord[]): string | undefined =>
  posts.reduce<string | undefined>(
    (latest, post) => (!latest || post.postDate > latest ? post.postDate : latest),
    undefined,
  );

export const KolProvider = ({ children }: { children: ReactNode }) => {
  const [kols, setKols] = useState<Kol[]>(seedKols);
  // Guards against two records being created in the same tick, where the
  // state update has not been flushed yet.
  const assignedIds = useRef<Set<number>>(new Set());
  const { snapshot, push, remove: removeRemote } = useSheets();
  const hydrated = useRef(false);

  // Seed from the sheet once, the first time a snapshot arrives. Later
  // refreshes do not clobber local edits — the sheet is the write target,
  // not a live read loop.
  useEffect(() => {
    if (hydrated.current || !snapshot) return;
    if (snapshot.kols.length > 0) setKols(snapshot.kols);
    hydrated.current = true;
  }, [snapshot]);

  const addKol = useCallback(
    (input: NewKolInput): Kol => {
      const handle = normaliseHandle(input.handle);
      let id = nextKolId(kols);
      while (assignedIds.current.has(id) || kols.some((k) => k.id === id)) id += 1;
      assignedIds.current.add(id);

      const created: Kol = {
        id,
        name: input.name.trim(),
        handle,
        platforms: input.platforms && input.platforms.length > 0 ? input.platforms : [input.platform],
        primaryPlatform: input.primaryPlatform ?? input.platform,
        followers: input.followers,
        er: input.er ?? 0,
        whatsapp: input.whatsapp.trim(),
        email: input.email.trim(),
        igHandle: input.igHandle,
        niches: input.niches ?? [],
        region: input.region?.trim() ?? "HK",
        tier: input.tier ?? "Micro",
        rateCard: input.rateCard ?? "$0",
        source: input.source ?? "inbound",
        status: input.status ?? "active",
        rating: input.rating ?? 0,
        tags: input.tags ?? [],
        notes: input.notes,
        dateAdded: new Date().toISOString(),
        posts: [],
        avatar: input.avatar?.trim() || DEFAULT_AVATAR,
      };

      setKols((prev) => [...prev, created]);
      push("kols", created);
      return created;
    },
    [kols, push],
  );

  const updateKol = useCallback(
    (id: number, partial: Partial<Kol>) => {
      setKols((prev) =>
        prev.map((k) => (k.id === id ? { ...k, ...partial } : k)),
      );
      const current = kols.find((k) => k.id === id);
      if (current) push("kols", { ...current, ...partial });
    },
    [kols, push],
  );

  const removeKol = useCallback(
    (id: number) => {
      setKols((prev) => prev.filter((k) => k.id !== id));
      removeRemote("kols", id);
    },
    [removeRemote],
  );

  const findByHandle = useCallback(
    (handle: string): Kol | undefined => {
      const target = normaliseHandle(handle);
      if (!target) return undefined;
      return kols.find((k) => k.handle === target);
    },
    [kols],
  );

  const getById = useCallback(
    (id: number): Kol | undefined => kols.find((k) => k.id === id),
    [kols],
  );

  /**
   * Stores the whole post record — `postType`, `variantId` and the metrics
   * bag all ride along untouched.
   */
  const addPost = useCallback(
    (kolId: number, post: KolPostRecord) => {
      setKols((prev) =>
        prev.map((k) => (k.id === kolId ? { ...k, posts: [post, ...k.posts] } : k)),
      );
      const current = kols.find((k) => k.id === kolId);
      if (current) {
        push("kols", { ...current, posts: [post, ...current.posts] });
      }
    },
    [kols, push],
  );

  /**
   * CRM rollup for one creator — how many campaigns they have worked on,
   * how much content is live and their average engagement rate.
   */
  const getKolStats = useCallback(
    (kolId: number): KolStats => {
      const posts = kols.find((k) => k.id === kolId)?.posts ?? [];
      return {
        campaigns: new Set(posts.map((p) => p.campaignId)).size,
        postsLive: posts.length,
        avgER: averageEr(posts),
        lastPostDate: latestPostDate(posts),
      };
    },
    [kols],
  );

  const touchLastContacted = useCallback(
    (kolId: number) => {
      const now = new Date().toISOString();
      setKols((prev) =>
        prev.map((k) => (k.id === kolId ? { ...k, lastContactedAt: now } : k)),
      );
      const current = kols.find((k) => k.id === kolId);
      if (current) push("kols", { ...current, lastContactedAt: now });
    },
    [kols, push],
  );

  const value = useMemo(
    () => ({
      kols,
      addKol,
      updateKol,
      removeKol,
      findByHandle,
      getById,
      addPost,
      getKolStats,
      touchLastContacted,
    }),
    [
      kols,
      addKol,
      updateKol,
      removeKol,
      findByHandle,
      getById,
      addPost,
      getKolStats,
      touchLastContacted,
    ],
  );

  return <KolContext.Provider value={value}>{children}</KolContext.Provider>;
};

export const useKol = (): KolContextValue => {
  const ctx = useContext(KolContext);
  if (!ctx) {
    throw new Error("useKol must be used within a KolProvider");
  }
  return ctx;
};
