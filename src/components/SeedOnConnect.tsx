import { useEffect, useRef, useState } from "react";
import { useApplications } from "@/context/ApplicationsContext";
import { useCampaigns } from "@/context/CampaignsContext";
import { useKol } from "@/context/KolContext";
import { useSheets } from "@/context/SheetsContext";
import type { SheetsSnapshot } from "@/services/sheetsApi";

/**
 * Pushes the records the dashboard is showing into a sheet that is still
 * empty.
 *
 * Until now a brand new sheet stayed empty until the marketer found the
 * "Push everything to the sheet" button in Settings — and a campaign created
 * before that was simply lost on the next refresh, because the sheet had
 * nothing in it. Seeding on connect closes that gap: the first time the
 * dashboard is pointed at an empty sheet, it writes what it already holds.
 *
 * The seed happens exactly once per connection. It never runs when the sheet
 * already has data (the sheet wins), and never when no sheet is configured.
 */
const SeedOnConnect = () => {
  const { enabled, snapshot, sheetIsEmpty, connectionId, pushAll } = useSheets();
  const { campaigns } = useCampaigns();
  const { kols } = useKol();
  const { applications, messageLog } = useApplications();

  // The connection this browser has already seeded.
  const seededFor = useRef<number | null>(null);
  // The snapshot the domain contexts have finished hydrating from.
  const [hydratedSnapshot, setHydratedSnapshot] = useState<SheetsSnapshot | undefined>(
    undefined,
  );

  /**
   * The domain contexts hydrate from the same snapshot, in their own effects.
   * This effect waits a tick after the snapshot lands so their hydration has
   * already happened before anything is pushed — otherwise a stale in-memory
   * list could be written over freshly loaded records.
   *
   * In the seeding case the sheet is empty, so hydration is a no-op and the
   * in-memory records are the ones to keep.
   */
  useEffect(() => {
    if (!snapshot) {
      setHydratedSnapshot(undefined);
      return;
    }
    const timer = window.setTimeout(() => setHydratedSnapshot(snapshot), 0);
    return () => window.clearTimeout(timer);
  }, [snapshot]);

  useEffect(() => {
    if (!enabled) return;
    if (!snapshot) return;
    if (sheetIsEmpty !== true) return;
    // Only seed against the snapshot the domain contexts have hydrated from.
    if (!hydratedSnapshot || hydratedSnapshot !== snapshot) return;
    // Once per connection — pointing the dashboard at another sheet re-arms it.
    if (seededFor.current === connectionId) return;
    seededFor.current = connectionId;

    pushAll("campaigns", campaigns);
    pushAll("kols", kols);
    pushAll("applications", applications);
    pushAll("messageLog", messageLog);
  }, [
    enabled,
    snapshot,
    sheetIsEmpty,
    hydratedSnapshot,
    connectionId,
    campaigns,
    kols,
    applications,
    messageLog,
    pushAll,
  ]);

  return null;
};

export default SeedOnConnect;
