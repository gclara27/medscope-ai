import type { LucideIcon } from "lucide-react";
import { Cable, Rocket, ShieldCheck, SlidersHorizontal } from "lucide-react";

import type { SupportKbIconId } from "@/lib/supportKb";

export const SUPPORT_KB_ICONS: Record<SupportKbIconId, LucideIcon> = {
  rocket: Rocket,
  "sliders-horizontal": SlidersHorizontal,
  cable: Cable,
  "shield-check": ShieldCheck,
};
