import { SpecialOrderModel, SpecialOrderValueModel } from "model/order/special-order.model";

export const specialOrderDisplayField = {
  donTra: "đơn trả",
  nhanVienCSDH: "Nhân viên CSĐH",
  donGoc: "Đơn gốc",
  sanPham: "Sản phẩm",
  tien: "Tiền",
  lyDo: "Lý do",
  san: "Sàn",
};

export interface SpecialOrderTypeModel {
  [name: string]: SpecialOrderValueModel;
}

export const specialOrderTypes: SpecialOrderTypeModel = {
  orders_exchange: {
    title: "Đơn đổi",
    value: "orders_exchange",
    displayFields: [specialOrderDisplayField.donTra],
  },
  orders_recall: {
    title: "Thu hồi đổi trả",
    value: "orders_recall",
    displayFields: [
      specialOrderDisplayField.nhanVienCSDH,
      specialOrderDisplayField.donGoc,
      specialOrderDisplayField.sanPham,
    ],
  },
  orders_partial: {
    title: "Giao hàng một phần",
    value: "orders_partial",
    displayFields: [
      specialOrderDisplayField.nhanVienCSDH,
      specialOrderDisplayField.sanPham,
      specialOrderDisplayField.tien,
    ],
  },
  cod_exchange: {
    title: "Đổi COD",
    value: "cod_exchange",
    displayFields: [
      specialOrderDisplayField.nhanVienCSDH,
      specialOrderDisplayField.tien,
      specialOrderDisplayField.lyDo,
    ],
  },
  orders_split: {
    title: "Tách đơn",
    value: "orders_split",
    displayFields: [specialOrderDisplayField.nhanVienCSDH, specialOrderDisplayField.donGoc],
  },
  orders_continue_deliver: {
    title: "Đơn giao tiếp",
    value: "orders_continue_deliver",
    displayFields: [specialOrderDisplayField.nhanVienCSDH, specialOrderDisplayField.donTra],
  },
  orders_cancel: {
    title: "Hoàn, huỷ",
    value: "orders_cancel",
    displayFields: [specialOrderDisplayField.lyDo],
  },
  orders_replace: {
    title: "Thay thế",
    value: "orders_replace",
    displayFields: [specialOrderDisplayField.donGoc, specialOrderDisplayField.san],
  },
};

export const orderSpecialReason = {
  1: {
    title: "Kho-Đóng sai, thiếu",
    value: "Kho-Đóng sai, thiếu",
  },
  2: {
    title: "Kho-SP lỗi, bẩn",
    value: "Kho-SP lỗi, bẩn",
  },
  3: {
    title: "Sale-Sai số : chật",
    value: "Sale-Sai số : chật",
  },
  4: {
    title: "Sale-Sai số : rộng",
    value: "Sale-Sai số : rộng",
  },
  5: {
    title: "Sale-Sai thông tin",
    value: "Sale-Sai thông tin",
  },
  6: {
    title: "Sale-Đơn trùng",
    value: "Sale-Đơn trùng",
  },
  7: {
    title: "Sale-Khách chưa chốt",
    value: "Sale-Khách chưa chốt",
  },
  8: {
    title: "Sale-Sai SP",
    value: "Sale-Sai SP",
  },
  9: {
    title: "Sale-Khách không nghe máy ( chưa chốt đơn)",
    value: "Sale-Khách không nghe máy ( chưa chốt đơn)",
  },
  10: {
    title: "SP-Không thích chất liệu",
    value: "SP-Không thích chất liệu",
  },
  11: {
    title: "SP-Không ưng màu",
    value: "SP-Không ưng màu",
  },
  12: {
    title: "SP-Không ưng thiết kế",
    value: "SP-Không ưng thiết kế",
  },
  13: {
    title: "SP-Không thích sau thử",
    value: "SP-Không thích sau thử",
  },
  14: {
    title: "SP-Không giống hình ( màu)",
    value: "SP-Không giống hình ( màu)",
  },
  15: {
    title: "Khách-Boom hàng",
    value: "Khách-Boom hàng",
  },
  16: {
    title: "Khách-Không nghe máy( khi đã chốt)",
    value: "Khách-Không nghe máy( khi đã chốt)",
  },
  17: {
    title: "Khách-Bận không nhận",
    value: "Khách-Bận không nhận",
  },
  18: {
    title: "Khách-Không check được",
    value: "Khách-Không check được",
  },
  19: {
    title: "Khách-Mua tại cửa hàng",
    value: "Khách-Mua tại cửa hàng",
  },
  20: {
    title: "Khách-Hủy đơn",
    value: "Khách-Hủy đơn",
  },
  21: {
    title: "VĐ-Tách đơn sai ( CK,SP)",
    value: "VĐ-Tách đơn sai ( CK,SP)",
  },
  22: {
    title: "VĐ-Tách đơn không báo",
    value: "VĐ-Tách đơn không báo",
  },
  23: {
    title: "VĐ-Tách đơn 1 SP hết hàng",
    value: "VĐ-Tách đơn 1 SP hết hàng",
  },
  24: {
    title: "VĐ-Điều đơn chậm",
    value: "VĐ-Điều đơn chậm",
  },
  25: {
    title: "HVC-Giao trễ",
    value: "HVC-Giao trễ",
  },
  26: {
    title: "HVC-Thái độ shipper",
    value: "HVC-Thái độ shipper",
  },
  27: {
    title: "HVC-Hoàn không lý do",
    value: "HVC-Hoàn không lý do",
  },
  28: {
    title: "HVC-Dán nhầm bill",
    value: "HVC-Dán nhầm bill",
  },
  29: {
    title: "COD-Sale lên đơn sai chiết khấu",
    value: "COD-Sale lên đơn sai chiết khấu",
  },
  30: {
    title: "COD-Miễn ship cho khách",
    value: "COD-Miễn ship cho khách",
  },
  31: {
    title: "COD-Thay đổi CTCK",
    value: "COD-Thay đổi CTCK",
  },
  32: {
    title: "COD-Gom hàng gửi 1 lần",
    value: "COD-Gom hàng gửi 1 lần",
  },
  33: {
    title: "COD-Đóng thiếu hàng",
    value: "COD-Đóng thiếu hàng",
  },
  34: {
    title: "COD-Thêu",
    value: "COD-Thêu",
  },
};

export const defaultSpecialOrderParams: SpecialOrderModel = {
  type: null,
  order_original_code: null,
  order_carer_code: null,
  variant_skus: null,
  order_return_code: null,
  amount: null,
  reason: null,
  ecommerce: null,
};
