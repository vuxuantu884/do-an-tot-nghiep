// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create

const accounts = `accounts`;
const departments = `departments`;

const AccountPermissions = {
  READ: `${accounts}_read`,
  CREATE: `${accounts}_create`,
  EXPORT: `${accounts}_export`,
  UPDATE: `${accounts}_update`,
  DELETE: `${accounts}_delete`,
};

const DepartmentsPermissions = {
  READ: `${departments}_read`,
  CREATE: `${departments}_create`,
  UPDATE: `${departments}_update`,
};

export { DepartmentsPermissions, AccountPermissions };
