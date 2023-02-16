import { TypeSku } from "../enums/type-sku.enum";

export interface SellingPowerReportParams {
  date: string;
  typeSKU: TypeSku;
  productGroupLv1?: string;
  productGroupLv2?: string;
  ma3?: string;
  ma7?: string;
  ma13?: string;
}
