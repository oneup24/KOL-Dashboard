import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedApplications } from "@/data/seedApplications";
import type { Application, ApplicationStatus, Platform } from "@/types";

interface NewApplicationInput {
  campaignId: number;
  kolName: string;
  socialHandle: string;
  socialPlatform: Platform;
  followers: string;
  whatsapp: string;
  email: string;
  pickupStoreId: string;
  notes?: string;
}

interface ApplicationsContextValue {
  applications: Application[];
  newCount: number;
  addApplication: (input: NewApplicationInput) => Application;
  updateStatus: (id: string, status: ApplicationStatus, extras?: Partial<Application>) => void;
  getByCampaign: (campaignId: number) => Application[];
  getById: (id: string) => Application | undefined;
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

const generateId = (): string => {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `APP-${stamp}-${rand}`;
};

export const ApplicationsProvider = ({ children }: { children: ReactNode }) => {
  const [applications, setApplications] = useState<Application[]>(seedApplications);

  const addApplication = useCallback((input: NewApplicationInput): Application => {
    const now = new Date().toISOString();
    const next: Application = {
      id: generateId(),
      campaignId: input.campaignId,
      kolName: input.kolName,
      socialHandle: input.socialHandle,
      socialPlatform: input.socialPlatform,
      followers: input.followers,
      whatsapp: input.whatsapp,
      email: input.email,
      pickupStoreId: input.pickupStoreId,
      notes: input.notes,
      status: "New",
      appliedAt: now,
      updatedAt: now,
    };
    setApplications((prev) => [next, ...prev]);
    return next;
  }, []);

  const updateStatus = useCallback(
    (id: string, status: ApplicationStatus, extras?: Partial<Application>) => {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                ...extras,
                status,
                updatedAt: new Date().toISOString(),
              }
            : a,
        ),
      );
    },
    [],
  );

  const getByCampaign = useCallback(
    (campaignId: number) => applications.filter((a) => a.campaignId === campaignId),
    [applications],
  );

  const getById = useCallback(
    (id: string) => applications.find((a) => a.id === id),
    [applications],
  );

  const newCount = useMemo(
    () => applications.filter((a) => a.status === "New").length,
    [applications],
  );

  const value = useMemo(
    () => ({ applications, newCount, addApplication, updateStatus, getByCampaign, getById }),
    [applications, newCount, addApplication, updateStatus, getByCampaign, getById],
  );

  return (
    <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>
  );
};

export const useApplications = (): ApplicationsContextValue => {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) {
    throw new Error("useApplications must be used within an ApplicationsProvider");
  }
  return ctx;
};
