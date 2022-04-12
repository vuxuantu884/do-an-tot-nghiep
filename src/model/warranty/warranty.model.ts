import { BaseQuery } from "model/base/base.query";
import { BaseObject } from "model/base/base.response";

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

export enum WarrantyReturnStatus {
    RECEIVED = "RECEIVED",
    UNRECEIVED = "UNRECEIVED",
}

export enum WarrantyItemType {
    WARRANTY = "WARRANTY",
    REPAIR = "REPAIR",
}

export enum WarrantyFormType {
    SHIPPING = "SHIPPING",
    STORE = "STORE",
}

export interface WarrantyPayment {
    id: number;
    code: string;
    value: number;
    payment_method_id: number;
    payment_method: string;
}

export interface WarrantyExpense {
    id: number;
    code: string;
    reason_id: number;
    reason: string;
    price: number;
    customer_fee: number;
}
export interface WarrantyListRequest {
    ids?: string[];
    store_ids: number[];
    customer_ids?: number[];
    customer?: string;
    warranty_status?: WarrantyStatus;
    financial_status?: WarrantyFinancialStatus;
    return_status?: WarrantyReturnStatus;
    type?: WarrantyItemType;
    warranty_type?: WarrantyFormType;
    warranty_center_ids?: number[];
    from_appointment_date?: Date;
    to_appointment_date?: Date;
    from_created_date?: Date;
    to_created_date?: Date;
}

export interface WarrantyModel extends BaseObject {
    assignee: string;
    assignee_code: string;
    customer: string;
    customer_address: string;
    customer_code: string;
    customer_id: number;
    customer_mobile: string;
    financial_status: WarrantyFinancialStatus;
    note: string;
    payments: WarrantyPayment[];
    reference: string;
    status: WarrantyStatus;
    store: string;
    store_id: number;
    total_amount: number;
    type: WarrantyFormType;
    line_items: WarrantyItemModel[];
    return_status: WarrantyReturnStatus;
    purchase_date: Date | null;
    appointment_date: Date | null;
}

export interface WarrantyItemModel extends BaseObject {
    appointment_date: Date;
    product_id: number;
    product: string;
    variant_id: number;
    variant: string;
    sku: string;
    warranty_center_id: number;
    warranty_center: string;
    note: Date;
    fixing_date: Date;
    fixed_date: Date;
    price: number;
    customer_fee: number;
    status: WarrantyItemStatus;
    type: WarrantyItemType;
    expenses: WarrantyExpense[];
    warranty: WarrantyModel;
}

export interface GetWarrantiesParamModel extends BaseQuery {
    ids?: number[];
    store_ids?: number[];
    customer_ids?: number[];
    customer?: string;
    warranty_status?: WarrantyStatus;
    financial_status?: WarrantyFinancialStatus;
    status?: WarrantyStatus;
    return_status?: any;
    from_created_date: string|null;
    from_appointment_date: string|null;
    type: WarrantyItemType|null;
}

export interface WarrantyGetModel extends BaseObject {
    appointment_date: Date;
    customer_fee: number;
    expenses: [{id: 1, code: "dBYTrN4D8rmx", reason_id: 1, reason: "LÝ DO KHÁC"}]
    note: string;
    price: number;
    product: string;
    product_id: number;
    purchase_date: Date;
    sku: string;
    status: WarrantyStatus;
    type: WarrantyFormType;
    variant: string;
    variant_id: number;
    version: number;
    warranty: any;
    warranty_center: string;
    warranty_center_id: string;
}