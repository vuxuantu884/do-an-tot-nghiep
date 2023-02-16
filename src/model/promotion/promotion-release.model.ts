import { BaseQuery } from "model/base/base.query";

export enum PromotionReleaseMethod {
  DISCOUNT_CODE_QTY = "DISCOUNT_CODE_QTY", // Chương trình Khuyến mại theo sản phẩm
  ORDER_THRESHOLD = "ORDER_THRESHOLD", // Chương trình Khuyến mại theo đơn hàng
  IS_SMS_VOUCHER = "IS_SMS_VOUCHER", // Chương trình Khuyến mại có tặng mã giảm giá qua sms
}
export const PromotionReleaseField = {
  is_registered: "is_registered",
  entitled_method: "entitled_method",
  creators: "creators",
  store_ids: "store_ids",
  channels: "channels",
  source_ids: "source_ids",
  starts_date: "starts_date",
  ends_date: "ends_date",
};

export const PromotionReleaseFieldMapping = {
  [PromotionReleaseField.creators]: "Người tạo khuyến mại",
  [PromotionReleaseField.entitled_method]: "Phương thức khuyến mại",
  [PromotionReleaseField.store_ids]: "Cửa hàng áp dụng",
  [PromotionReleaseField.channels]: "Kênh bán hàng áp dụng",
  [PromotionReleaseField.source_ids]: "Nguồn đơn hàng áp dụng",
  [PromotionReleaseField.is_registered]: "Đăng ký với Bộ Công Thương",
  [PromotionReleaseField.starts_date]: "Ngày bắt đầu áp dụng",
  [PromotionReleaseField.ends_date]: "Ngày kết thúc áp dụng",
};

export interface PromotionReleaseQuery extends BaseQuery {
  query?: string | null;
  coupon?: string | null;
  is_registered?: boolean | undefined;
  states?: Array<any> | [];
  entitled_method?: string | null;
  creators?: Array<string> | [];
  store_ids?: Array<any> | [];
  channels?: Array<any> | [];
  source_ids?: Array<number> | [];
  starts_date_min?: string | null;
  starts_date_max?: string | null;
  ends_date_min?: string | null;
  ends_date_max?: string | null;
}
