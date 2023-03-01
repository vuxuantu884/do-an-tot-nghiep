// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create

export const ORDER_PERMISSIONS = {
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
  UPDATE_CONFIRMED: "orders_confirmed_update",
  UPDATE_PACKED: "orders_packed_update",
  UPDATE_SHIPPING: "orders_shipping_update",
  UPDATE_FINISHED: "orders_finished_update",
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
  //DELETE
  DELETE_ORDER: "orders_delete",
  DELETE_RETURN_ORDER: "orders_returns_delete",
  CONFIG_UPDATE: "orders_config_update",
  //RETURN
  RECEIVE_RETURN: "orders_receive_returns", // nhận hàng
  CREATE_MONEY_REFUND: "orders_returns_refund", // hoàn tiền
  orders_return_online: "orders_return_online", // trả lại chuyển hàng
  orders_return_at_the_store: "orders_return_at_the_store", // trả tại quầy online
  orders_return_offline: "orders_return_offline", // trả tại quầy offline
  // EXPORT
  orders_export_vat: "orders_export_vat",
  //WHOLESALE
  ORDERS_B2B_WRITE: "orders_b2b_write",
  ORDERS_B2B_READ: "orders_b2b_read",
};
