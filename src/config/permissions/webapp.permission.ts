const Webapp = "webapp";

export const WebappConfigPermission = {
  shops_connect: `${Webapp}_shops_connect`,
  shops_read: `${Webapp}_shops_read`,
  shops_update: `${Webapp}_shops_update`,
  shops_delete: `${Webapp}_shops_delete`,
};

export const WebappProductPermission = {
  products_download: `${Webapp}_variants_download`,
  products_read: `${Webapp}_variants_read`,
  products_update: `${Webapp}_variants_update`, // ghép nối sản phẩm
  products_disconnect: `${Webapp}_variants_disconnect`,
  products_update_stock: `${Webapp}_variants_update_stock`,
  products_delete: `${Webapp}_variants_delete`,
};

export const WebappOrderPermission = {
  orders_download: `${Webapp}_orders_download`,
  orders_mapping_view: `${Webapp}_orders_read`,
  orders_read: "orders_read",
};
