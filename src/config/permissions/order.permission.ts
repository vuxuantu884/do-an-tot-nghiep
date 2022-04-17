// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create

export const ODERS_PERMISSIONS = {
  READ: "orders_read",
  // READ_ORDERS: "orders_orders_read",
  READ_RETURNS: "orders_returns_read",
  READ_SHIPMENTS: "orders_shipments_read",
  CREATE: "orders_create",
  CREATE_RETURN: "orders_returns_create",
  CREATE_PICKED: "orders_picked_create",
  CREATE_PACKED: "orders_packed_create",
  CREATE_SHIPPING: "orders_shipping_create",
  // UPDATE
  UPDATE_COMFIRMED: "orders_confirmed_update",
  UPDATE_PACKED: "orders_packed_update",
  UPDATE_SHIPPING: "orders_shipping_update",
  UPDATE_FINISHED: "orders_finished_update",
  UPDATE_PAYMENT: "orders_update_payment",
  // CANCEL
  CANCEL_CONFIRMED: "orders_confirmed_cancel",
  CANCEL_PACKED: "orders_packed_cancel",
  IMPORT: "orders_import",
  EXPORT: "orders_export",
  SUPPORT_PACK: "orders_packed_read",
  CONNECT_DELIVERY_SERVICE: "logistic_gateways_services_read",
  // POS
  READ_POS: "orders_pos_read",
  //
  CREATE_GOODS_RECEIPT: "orders_goods_receipt_create",
  READ_GOODS_RECEIPT: "orders_goods_receipt_read",
  DELETE_GOODS_RECEIPT: "orders_goods_receipt_delete",
}

