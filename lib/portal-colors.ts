// lib/portal-colors.ts
export const PORTAL_COLORS = {
  respengr: '#FF00FF',  // Fuchsia
  prappt: '#00FFFF',   // Teal
  aiboumos: '#8040C0'   // Purple
} as const;

export type PortalName = keyof typeof PORTAL_COLORS;