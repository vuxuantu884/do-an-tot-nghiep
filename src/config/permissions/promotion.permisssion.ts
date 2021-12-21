// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create

const promo = "price_rules"; 
 
const PromoPermistion = {
  READ: `${promo}_read`,
  CREATE: `${promo}_create`, 
  UPDATE: `${promo}_update`, 
  CANCEL: `${promo}_cancel`, 
};

export {PromoPermistion};
