// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create

const accounts = `accounts`; 

const AccountPermissions = {
  READ: `${accounts}_read`,
  CREATE: `${accounts}_create`,
  EXPORT: `${accounts}_export`,
  UPDATE: `${accounts}_update`,
  DELETE: `${accounts}_delete`,
};

const DepartmentsPermissions = {
  READ: `${accounts}_departments_read`, 
  CREATE: `${accounts}_departments_create`,
  UPDATE: `${accounts}_departments_update`,
};

export {DepartmentsPermissions, AccountPermissions};
