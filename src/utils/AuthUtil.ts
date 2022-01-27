import { FormInstance } from "antd/es/form/Form";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { AdminPermission } from "config/permissions/admin.permission";
import _ from "lodash";
import { AccountStoreResponse } from "model/account/account.model";
import { ModuleAuthorize } from "model/auth/module.model";
import { PageResponse } from "model/base/base-metadata.response";

//returns true : can | false : can not
export const checkUserPermission = (
  acceptPermissions: Array<string> = [],
  currentPermissions: Array<string> = [],
  acceptStoreIds: Array<number> = [],
  currentStoreIds: Array<AccountStoreResponse> = []
): boolean => {
  // không truyền vào quyền nào => được phép truy cập
  if (Array.isArray(acceptPermissions) && acceptPermissions?.length === 0) {
    return true;
  }

  // admin_all => full quyền => được phép truy cập
  if (Array.isArray(currentPermissions) && currentPermissions?.includes(AdminPermission.all)) {
    return true;
  }

  // nếu trong profile có 1 quyền nào đó so với quyền cần có => được phép truy cập
  const hasPermission = acceptPermissions.some((element) => {
    return  currentPermissions.includes(element);
  });

  // nếu trong profile có 1 store nào đó so với store cần có => được phép truy cập
  let hasStoreId = false;
  if(Array.isArray(acceptStoreIds) && acceptStoreIds?.length > 0) {
      hasStoreId = acceptStoreIds.some((element) => {
      return currentStoreIds.some((store) => store.store_id === element);
    }); 
  }else{
      hasStoreId = true;
  }

  return hasPermission && hasStoreId;
};

export const handleCheckedModule = (
  module: ModuleAuthorize,
  form: FormInstance<any>,
  checkedModules: string[],
  setCheckedModules: (data: string[]) => void
) => {
  const permissionsIdList = module.permissions.map((permission) => permission.id.toString());
  const permissionsCheckedByModule = form.getFieldsValue(permissionsIdList);
  const isCheckedFull = _.every(permissionsCheckedByModule, function (value) {
    return value;
  });

  if (isCheckedFull) {
    const temps = [...checkedModules];
    temps.push(module.code);
    setCheckedModules(_.uniq(temps));
  } else {
    const temps = _.dropWhile(checkedModules, function (item) {
      return item === module.code;
    });
    setCheckedModules(_.uniq(temps));
  }
};

export const handleIndeterminateModule = (
  module: ModuleAuthorize,
  form: FormInstance<any>,
  indeterminateModules: string[],
  setIndeterminateModules: (data: string[]) => void
) => {
  const permissionsIdList = module.permissions.map((permission) => permission.id.toString());
  const permissionsCheckedByModule = form.getFieldsValue(permissionsIdList);
  //convert permissionsCheckedByModule to array
  const permissionsCheckedByModuleArray = Object.keys(permissionsCheckedByModule).map((key) => {
    return permissionsCheckedByModule[key];
  });
  //check list permissionsCheckedByModule has number of true value between 1 and length of permissionsIdList
  if (Array.isArray(permissionsCheckedByModuleArray)) {
    const temps = [...indeterminateModules];
    //number of true value in one module
    const numberOfChecked = permissionsCheckedByModuleArray.filter((value: any) => value).length;
    if (numberOfChecked > 0 && numberOfChecked < permissionsIdList.length) {
      temps.push(module.code);
      // format array to unique value
      setIndeterminateModules(_.uniq(temps));
    } else {
      setIndeterminateModules(temps.filter((id) => id !== module.code));
    }
  } else {
    setIndeterminateModules([]);
  }
};

export const onChangeModule = (
  e: CheckboxChangeEvent,
  module: ModuleAuthorize,
  form: FormInstance<any>,
  checkedModules: string[],
  setCheckedModules: (data: string[]) => void,
  indeterminateModules: string[],
  setIndeterminateModules: (data: string[]) => void,
  allModullData: PageResponse<ModuleAuthorize> | undefined,
  activePanel: string | string[],
  setActivePanel: (data: string | string[]) => void
) => {
  e.stopPropagation();
  const { checked } = e.target;
  const moduleCode = module.code;
  const { setFieldsValue } = form;
  //removemodule.code in indeterminateModules
  setIndeterminateModules(indeterminateModules.filter((id) => id !== moduleCode)); // set indeterminate checkbox to false
  if (checked) {
    //addmodule.code to checkedModules
    setCheckedModules(_.uniq([...checkedModules, moduleCode]));
  } else {
    //removemodule.code from checkedModules
    setCheckedModules(checkedModules.filter((id) => id !== moduleCode));
  }

  const checkedModule = _.find(allModullData?.items, function (module) {
    return module.code === moduleCode;
  });

  if (checkedModule) {
    //set checked all permission in module
    const checkedPermissions = checkedModule.permissions.reduce((prev: any, cur) => {
      prev[cur.id.toString()] = checked;
      return prev;
    }, {});
    setFieldsValue(checkedPermissions);

    // handle active panel here
    // if (activePanel.includes(checkedmodule.code) && !checked) {
    //deactive module from active panel here
    // } else {
    //active module to active panel
    if (Array.isArray(activePanel)) {
      const temps: string[] = [...activePanel];
      temps.push(checkedModule.code);
      setActivePanel(_.uniq(temps));
    }
    // }
  }
};
