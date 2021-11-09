// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create

export const CustomerListPermissions = {
  VIEW_CUSTOMER_LIST: "customers_list",
  VIEW_CUSTOMER_DETAIL: "customers_detail",
  CREATE_CUSTOMER: "customers_create",
  EXPORT_CUSTOMER: "customers_export",
  UPDATE_CUSTOMER: "customers_update",
};

export const CustomerGroupPermissions = {
  CREATE: "customers_group_create",
  VIEW: "customers_group_view",
  UPDATE: "customers_group_update",
  DELETE: "customers_group_delete",
};

export const CustomerLevelPermissions = {
  CREATE: "customers_level_create",
  VIEW: "customers_level_view",
  UPDATE: "customers_level_update",
  DELETE: "customers_level_delete",
};
