// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create

export const adminPermissions = "admin_all";

export const ProductPermission = {
    read: "products_create'",
    write: "products_delete",
    inventories_read: "products_export",
  };
