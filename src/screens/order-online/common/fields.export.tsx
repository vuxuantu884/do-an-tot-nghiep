export const fields_order_online = [
  { value: "id", name: "ID" },
  { value: "code", name: "Mã đơn hàng" },
  { value: "type", name: "Loại đơn hàng" },
  { value: "createdDate", name: "Ngày tạo" },
  { value: "created", name: "Người tạo đơn" },
  { value: "companyName", name: "Tên công ty" },
  { value: "channel", name: "Nguồn" },
  { value: "orderType", name: "Loại" },
  { value: "store", name: "Kho lấy hàng" },
  { value: "storeCity", name: "Thành phố" },
  { value: "storeDistrict", name: "Quận huyện" },
  { value: "customerName", name: "Tên khách hàng" },
  { value: "customerCode", name: "Mã khách hàng" },
  { value: "customerPhoneNumber", name: "Số điện thoại" },
  { value: "customerEmail", name: "Email" },
  { value: "customerLevel", name: "Cấp độ khách hàng" },
  { value: "customerBirthday", name: "Sinh nhật" },
  { value: "customerCity", name: "Thành phố" },
  { value: "customerDistrict", name: "Quận huyện" },
  { value: "customerWard", name: "Phường xã" },
  { value: "customerAddress", name: "Địa chỉ" },
  { value: "itemName", name: "Sản phẩm" },
  { value: "gift", name: "Quà tặng kèm" },
  { value: "imei", name: "IMEI" },
  { value: "lot", name: "Lô hàng" },
  { value: "productCode", name: "Mã sản phẩm cha" },
  { value: "productName", name: "Tên sản phẩm cha" },
  { value: "sku", name: "Mã sản phẩm" },
  { value: "itemBarcode", name: "Mã vạch" },
  { value: "itemDiscount", name: "Chiết khấu" },
  { value: "itemWeight", name: "Khối lượng" },
  { value: "itemPrice", name: "Giá" },
  { value: "quantity", name: "Số lượng" },
  { value: "productNote", name: "Ghi chú sản phẩm" },
  { value: "totalWeight", name: "Tổng khối lượng" },
  { value: "totalAmount", name: "Giá trị đơn hàng" },
  { value: "deliveryFee", name: "Phí vận chuyển" },
  { value: "overSizeFee", name: "Phí vượt cân" },
  { value: "insuranceFee", name: "Phí bảo hiểm" },
  { value: "returnFee", name: "Phí chuyển hoàn" },
  { value: "cod", name: "Phí thu tiền hộ (COD)" },
  { value: "shippingFeeInformedToCustomer", name: "Phí ship báo khách" },
  { value: "deliveryProviderName", name: "Hãng vận chuyển" },
  { value: "deliveryProviderService", name: "Dịch vụ vận chuyển" },
  { value: "shippingDays", name: "Số ngày chuyển hàng" },
  { value: "trackingCode", name: "Mã đơn hãng vận chuyển" },
  { value: "goodReceiptId", name: "Biên bản" },
  { value: "bankTransferAmount", name: "Tiền chuyển khoản" },
  { value: "bankInfo", name: "Tài khoản chuyển khoản" },
  { value: "orderDiscount", name: "Tiền chiết khấu / đơn hàng" },
  { value: "totalDiscount", name: "Tổng chiết khấu đơn hàng" },
  { value: "deposit", name: "Tiền đặt cọc" },
  { value: "bankDeposit", name: "Tài khoản đặt cọc" },
  { value: "codMoney", name: "Tiền COD" },
  { value: "totalPay", name: "Tổng thu" },
  { value: "cost", name: "Giá vốn" },
  { value: "costOrder", name: "Giá vốn đơn hàng" },
  { value: "unit", name: "Đơn vị tính" },
  { value: "internalNote", name: "Ghi chú nội bộ" },
  { value: "customerNote", name: "Ghi chú của khách" },
  { value: "subStatus", name: "Trạng thái" },
  { value: "reasonCancel", name: "Lý do hủy" },
  { value: "coordinator", name: "Chăm sóc đơn hàng" },
  { value: "finalizedOn", name: "Ngày xác nhận" },
  { value: "cancelledOn", name: "Ngày hủy đơn" },
  { value: "shipmentOn", name: "Ngày gửi HVC" },
  { value: "exportedOn", name: "Ngày xuất kho" },
  { value: "shippedOn", name: "Ngày bàn giao" },
  { value: "completedOn", name: "Ngày thành công" },
  { value: "receiveCancellationOn", name: "Ngày nhận hàng" },
  { value: "source", name: "Nguồn đơn hàng" },
  { value: "deliveryNote", name: "Ghi chú HVC" },
  { value: "deliveryWeight", name: "Khối lượng HVC( gr)" },
  { value: "coupon", name: "Mã khuyến mại" },
  { value: "orderReturnCode", name: "ID đơn trả" },
  { value: "sttDate", name: "STT Theo ngày" },
  { value: "goodReceipt", name: "Biên bản bàn giao" },
  { value: "affiliate", name: "Mã Affiliate" },
  { value: "customerGroup", name: "Nhóm khách hàng" },
  { value: "vat", name: "VAT" },
  { value: "pointConvertAmount", name: "Tiền tiêu điểm" },
  { value: "tags", name: "Nhãn" },
  { value: "pageuid", name: "pageuid" },
  { value: "reCheckStatus", name: "Trạng thái đối soát" },
  { value: "reCheckDate", name: "Ngày đối soát" },
  { value: "payFor", name: "Thanh toán cho doanh nghiệp" },
  { value: "payDate", name: "Ngày thanh toán cho doanh nghiệp" },
  { value: "assignee", name: "Nhân viên bán hàng" },
  { value: "department", name: "Tên shop" },
  { value: "ecommerceShopName", name: "Tên gian hàng" },
  { value: "referenceCode", name: "Mã tham chiếu" },
  { value: "marketerCode", name: "ID Marketing" },
  { value: "marketer", name: "Tên Marketing" },
  { value: "firstCoordinatorConfirmOn", name: "Ngày xác nhận lần đầu" },
  { value: "lastCoordinatorConfirmOn", name: "Ngày xác nhận lần cuối" },
  { value: "returningOn", name: "Ngày đang hoàn" },
  { value: "packedOn", name: "Ngày đóng gói" },
  { value: "paymentBank", name: "Tham chiếu ngân hàng" },
  { value: "paymentBankAmount", name: "Thanh toán ngân hàng" },
  { value: "paymentWallet", name: "Tham chiếu ví điện tử" },
  { value: "paymentWalletAmount", name: "Thanh toán ví điện tử" },
  { value: "subReasonName", name: "Lý do chi tiết hủy" },
];
export const fields_shipment = [
  // {value: "stt", name: "ID"},
  { value: "code", name: "Mã đơn giao" },
  { value: "trackingCode", name: "Mã vận chuyển" },
  { value: "orderCode", name: "Mã đơn hàng" },
  { value: "store", name: "Cửa hàng" },
  { value: "status", name: "Trạng thái" },
  { value: "shipperName", name: "Shipper" },
  { value: "shippingFeePaidToThreePls", name: "Phí giao hàng(đối tác)" },
  { value: "customer", name: "Khách hàng" },
  { value: "deliveryFee", name: "Phí giao hàng(H)" },
  { value: "cod", name: "Tiền thu hộ(COD)" },
  { value: "deliveryServiceNote", name: "Ghi chú HVC" },
];
export const fields_return = [
  { value: "orderReturnCode", name: "Mã đơn trả" },
  { value: "orderCode", name: "Mã đơn hàng" },
  { value: "createdDate", name: "Ngày tạo" },
  { value: "receivedDate", name: "Ngày nhận" },
  { value: "customerName", name: "Khách hàng" },
  { value: "customerEmail", name: "Email" },
  { value: "customerPhoneNumber", name: "SĐT" },

  { value: "sku", name: "Mã sản phẩm" },
  { value: "itemName", name: "Tên sản phẩm" },
  { value: "totalAmount", name: "Giá trị" },
  { value: "returnMethod", name: "Phương thức trả" },
  { value: "store", name: "Cửa hàng" },
];

