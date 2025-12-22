import type { HourlySMPData } from "@/types";

export interface SMPPriceTableProps {
  readonly hourlySMPData: HourlySMPData;
  readonly readOnly?: boolean;
}

export type DataSource = "manual" | "exchange";

