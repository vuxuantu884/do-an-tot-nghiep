export interface GrossProfitReportParams {
  date: string;
  productGroup?: string;
  sku3?: string;
  sku7?: string;
  slag?: "sku7" | "sku3";
}
