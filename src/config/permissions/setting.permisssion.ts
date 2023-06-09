// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create

const sources = `sources`;
const channels = `channels`;
const stores = `stores`;
const prints_templates = `print_templates`;
const auth_settings = `auths`;

const SourcePermissions = {
  READ: `${sources}_read`,
  CREATE: `${sources}_create`,
  EXPORT: `${sources}_export`,
  UPDATE: `${sources}_update`,
  DELETE: `${sources}_delete`,
};

const ChannelPermissions = {
  READ: `${channels}_read`,
  CREATE: `${channels}_create`,
  EXPORT: `${channels}_export`,
  UPDATE: `${channels}_update`,
  DELETE: `${channels}_delete`,
};

const StorePermissions = {
  READ: `${stores}_read`,
  CREATE: `${stores}_create`,
  EXPORT: `${stores}_export`,
  UPDATE: `${stores}_update`,
  DELETE: `${stores}_delete`,
};

const PrintPermissions = {
  READ: `${prints_templates}_read`,
  CREATE: `${prints_templates}_create`,
};

const AuthPermissions = {
  READ: `${auth_settings}_read`,
  CREATE: `${auth_settings}_create`,
  UPDATE: `${auth_settings}_update`,
  DELETE: `${auth_settings}_delete`,
};

export {
  SourcePermissions,
  ChannelPermissions,
  StorePermissions,
  PrintPermissions,
  AuthPermissions,
};
