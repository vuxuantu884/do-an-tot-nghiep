const PurchaseProcumentExportField = {
  sku: "sku",
  variant: "variant",
  sld: "sldat",
  sldduyet: "sldduyet",
  accepted_quantity: "accepted_quantity",
  real_quantity: "real_quantity",
  sl: "sl",
}

const PurchaseProcumentExportMapping = {
  [PurchaseProcumentExportField.sku]: "sku",
  [PurchaseProcumentExportField.variant]: "Tên sản phẩm",
  [PurchaseProcumentExportField.sld]: "SL đặt hàng",
  [PurchaseProcumentExportField.sldduyet]: "SL nhận được duyệt",
  [PurchaseProcumentExportField.accepted_quantity]: "SL đã nhận",
  [PurchaseProcumentExportField.real_quantity]: "SL thực nhận",
  [PurchaseProcumentExportField.sl]: "Số lượng",
}


export {
  PurchaseProcumentExportField,
  PurchaseProcumentExportMapping
}
