// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create

export const ODERS_PERMISSIONS = {
  VIEW: "orders_view",
  CREATE: "orders_create",
  UPDATE: "orders_update",
  CANCEL: "orders_cancel",
  IMPORT: "orders_import",
  EXPORT: "orders_export",
  SUPPORT_PACK: "orders_support_pack",
  CONNECT_DELIVERY_SERVICE: "orders_connect_delivery_service",
}

export const ORDERS_ACTION_PERMISSIONS = {
  ACTION_SUB_STATUS: "orders_action_sub_status",
  ACTION_PAYMENT: "orders_action_payment",
  ACTION_SHIPMENT: "orders_action_shipment"
}
