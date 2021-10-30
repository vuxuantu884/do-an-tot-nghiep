import {FormInstance} from "antd/es/form/Form";
import {CheckboxChangeEvent} from "antd/lib/checkbox";
import _ from "lodash";
import {ModuleAuthorize} from "model/auth/module.model";
import {PageResponse} from "model/base/base-metadata.response";
import {UserPermissions} from "./Constants";
//returns true : can | false : can not
export const checkUserPermission = (
  acceptPermissions: Array<string> = [],
  currentPermissions: Array<string> = []
): boolean => {
  if (Array.isArray(acceptPermissions) && acceptPermissions?.length === 0) {
    return true;
  }

  if (
    Array.isArray(currentPermissions) &&
    currentPermissions?.includes(UserPermissions.ADMIN_ALL)
  ) {
    return true;
  }

  acceptPermissions.forEach((element) => {
    if (currentPermissions.includes(element)) {
      return true;
    }
  });

  return false;
};

export const handleCheckedModule = (
  module: ModuleAuthorize,
  form: FormInstance<any>,
  checkedModules: string[],
  setCheckedModules: (data: string[]) => void
) => {
  const permissionsIdList = module.permissions.map((permission) =>
    permission.id.toString()
  );
  const permissionsCheckedByModule = form.getFieldsValue(permissionsIdList);
  const isCheckedFull = _.every(permissionsCheckedByModule, function (value) {
    return value;
  });

  if (isCheckedFull) {
    const temps = [...checkedModules];
    temps.push(module.id.toString());
    setCheckedModules(_.uniq(temps));
  } else {
    const temps = _.dropWhile(checkedModules, function (item) {
      return item === module.id.toString();
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
  const permissionsIdList = module.permissions.map((permission) =>
    permission.id.toString()
  );
  const permissionsCheckedByModule = form.getFieldsValue(permissionsIdList);
  //convert permissionsCheckedByModule to array
  const permissionsCheckedByModuleArray = Object.keys(permissionsCheckedByModule).map(
    (key) => {
      return permissionsCheckedByModule[key];
    }
  );
  //check list permissionsCheckedByModule has number of true value between 1 and length of permissionsIdList
  if (Array.isArray(permissionsCheckedByModuleArray)) {
    const temps = [...indeterminateModules];
    //number of true value in one module
    const numberOfChecked = permissionsCheckedByModuleArray.filter(
      (value: any) => value
    ).length;
    if (numberOfChecked > 0 && numberOfChecked < permissionsIdList.length) {
      temps.push(module.id.toString());
      // format array to unique value
      setIndeterminateModules(_.uniq(temps));
    } else {
      setIndeterminateModules(temps.filter((id) => id !== module.id.toString()));
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
  const {checked} = e.target;
  const moduleCode = module.code;
  const moduleId = module.id;
  const {setFieldsValue} = form;
  //remove module.id in indeterminateModules
  setIndeterminateModules(
    indeterminateModules.filter((id) => id !== moduleId.toString())
  ); // set indeterminate checkbox to false
  if (checked) {
    //add module.id to checkedModules
    setCheckedModules(_.uniq([...checkedModules, moduleId.toString()]));
  } else {
    //remove module.id from checkedModules
    setCheckedModules(checkedModules.filter((id) => id !== moduleId.toString()));
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
    // if (activePanel.includes(checkedModule.id.toString()) && !checked) {
    //deactive module from active panel here
    // } else {
    //active module to active panel
    if (Array.isArray(activePanel)) {
      const temps: string[] = [...activePanel];
      temps.push(checkedModule.id.toString());
      setActivePanel(_.uniq(temps));
    }
    // }
  }
};
