import { FormInstance, TreeSelect, TreeSelectProps } from "antd";
import _ from "lodash";
import { StoreResponse } from "model/core/store.model";
import React, { useEffect, useState } from "react";
import { fullTextSearch } from "utils/StringUtils";
interface Props extends TreeSelectProps<string> {
  form?: FormInstance;
  name: string;
  placeholder?: string;
  listStore: Array<StoreResponse> | undefined;
}

const TreeStore = (props: Props) => {
  const { form, name, placeholder, listStore, ...restProps } = props;
  const [stores, setStores] = useState<Array<StoreResponse>>();
  const [noDepartmentStores, setNoDepartmentStores] = useState<Array<StoreResponse>>();
  const KEY_MAP_STORE = "department_h3";
  useEffect(() => {
    const groupBy = (list: Array<StoreResponse>, keyGetter: (store: StoreResponse)=> any) => {
      const map = new Map();
      list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
          map.set(key, [item]);
        } else {
          collection.push(item);
        }
      });
      return map;
    }
    
    const grouped: any = listStore !== undefined ? groupBy(listStore, (store: StoreResponse) => store[KEY_MAP_STORE]) : [];
    const newStores = _.filter([...grouped], store => store[0]);
    setNoDepartmentStores(_.filter(listStore, store => !store[KEY_MAP_STORE]));
    setStores(newStores);
  }, [listStore]);

  return (
    <TreeSelect
      placeholder={placeholder}
      treeDefaultExpandAll
      className="selector"
      allowClear
      showSearch
      multiple
      treeCheckable
      treeNodeFilterProp="title"
      maxTagCount="responsive"
      onChange={(value) => {
        form?.setFieldsValue({ [name]: value });
      }}
      {...restProps}
      filterTreeNode={(textSearch: any, item: any) => {        
        return fullTextSearch(textSearch, item?.title);
      }}>
      {stores?.map((departmentItem: any) => {
        const departmentValue = departmentItem[0] ? departmentItem[1][0][KEY_MAP_STORE] : "";
        return (
          <TreeSelect.TreeNode
            key={departmentItem[0]}
            value={departmentValue}
            title={departmentItem[0]}>
            {
              <React.Fragment>
                {departmentItem[1].map((storeItem: StoreResponse) => (
                  <TreeSelect.TreeNode
                    key={storeItem.code}
                    value={storeItem.id}
                    title={storeItem.name}
                  />
                ))}
              </React.Fragment>
            }
          </TreeSelect.TreeNode>
        );
      })}
      {noDepartmentStores?.map((storeItem: StoreResponse) => (
        <TreeSelect.TreeNode key={storeItem.code} value={storeItem.id} title={storeItem.name} />
      ))}
    </TreeSelect>
  );
};
TreeStore.defaultProps = {
  placeholder: "Chọn cửa hàng"
}
export default TreeStore;