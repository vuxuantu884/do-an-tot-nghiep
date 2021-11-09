// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create

export const EcommerceConfigPermissions = {
  VIEW_SHOP_LIST: "ecommerces_shop_list",
  VIEW_SHOP_DETAIL: "ecommerces_shop_detail",
  UPDATE_SHOP: "ecommerces_shop_update",
  DELETE_SHOP: "ecommerces_shop_delete",
  CONNECT_SHOP: "ecommerces_shop_connect",
};

export const EcommerceOrderPermissions = {
  ORDERS_VIEW: "orders_view",
  ORDERS_UPDATE: "orders_update",
  ORDERS_DOWNLOAD: "ecommerces_order_download",
};

export const EcommerceProductPermissions = {
  VIEW_PRODUCT: "ecommerces_variant_list",
  CONNECT_PRODUCT: "ecommerces_variant_update",
  DISCONNECT_PRODUCT: "ecommerces_variant_disconnect",
  DELETE_PRODUCT: "ecommerces_variant_delete",
  UPDATE_STOCK_PRODUCT: "ecommerces_variant_update_stock",
  DOWNLOAD_PRODUCT: "ecommerces_variant_download",
};
