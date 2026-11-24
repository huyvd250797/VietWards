import { ROADMAP, UX_ROADMAP, type FoundationRoadmapStatus, type UXRoadmapStatus } from "../src/lib/config";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;

type CheckFoundation = Assert<Equal<(typeof ROADMAP)[number]["status"], FoundationRoadmapStatus>>;
type CheckUX = Assert<Equal<(typeof UX_ROADMAP)[number]["status"], UXRoadmapStatus>>;
type CheckDisjoint = Assert<Equal<Extract<UXRoadmapStatus, "partial">, never>>;
type CheckNoCurrentInFoundation = Assert<Equal<Extract<FoundationRoadmapStatus, "current">, never>>;

// The compiler must reject invalid status assignments if this contract ever regresses.
const uxStatus: UXRoadmapStatus = "planned";
const foundationStatus: FoundationRoadmapStatus = "partial";
void uxStatus;
void foundationStatus;
void (0 as unknown as CheckFoundation);
void (0 as unknown as CheckUX);
void (0 as unknown as CheckDisjoint);
void (0 as unknown as CheckNoCurrentInFoundation);
