// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create

const cores = `cores`;

const SourcePermissions = {
  READ: `${cores}_sources_view`,
  CREATE: `${cores}_sources_create`,
  EXPORT: `${cores}_sources_export`,
  UPDATE: `${cores}_sources_update`,
  DELETE: `${cores}_sources_delete`,
};

const ChannelPermissions = {
  READ: `${cores}_channels_read`,
  CREATE: `${cores}_channels_create`,
  EXPORT: `${cores}_channels_export`,
  UPDATE: `${cores}_channels_update`,
  DELETE: `${cores}_channels_delete`,
};

const StorePermissions = {
  READ: `${cores}_stores_read`,
  CREATE: `${cores}_stores_create`,
  EXPORT: `${cores}_stores_export`,
  UPDATE: `${cores}_stores_update`,
  DELETE: `${cores}_stores_delete`,
};

const PrintPermissions = {
  READ: `${cores}_prints_templates_read`,
  CREATE: `${cores}_prints_templates_create`,   
};

export {SourcePermissions, ChannelPermissions, StorePermissions, PrintPermissions};
