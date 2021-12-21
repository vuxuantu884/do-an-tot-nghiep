
export const fields_order = [
  {value: "id", name: "ID"},
  {value: "code", name: "Mã"},
  {value: "createdDate", name: "Ngày tạo"},
  {value: "status", name: "Trạng thái"},
  {value: "orderType", name: "Kiểu đơn hàng"},
  {value: "source", name: "Nguồn"},
  {value: "customerCode", name: "Mã khách hàng"},

  {value: "customerName", name: "Tên khách hàng"},
  {value: "customerPhoneNumber", name: "SĐT khách hàng"},
  {value: "customerEmail", name: "Email khách hàng"},
  {value: "customerBirthday", name: "Sinh nhật khách hàng"},
  {value: "customerCity", name: "Thành phố(của khách)"},
  {value: "customerDistrict", name: "Quận huyện(của khách)"},
  {value: "customerWard", name: "Phường xã(của khách)"},
  {value: "customerAddress", name: "Địa chỉ(của khách)"},

  {value: "createdBy", name: "Người tạo đơn"},
  {value: "store", name: "Kho lấy hàng"},
  {value: "companyName", name: "Tên công ty"},
  {value: "companyCity", name: "Thành phố"},
  {value: "companyDistrict", name: "Quận huyện"},
  {value: "itemName", name: "Sản phẩm"},
  {value: "quantity", name: "Số lượng"},
  {value: "productCode", name: "Mã sản phẩm cha"},
  {value: "productName", name: "Tên sản phẩm cha"},
  {value: "itemCode", name: "Mã sản phẩm"},

  {value: "unit", name: "Đơn vị tính"},
  {value: "itemBarcode", name: "Mã vạch"},
  {value: "itemDiscount", name: "Chiết khấu sản phẩm"},
  {value: "itemWeight", name: "Khối lượng(gr)"},
  {value: "itemPrice", name: "Giá"},
  {value: "itemImportPrice", name: "Giá vốn"},
  {value: "deliveryFee", name: "Phí vận chuyển"},
  {value: "orderDiscount", name: "Tiền chiết khấu đơn hàng"},
  {value: "totalAmount", name: "Giá trị đơn hàng"},
  {value: "totalPay", name: "Tổng thu"},
  {value: "totalWeight", name: "Tổng khối lượng(gr)"},
  {value: "paymentMethod", name: "Hình thức thanh toán"},
  {value: "bankTransferFee", name: "Phí chuyển hoàn"},
  {value: "cod", name: "Tiền thu hộ(COD)"},
  {value: "bankTransferAmount", name: "Tiền chuyển khoản"},
  {value: "bankAccountNumber", name: "STK chuyển khoản"},
  {value: "bankTransferContent", name: "Nội dung chuyển khoản"},
  {value: "subtractedPoint", name: "Số tiêu điểm"},
  {value: "pointConvertAmount", name: "Số tiền quy từ điểm"},
  {value: "qrPayAmount", name: "Tiền QR Pay"},
  {value: "qrPayContent", name: "QR Pay"},
  {value: "fulfilmentCode", name: "Mã đơn giao hàng"},
  {value: "shippingFee", name: "Phí ship báo khách"},
  {value: "deliveryProviderName", name: "Hãng vận chuyển"},
  {value: "deliveryProviderType", name: "Hình thức vận chuyển"},

  {value: "shippingDays", name: "Số ngày chuyển hàng"},
  {value: "excessFee", name: "Phí vượt cân"},
  {value: "BB1", name: "Phí bảo hiểm"},
  {value: "orderNote", name: "Ghi chú sản phẩm"},
  {value: "BD1", name: "Biên bản"},
  {value: "BE1", name: "Ghi chú của CSKH"},
  {value: "customerNote", name: "Ghi chú của khách"},
  {value: "reasonCancel", name: "Lý do huỷ"},
  {value: "BH1", name: "Chăm sóc khách hàng"},
  {value: "finalizedOn", name: "Ngày xác nhận"},
  {value: "pickOn", name: "Ngày nhặt hàng"},
  {value: "packOn", name: "Ngày đóng gói"},

  {value: "shippingOn", name: "Ngày xuất kho"},
  {value: "shipmentOn", name: "Ngày gửi HVC"},
  {value: "shippedOn", name: "Ngày bàn giao"},
  {value: "completedOn", name: "Ngày hoàn thành"},
  {value: "deliveryNote", name: "Ghi chú HVC"},
  {value: "coupon", name: "Mã giảm giá"},
  {value: "orderReturnCode", name: "ID đơn trả"},
  {value: "BS1", name: "Biên bản bàn giao"},
  {value: "storeCode", name: "Mã cửa hàng"},
  {value: "customerGroup", name: "Nhóm khách hàng"},
  {value: "assignee", name: "Người bán hàng"},
  {value: "BV1", name: "VAT"},
  {value: "BW1", name: "Trạng thái đối soát"},
  {value: "BX1", name: "Ngày đối soát"},
  {value: "BY1", name: "Thanh toán cho doanh nghiệp"},

];
export const fields_shipment = [
  // {value: "stt", name: "ID"},
  {value: "code", name: "Mã đơn giao"},
  {value: "trackingCode", name: "Mã vận chuyển"},
  {value: "orderCode", name: "Mã đơn hàng"},
  {value: "store", name: "Cửa hàng"},
  {value: "status", name: "Trạng thái"},
  {value: "shipperName", name: "Shipper"},
  {value: "shippingFeePaidToThreePls", name: "Phí giao hàng(đối tác)"},
  {value: "customer", name: "Khách hàng"},
  {value: "deliveryFee", name: "Phí giao hàng(H)"},
  {value: "cod", name: "Tiền thu hộ(COD)"},
  {value: "deliveryServiceNote", name: "Ghi chú HVC"},
];
export const fields_return = [
  {value: "orderReturnCode", name: "Mã đơn trả"},
  {value: "orderCode", name: "Mã đơn hàng"},
  {value: "createdDate", name: "Ngày tạo"},
  {value: "receivedDate", name: "Ngày nhận"},
  {value: "customerName", name: "Khách hàng"},
  {value: "customerEmail", name: "Email"},
  {value: "customerPhoneNumber", name: "SĐT"},

  {value: "sku", name: "Mã sản phẩm"},
  {value: "itemName", name: "Tên sản phẩm"},
  {value: "totalAmount", name: "Giá trị"},
  {value: "returnMethod", name: "Phương thức trả"},
  {value: "store", name: "Cửa hàng"},

];

export const fields_order_standard = [
  {value: "orderReturnCode", name: "Mã đơn trả"},
  {value: "orderCode", name: "Mã đơn hàng"},
  {value: "createdDate", name: "Ngày tạo"},
  {value: "receivedDate", name: "Ngày nhận"},
  {value: "customerName", name: "Khách hàng"},
  {value: "customerEmail", name: "Email"},
  {value: "customerPhoneNumber", name: "SĐT"},

  {value: "sku", name: "Mã sản phẩm"},
  {value: "itemName", name: "Tên sản phẩm"},
  {value: "totalAmount", name: "Giá trị"},
  {value: "returnMethod", name: "Phương thức trả"},
  {value: "store", name: "Cửa hàng"},

];
