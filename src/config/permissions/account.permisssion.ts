// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create

const accounts = `accounts`; 

const AccountPermissions = {
  READ: `${accounts}_accounts_read`,
  CREATE: `${accounts}_accounts_create`,
  EXPORT: `${accounts}_accounts_export`,
  UPDATE: `${accounts}_accounts_update`,
  DELETE: `${accounts}_accounts_delete`,
};

const DepartmentsPermissions = {
  READ: `${accounts}_departments_read`, 
  CREATE: `${accounts}_departments_create`,
  UPDATE: `${accounts}_departments_update`,
};

export {DepartmentsPermissions, AccountPermissions};
