import type { Store } from "@/types";

export const stores: Store[] = [
  {
    id: "cwb",
    name: "FX Creations Causeway Bay",
    district: "Causeway Bay",
    address: "Shop 218, 2/F, Hysan Place, 500 Hennessy Road, Causeway Bay, Hong Kong",
    hours: "11:00 – 22:00",
    phone: "+852 2882 1218",
  },
  {
    id: "mk",
    name: "FX Creations Mong Kok",
    district: "Mong Kok",
    address: "Shop G23, G/F, Langham Place, 8 Argyle Street, Mong Kok, Hong Kong",
    hours: "11:00 – 22:00",
    phone: "+852 2789 2023",
  },
  {
    id: "tst",
    name: "FX Creations Tsim Sha Tsui",
    district: "Tsim Sha Tsui",
    address: "Shop 207, 2/F, iSQUARE, 63 Nathan Road, Tsim Sha Tsui, Hong Kong",
    hours: "10:30 – 22:30",
    phone: "+852 2735 8207",
  },
  {
    id: "st",
    name: "FX Creations Sha Tin",
    district: "Sha Tin",
    address: "Shop 327, Level 3, New Town Plaza Phase 1, Sha Tin, New Territories",
    hours: "11:00 – 22:00",
    phone: "+852 2606 3327",
  },
  {
    id: "tm",
    name: "FX Creations Tuen Mun",
    district: "Tuen Mun",
    address: "Shop 1141, Level 1, TMT Plaza, 1 Tuen Shing Street, Tuen Mun, New Territories",
    hours: "11:00 – 22:00",
    phone: "+852 2450 1141",
  },
];

export const findStore = (id: string): Store | undefined =>
  stores.find((s) => s.id === id);
