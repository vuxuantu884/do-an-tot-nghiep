// Đặt tên resouces  có chữ [s] + action , viết thường, snake_case => products_read
// Nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create
// Các action chính : read, update, create, delete, print, ..

const Customers = "customers";

export const CustomerListPermission = {
  customers_read: "customers_read",
  customers_create: "customers_create",
  customers_update: "customers_update",
  customers_export: "customers_export",
}

export const CustomerGroupPermission = {
  groups_read: `${Customers}_groups_read`,
  groups_create: `${Customers}_groups_create`,
  groups_update: `${Customers}_groups_update`,
  groups_delete: `${Customers}_groups_delete`,
}

export const CustomerLevelPermission = {
  levels_read: `${Customers}_levels_read`,
  levels_create: `${Customers}_levels_create`,
  levels_update: `${Customers}_levels_update`,
  levels_delete: `${Customers}_levels_delete`,
}
