import { TreeSelect, TreeSelectProps } from "antd";
import {
  findRangeDepartmentLevel,
  getTreeData,
  isStoreByDepartmentList,
} from "component/TreeStore/helper";
import { useMemo } from "react";
import { DataNode } from "rc-tree-select/lib/interface";
import { strForSearch } from "utils/StringUtils";
import { CustomByDepartment } from "./model";

type Props = TreeSelectProps<any> & {
  storeByDepartmentList: CustomByDepartment[] | unknown[];
};

const CustomTreeSelect = (props: Props) => {
  const { storeByDepartmentList, ...restProps } = props;

  const storeByDepartmentTree: DataNode[] = useMemo(() => {
    if (!isStoreByDepartmentList(storeByDepartmentList)) return [];
    if (!storeByDepartmentList) return [] as DataNode[];
    const { max, min } = findRangeDepartmentLevel(storeByDepartmentList);
    const store: DataNode[] = getTreeData(storeByDepartmentList, min, max);
    return [
      {
        title: "Tất cả",
        key: "all",
        value: "all",
        children: store,
      },
    ];
  }, [storeByDepartmentList]);

  return (
    <TreeSelect<any>
      treeData={storeByDepartmentTree}
      filterTreeNode={(input: String, option: any) => {
        if (option.value) {
          return strForSearch(option.title).includes(strForSearch(input));
        }

        return false;
      }}
      {...restProps}
    />
  );
};
CustomTreeSelect.defaultProps = {
  placeholder: "Chọn",
  showArrow: true,
  treeDefaultExpandAll: true,
  allowClear: true,
  showSearch: true,
  style: { width: "100%" },
  treeCheckable: true,
  treeNodeFilterProp: "title",
  maxTagCount: "responsive",
};
export default CustomTreeSelect;
