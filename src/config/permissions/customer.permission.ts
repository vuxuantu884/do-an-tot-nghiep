// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create

export const CustomerListPermissions = {
  VIEW_CUSTOMER_LIST: "customers_list",
  VIEW_CUSTOMER_DETAIL: "customers_detail",
  CREATE_CUSTOMER: "customers_create",
  EXPORT_CUSTOMER: "customers_export",
  UPDATE_CUSTOMER: "customers_update",
};
