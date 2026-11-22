/** Contracts for later versions. No administrative dataset is claimed as verified in V0.1.0. */
export type HistoricalPeriod = "pre_2025_07_01" | "current";
export type AdministrativeLevel = "province" | "district_legacy" | "commune";
export type AdministrativeKind = "province" | "municipality" | "ward" | "commune" | "special_zone" | "district_legacy";

export type SourceReference = {
  title: string;
  url: string;
  issuer?: string;
  publishedOn?: string; // YYYY-MM-DD
  retrievedOn?: string; // YYYY-MM-DD
};

export type VerifiedMetric = {
  value: number;
  unit: "km2" | "people";
  observedOn?: string;
  publishedOn?: string;
  source: SourceReference;
  verification: "verified" | "pending" | "provisional";
};

export type AdministrativeUnit = {
  id: string;
  code: string;
  name: string;
  level: AdministrativeLevel;
  kind: AdministrativeKind;
  validFrom: string;
  validTo?: string;
  parentId?: string;
  geometryRef?: string;
  area?: VerifiedMetric;
  population?: VerifiedMetric;
  licensePlatePrefixes?: string[];
  sources: SourceReference[];
};

/** Supports full and partial merge, split, reclassification and succession. */
export type AdministrativeTransition = {
  fromUnitId: string;
  toUnitId: string;
  validFrom: string;
  relation: "full" | "partial" | "renamed" | "reclassified";
  source: SourceReference;
};
