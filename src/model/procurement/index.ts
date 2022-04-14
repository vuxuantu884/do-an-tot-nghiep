export interface ProcurementCreate {
  id: number;
  code: string;
  status: string;
  total: number,
  url?: string;
  total_process: number;
  processed: number
  success: number
  percent: number
  error: number
  message: ProcurementCreatePO[]
}

export interface ProcurementCreatePO {
  po_ids?: string
  total_po?: number
}