export const fields_order_offline = [
  { value: "createdDate", name: "Ngày" },
  { value: "id", name: "ID" },
  { value: "code", name: "Mã đơn hàng" },
  { value: "created", name: "NV thu ngân" },
  { value: "assignee", name: "NV bán hàng" },
  { value: "store", name: "Kho" },
  { value: "customerCode", name: "Mã khách hàng" },
  { value: "customerName", name: "Tên khách hàng" },
  { value: "customerBirthday", name: "Ngày sinh khách hàng" },
  { value: "customerPhoneNumber", name: "SĐT khách hàng" },
  { value: "customerEmail", name: "Email khách hàng" },
  { value: "customerAddress", name: "Địa chỉ khách hàng" },
  { value: "customerGroup", name: "Nhóm khách hàng" },
  { value: "itemBarcode", name: "Mã vạch" },
  { value: "sku", name: "Mã sản phẩm" },
  { value: "productCode", name: "Mã sản phẩm cha" },
  { value: "productName", name: "Tên sản phẩm cha" },
  { value: "itemName", name: "Tên sản phẩm" },
  { value: "unit", name: "Đơn vị tính" },
  { value: "itemPrice", name: "Giá bán" },
  { value: "quantity", name: "Số lượng" },
  { value: "productNote", name: "Ghi chú sản phẩm" },
  { value: "itemPriceAfterDiscount", name: "Doanh thu SP sau chiết khấu" },
  { value: "itemDiscount", name: "Chiết khấu" },
  { value: "cash", name: "Tiền mặt" },
  { value: "bankTransferAmount", name: "Chuyển khoản" },
  { value: "cashPay", name: "Tiền khách đưa" },
  { value: "cardAmount", name: "Quẹt thẻ" },
  { value: "qrPayAmount", name: "QR Code" },
  { value: "pointConvertAmount", name: "Tiền tiêu điểm" },
  { value: "totalPay", name: "Tổng tiền" },
  { value: "internalNote", name: "Mô tả" },
  { value: "coupon", name: "Mã coupon" },
];
export const select_type_especially_order = [
  {
    value: 'orders-exchange',
    label: 'Đơn trả',
  },
  {
    value: 'orders-recall',
    label: 'Thu hồi đổi trả',
  },
  {
    value: 'orders-partial',
    label: 'Giao hàng 1 phần',
  },
  {
    value: 'cod-exchange',
    label: 'Đổi COD',
  },
  {
    value: 'transfer',
    label: 'Chuyển khoản/ VNPay/ Momo',
  },
  {
    value: 'collect-support',
    label: 'Thu, chi hộ',
  },
  {
    value: 'orders-split',
    label: 'Tách đơn',
  },
  {
    value: 'orders-embroider',
    label: 'Đơn in thêu',
  },
  {
    value: 'orders-continue-deliver',
    label: 'Đơn giao tiếp',
  },
  {
    value: 'orders-cancel',
    label: 'Đơn hoàn, huỷ',
  },
]

