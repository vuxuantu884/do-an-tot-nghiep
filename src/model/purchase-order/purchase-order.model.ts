import { BaseObject } from "./../base/base.response";
import { BaseQuery } from "model/base/base.query";
import { PurchaseAddress } from "./purchase-address.model";
import { Vat, PurchaseOrderLineItem, PurchaseOrderLineReturnItem } from "./purchase-item.model";
import { PurchaseProcument, PurchaseProcumentLineItem } from "./purchase-procument";
import { PurchasePayments } from "./purchase-payment.model";
import { PurchaseReturnOrder } from "./purchase-return.model";
import { EnumOptionValueOrPercent } from "config/enum.config";
import { Moment } from "moment";

export interface PurchaseOrder extends BaseObject {
  dataSource: ProcurementTable[];
  companyId: number;
  assign_account_code: string;
  supplier_id: number;
  supplier: string;
  supplier_note: string;
  phone: string;
  billing_address: PurchaseAddress;
  supplier_address: PurchaseAddress;
  line_items: Array<PurchaseOrderLineItem>;
  procurements: Array<PurchaseProcument>;
  procurements_cancelled: Array<PurchaseProcument>;
  return_orders: Array<PurchaseReturnOrder>;
  expect_return_date: string;
  note: string;
  tags: string;
  policy_price_code: string;
  is_cancel: boolean;
  payments: Array<PurchasePayments>;
  trade_discount_rate: number;
  trade_discount_value: number;
  trade_discount_amount: number;
  payment_discount_rate: number;
  payment_discount_value: number;
  payment_discount_amount: number;
  untaxed_amount: number;
  tax: number;
  total: number;
  total_paid: number;
  total_payment: number;
  total_refunds: number;
  receipt_quantity: number;
  planned_quantity: number;
  status: string;
  financial_status: string;
  receive_status: string;
  cancel_reason: string;
  order_date: string;
  cancelled_date: string;
  activated_date: string;
  completed_date: string;
  payment_term_id: string;
  tax_lines: Array<Vat>;
  import_date: string;
  store_id: number;
  payment_condition_id: number;
  payment_condition_name: string;
  payment_note: string;
  merchandiser_code: string;
  merchandiser: string;
  qc: string;
  qc_code: string;
  designer?: string;
  designer_code?: string;
  is_grid_mode: boolean;
  reference?: string;
  waiting_approval_date?: string;
  receive_finished_date?: string;
  supplier_code?: string;
  ap_closing_date: string | null;
}

export interface PurchaseOrderQuery extends BaseQuery {
  info?: string;
  from_order_date?: Date;
  to_order_date?: Date;
  from_cancelled_date?: Date;
  to_cancelled_date?: Date;
  from_activated_date?: Date;
  to_activated_date?: Date;
  from_completed_date?: Date;
  to_completed_date?: Date;
  from_expect_import_date?: Date;
  to_expect_import_date?: Date;
  status?: string;
  financial_status?: string;
  receive_status?: string;
  merchandiser?: string;
  qc?: string;
  cost_included?: boolean;
  tax_included?: boolean;
  expected_store?: string;
  note?: string;
  supplier_note?: string;
  tags?: string;
  reference?: string;
  ids?: string;
}
export interface PurchaseOrderPrint {
  purchaseOrderId: number;
  html_content: string;
  size: string;
}

export interface ProcumentLogQuery extends BaseQuery {
  condition?: string;
  created_date_from?: Date;
  created_date_to?: Date;
}

export interface ProcurementTable extends PurchaseProcumentLineItem {
  quantityLineItems: number;
  plannedQuantities: Array<number | undefined>;
  realQuantities: Array<number | undefined>;
  uuids: Array<string>;
}

export interface ValueQuantity<T> {
  expect_receipt_date: string;
  date?: string;
  value: T;
}

export interface ProcurementPropertiesDate {
  id?: string;
  value: Date | string;
}
export interface ProcurementProperties {
  date: Array<ProcurementPropertiesDate>;
  real_quantity: Array<ValueQuantity<number>>;
  planned_quantity: Array<ValueQuantity<number>>;
  retail_price: number;
  sku: string;
  product_name: string;
  price: number;
  barcode: string;
  variant_image: string;
  variant_images: string;
  variant: string;
  note: string;
}

