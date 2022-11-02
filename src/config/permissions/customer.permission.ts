// Đặt tên resouces  có chữ [s] + action , viết thường, snake_case => products_read
// Nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create
// Các action chính : read, update, create, delete, print, ..

const Customers = "customers";

export const CustomerListPermission = {
  customers_read: "customers_read",
  customers_create: "customers_create",
  customers_update: "customers_update",
  customers_export: "customers_export",
  customers_recalculate_money_point: "customers_recalculate_money_point",
};

export const CustomerGroupPermission = {
  groups_read: `${Customers}_groups_read`,
  groups_create: `${Customers}_groups_create`,
  groups_update: `${Customers}_groups_update`,
  groups_delete: `${Customers}_groups_delete`,
};

export const CUSTOMER_LEVEL_PERMISSIONS = {
  READ: "customers_levels_read",
  CREATE: "customers_levels_create",
  UPDATE: "customers_levels_update",
  DELETE: "customers_levels_delete",
};
