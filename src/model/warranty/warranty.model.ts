export enum WarrantyStatus {
    NEW = "NEW",
    FINALIZED = "FINALIZED",
    FINISH = "FINISH",
}

export enum WarrantyFinancialStatus {
    UNPAID = "UNPAID",
    PAID = "PAID",
}

export enum WarrantyItemStatus {
    RECEIVED = "RECEIVED",
    FIXING = "FIXING",
    FIXED = "FIXED",
    NOT_FIXED = "NOT_FIXED",
    FINISH = "FINISH",
}

export enum WarrantyItemType {
    WARRANTY = "WARRANTY",
    REPAIR = "REPAIR",
}

export enum WarrantyFormType {
    SHIPPING = "SHIPPING",
    STORE = "STORE",
}
export interface WarrantyListRequest {
    ids?: string[];
    store_ids: number[];
    customer_ids?: number[];
    customer?: string;
    warranty_status?: WarrantyStatus;
    financial_status?: WarrantyFinancialStatus;
    status?: WarrantyItemStatus;
    type?: WarrantyItemType;
    warranty_type?: WarrantyFormType;
    warranty_center_ids?: number[];
    from_appointment_date?: Date;
    to_appointment_date?: Date;
    from_created_date?: Date;
    to_created_date?: Date;
}