/**
 * Mapping size và màu sắc cho việc validate, hiển thị line-item
 */
export interface POPairSizeColor {
  lineItemId?: number;
  size: string;
  color: string;
  variantId: number;
  sku: string;
  product_id: number;
  product: string;
  variant: string; // variant name
  barcode: string;
  product_type: string;
  unit: string;
  variant_image?: string;
  retailPrice: number;
  receipt_quantity?: number;
  planned_quantity?: number;
  cost_price: number;
}

export enum enumConvertDate {
  DAY = "day",
  MONTH = "month",
  YEAR = "year",
}

export interface POLineItemColor {
  color_code: string;
  color: string;
  lineItemPrice?: number; // Giá của line-item : giá nhập| init lần đầu để mapping sang Object value. không dùng
  retail_price: number;
}
export interface POLineItemGridSchema {
  productId: number;
  productName: string;
  productCode: string;
  baseSize: string[];
  baseColor: POLineItemColor[];
  mappingColorAndSize: Array<POPairSizeColor>; // key: size, value: danh sách màu của size đó | key: color, value: danh sách size của màu đó
  variantIdList: number[];
  estimatedDate?: Array<POestimatedDate>;
  quantity?: number;
}

export interface POestimatedDate {
  date: Date | string;
  quantity: number;
}
// số lượng của size theo màu
export interface POPairSizeQuantity {
  size: string;
  quantity: number;
  variantId: number | null;
}
// Dùng trong Map<color, POLineItemGridValue>[]
export declare type POLineItemGridValue = {
  /**
   * {
   * price: 200000,//giá nhập
   * sizeValues : [
   *  {
   *    size: "M",
   *    quantity: "9",
   *    variantId: 1009
   *  }
   * ]
   */
  retail_price: number;
  price: number;
  sizeValues: Array<POPairSizeQuantity>;
};

export interface POExpectedDate {
  date: string;
  value: number;
  option: EnumOptionValueOrPercent;
}
export interface PODataSourceProduct {
  productId: number;
  productCode: string;
  productName: string;
  color_code: string;
  color: string;
  sku: string;
  lineItemPrice?: number; // Giá nhập dùng chung cho 1 màu (nhiều size)
  schemaIndex: number;
  quantity?: number | string;
  expectedDate: POExpectedDate[];
  variantId: number;
  variant_id: number;
}

export interface PODataSourceVariantItemGrid {
  variantId: number;
  disabled: boolean;
  productId: number;
  productCode: string;
  productName: string;
  schemaIndex: number;
}
export interface PODataSourceSize {
  [key: string]: PODataSourceVariantItemGrid;
}

export type PODataSourceGrid = PODataSourceProduct & PODataSourceSize;

export interface PurchaseOrderBySupplierQuery extends BaseQuery {
  condition?: string;
}

export interface POStampPrintingVariant {
  variant_id: number;
  quantity_req: number;
}

export interface POStampPrinting {
  type_name: string;
  order_code: string;
  order_id: number;
  supplier_id: number;
  supplier: string;
  note: string;
  variants: Array<POStampPrintingVariant>;
}

export type ProductStampPrinting = {
  variant_id: number;
  quantity_req: number;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  planQuantity: number;
  product_id: number;
};

export type POProgressResult = {
  total: number;
  success: number;
  processed: number;
  errors: number;
  message_errors: Array<string>;
};
export interface PurchaseOrderPercentsQuery {
  month: number;
}

export interface PurchaseOrderReturn extends BaseObject {
  expect_return_date: Date;
  line_return_items: Array<PurchaseOrderLineReturnItem>;
  payment_return_note?: string;
  phone?: number;
  purchase_order: PurchaseOrder;
  return_reason: string;
  store_id: number;
  store: string;
  supplier?: string;
  supplier_code?: any;
  supplier_id?: number;
  total_refunds?: number;
  untaxed_amount_refunds?: number;
}

export interface PurchaseOrderReturnQuery extends BaseQuery {
  info?: string;
  store_ids?: Array<number>;
  merchandisers?: Array<string>;
  supplier_ids?: Array<number>;
  created_date_from?: string;
  created_date_to?: string;
  [key: string]: any;
}

export interface PurchaseOrderDeliverDateUpdate {
  delivery_date: Date | string | Moment;
  procurement_ids: Array<number>;
}
