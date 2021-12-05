// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create
const products = "products"

export const ProductPermission = {
  read: `${products}_read`,
  create:`${products}_create`,      
  update:`${products}_update`,
  delete:`${products}_delete`,
  delete_variant:`${products}_delete_variant`,  
  read_histories  : `${products}_read_histories`,
  print_temp : `${products}_print_temp`,
  import_excel : `${products}_import_excel`,
  upload_image : `${products}_upload_image`,
  read_variant : `${products}_read_variant`,
  categories_create : `${products}_categories_create`,
  categories_update : `${products}_categories_update`,
  categories_delete : `${products}_categories_delete`,
  categories_read : `${products}_categories_read`,
  colors_create : `${products}_colors_create`,
  colors_update : `${products}_colors_update`,
  colors_delete : `${products}_colors_delete`,
  colors_read : `${products}_colors_read`,
  materials_create : `${products}_materials_create`,
  materials_update : `${products}_materials_update`,
  materials_delete : `${products}_materials_delete`,
  materials_read : `${products}_materials_read`,
  sizes_create : `${products}_sizes_create`,
  sizes_update : `${products}_sizes_update`,
  sizes_delete : `${products}_sizes_delete`,
  sizes_read : `${products}_sizes_read`,
  read_cost: `${products}_read_cost`,
  update_cost: `${products}_update_cost`,
};