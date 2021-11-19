// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create
const suppliers = "suppliers";
export const SuppliersPermissions = {
  READ: `${suppliers}_suppliers_read`,
  CREATE: `${suppliers}_suppliers_create`,
  EXPORT: `${suppliers}_suppliers_export`,
  UPDATE: `${suppliers}_suppliers_update`,
  DELETE: `${suppliers}_suppliers_delete`,
};

