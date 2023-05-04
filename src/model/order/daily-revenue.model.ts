import { BaseObject } from "model/base/base.response";

export interface ShopRevenueModel {
  cash_payments: number;
  vnpay_payments: number;
  momo_payments: number;
  transfer_payments: number;
  card_payments: number;
  unknown_payments: number;
  vcb_payments: number;
  total_revenue: number;
}

export interface DailyRevenueOtherPaymentModel extends BaseObject {
  daily_payment_id: number;
  name: string;
  payment: number;
  cost: number;
  description: string;
  type: string;
  method?: string;
}

export interface DailyRevenueDetailModel extends BaseObject, ShopRevenueModel {
  id: number;
  date: string;
  store_id: number;
  account_code: string;
  account_name: string;
  total_payment: number;
  total_cost: number;
  net_payment: number;
  remaining_amount: number;
  state: string;
  cash_payment: number;
  deleted: false;
  deleted_at: Date;
  revision: number;
  other_payments: DailyRevenueOtherPaymentModel[];
  total_revenue: number; // Tổng doanh thu
  other_cost: number; // Tổng chi phí
  other_payment: number; //Tổng phụ thu
  amount: number; // Tổng phải nộp
  accountant_note: string;
  store_note: string;
  created_at: Date;
  paying_at: Date;
  opened_at: Date;
  closed_at: Date;
  updated_at: Date;
  updated_by: string;
  created_by: string;
  opened_by: string;
  closed_by: string;
  image_url?: string | null;
}

export interface DailyRevenueOtherPaymentParamsModel {
  name: string | undefined;
  payment: number | undefined;
  cost: number | undefined;
  description: string | undefined;
  type?: string;
  method?: string;
}

export type DailyRevenuePaymentStatusModel = {
  title: string;
  value: string;
};

export type DailyRevenueVisibleCardElementModel = {
  revenueCard: {
    show: boolean;
    updateButton: boolean;
  };
  shopCostAndSurchargeCard: {
    show: boolean;
  };
  shopCostCard: {
    show: boolean;
    addButton: boolean;
    actionButton: boolean;
  };
  shopSurchargeCard: {
    show: boolean;
    addButton: boolean;
    actionButton: boolean;
  };
  totalRevenueCard: {
    show: boolean;
    payMoneyButton: boolean;
    confirmMoneyButton: boolean;
    uploadPayment: boolean;
    result: boolean;
  };
};

export interface DailyRevenueOtherPaymentTypeModel {
  code: string;
  description: string;
}

export type DailyRevenueOtherPaymentTypeArrModel = {
  title: string;
  value: string;
}[];

export type DaiLyRevenuePermissionModel = {
  allowDailyPaymentsUpdate?: boolean;
  allowDailyPaymentsUpdateCost?: boolean;
  allowDailyPaymentsUpdatePayment?: boolean;
  allowDailyPaymentsSubmit?: boolean;
  allowDailyPaymentsConfirm?: boolean;
};
