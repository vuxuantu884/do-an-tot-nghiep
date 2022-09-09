export interface ShopRevenu23eModel {
  card_payment: number;
  transfer_payment: number;
  vnpay_payment: number;
  spos_payment: number;
  mpos_payment: number;
  momo_payment: number;
}

export interface ShopRevenueTotalModel {
  tongPhaiNop: number;
  daNop: number;
  keToanThucNhan: number;
  conPhaiNop: number;
}

export interface RevenueStatusModel {
  title: string;
  value: string;
}
