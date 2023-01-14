import { DataNode } from "rc-tree-select/lib/interface";
import { StoreByDepartment } from "model/core/store.model";

export const isStoreByDepartmentList = (data: unknown[]): data is StoreByDepartment[] =>
  data?.length === 0 || (data?.length > 0 && (data[0] as StoreByDepartment).id !== undefined);

export const findRangeDepartmentLevel = (listStore: StoreByDepartment[]) => {
  if (listStore.length === 0)
    return {
      min: 3,
      max: 5,
    };

  const keys = Object.keys(listStore[0]);
  const departmentKeys = keys.filter((key) => key.indexOf("department_h") !== -1);
  const levels = departmentKeys
    .map((departmentKey) =>
      Number(departmentKey.slice(departmentKey.indexOf("h") + 1, departmentKey.indexOf("h") + 2)),
    )
    .sort();

  return {
    min: levels[0],
    max: levels[levels.length - 1],
  };
};

export function getTreeData(
  stores: StoreByDepartment[],
  fromDepartmentLevel: number,
  toDepartmentLevel: number,
): DataNode[] {
  let treeData: DataNode[] = [];
  let departmentLevels: number[] = [];
  let departmentLevel = fromDepartmentLevel;
  while (departmentLevel <= toDepartmentLevel) {
    departmentLevels.push(departmentLevel);
    departmentLevel++;
  }
  stores.forEach((store) => {
    let parent = treeData;
    // load 1 store vào tree
    departmentLevels.forEach((departmentLevel) => {
      let departmentLevelName = "department_h" + departmentLevel;
      let departmentLevelIdName = "department_h" + departmentLevel + "_id";
      let department = store[departmentLevelName];
      let departmentId = store[departmentLevelIdName];

      if (department) {
        let departmentIndex = parent.findIndex((item) => item.id === departmentId);
        if (departmentIndex === -1) {
          let newDepartment = {
            id: departmentId,
            title: department,
            value: `parent_department_${departmentId}`,
            children: [],
          };
          parent.push(newDepartment);
          parent = newDepartment.children;
        } else {
          parent = parent[departmentIndex].children || [];
        }
      }
    });
    parent.push({
      id: store.id,
      title: store.name,
      value: store.id,
    });
  });
  return treeData;
}
