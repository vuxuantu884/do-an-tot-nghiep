export interface ProcurementDataResult {
  id: number;
  code: string;
  status: string;
  total: number;
  url?: string;
  total_process: number;
  processed: number;
  success: number;
  percent: number;
  error: number;
  message: Array<ProcurementImportResult>;
}

export interface ProcurementImportResult {
  purchase_orders: Array<PurchaseOrderImportResult>;
  total_po?: number;
  total_pr?: number;
}

export interface PurchaseOrderImportResult {
  id: string;
  pr_ids: string;
}
