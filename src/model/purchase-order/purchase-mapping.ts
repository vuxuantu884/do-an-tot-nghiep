const PurchaseProcumentExportField = {
  sku: "sku",
  variant: "variant",
  sld: "sld",
  accepted_quantity: "accepted_quantity",
  real_quantity: "real_quantity",
  sl: "sl",
}

const PurchaseProcumentExportMapping = {
  [PurchaseProcumentExportField.sku]: "sku",
  [PurchaseProcumentExportField.variant]: "Tên sản phẩm",
  [PurchaseProcumentExportField.sld]: "SL Đặt hàng",
  [PurchaseProcumentExportField.accepted_quantity]: "SL đã nhận",
  [PurchaseProcumentExportField.real_quantity]: "SL Thực nhận",
  [PurchaseProcumentExportField.sl]: "Số lượng",
}


export {
  PurchaseProcumentExportField,
  PurchaseProcumentExportMapping
}