export const select_reason_especially_order = ['Kho-Đóng sai, thiếu',
  'Kho-SP lỗi, bẩn',
  'Sale-Sai số : chật',
  'Sale-Sai số : rộng',
  'Sale-Sai thông tin',
  'Sale-Đơn trùng',
  'Sale-Khách chưa chốt',
  'Sale-Sai SP',
  'Sale-Khách không nghe máy ( chưa chốt đơn)',
  'SP-Không thích chất liệu',
  'SP-Không ưng màu',
  'SP-Không ưng thiết kế',
  'SP-Không thích sau thử',
  'SP-Không giống hình ( màu)',
  'Khách-Boom hàng',
  'Khách-Không nghe máy( khi đã chốt)',
  'Khách-Bận không nhận',
  'Khách-Không check được',
  'Khách-Mua tại cửa hàng',
  'Khách-Hủy đơn',
  'VĐ-Tách đơn sai ( CK,SP)',
  'VĐ-Tách đơn không báo',
  'VĐ-Tách đơn 1 SP hết hàng',
  'VĐ-Điều đơn chậm',
  'HVC-Giao trễ',
  'HVC-Thái độ shipper',
  'HVC-Hoàn không lý do',
  'HVC-Dán nhầm bill',
  'COD-Sale lên đơn sai chiết khấu',
  'COD-Miễn ship cho khách',
  'COD-Thay đổi CTCK',
  'COD-Gom hàng gửi 1 lần',
  'COD-Đóng thiếu hàng'].map((val)=>{
  return {
    value:val,
    label:val
  }
})