import { FormInstance, Tag, TreeSelect, TreeSelectProps } from "antd";
import _ from "lodash";
import { StoreResponse } from "model/core/store.model";
import React, { useEffect, useState } from "react";
import { fullTextSearch } from "utils/RemoveDiacriticsString";
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

  useEffect(() => {
    const groupBy = (list: Array<StoreResponse>, keyGetter: any) => {
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

    const grouped: any = listStore !== undefined ? groupBy(listStore, (store: StoreResponse) => store.department) : [];
    const newStores = _.filter([...grouped], store => store[0]);
    setNoDepartmentStores(_.filter(listStore, store => !store.department_id));
    setStores(newStores);
  }, [listStore]);

  function tagRender(props: any) {
    const { label, closable, onClose } = props;
    const onPreventMouseDown = (event: any) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        className="primary-bg"
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
      >
        {label}
      </Tag>
    );
  }

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
      tagRender={tagRender}
      maxTagCount="responsive"
      onChange={(value) => {
        form?.setFieldsValue({ [name]: value });
      }}
      {...restProps}
      filterTreeNode={(textSearch: any, item: any) => {        
        return fullTextSearch(textSearch, item?.title);
      }}>
      {stores?.map((departmentItem: any) => {
        return (
          <TreeSelect.TreeNode
            key={departmentItem[0]}
            value={`${_.find(listStore, ["department", departmentItem[0]])?.department_id || ""}`}
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