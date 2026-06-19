// Re-export the canonical data contract so front-end modules import from a
// single, stable path. The source of truth lives in /shared/types.ts and is
// shared with the backend checker.
export type * from "../../shared/types.ts";
