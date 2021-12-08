// Đặt tên resouces  có chữ [s] + action , viết thường, snake_case => products_read
// Nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create
// Các action chính : read, update, create, delete, print, ..

const Ecommerces = "ecommerces";

export const EcommerceConfigPermission = {
  shops_connect: `${Ecommerces}_shops_connect`,
  shops_read: `${Ecommerces}_shops_read`,
  shops_update: `${Ecommerces}_shops_update`,
  shops_delete: `${Ecommerces}_shops_delete`,
}

export const EcommerceProductPermission = {
  products_download: `${Ecommerces}_variants_download`,
  products_read: `${Ecommerces}_variants_read`,
  products_update: `${Ecommerces}_variants_update`,   // ghép nối sản phẩm
  products_disconnect: `${Ecommerces}_variants_disconnect`,
  products_update_stock: `${Ecommerces}_variants_update_stock`,
  products_delete: `${Ecommerces}_variants_delete`,
}

export const EcommerceOrderPermission = {
  orders_download: `${Ecommerces}_orders_download`,
  orders_mapping_view: `${Ecommerces}_orders_read`,
  orders_view: "orders_view",
}
