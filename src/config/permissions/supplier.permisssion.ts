// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create
const suppliers = "suppliers";
export const SuppliersPermissions = {
  READ: `${suppliers}_read`,
  CREATE: `${suppliers}_create`,
  EXPORT: `${suppliers}_export`,
  UPDATE: `${suppliers}_update`,
  DELETE: `${suppliers}_delete`,
};

