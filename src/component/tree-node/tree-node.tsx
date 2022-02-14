import React, { useState, useEffect } from "react";
import { Tag, TreeSelect, TreeSelectProps } from "antd";
import _ from "lodash";
import { FormInstance } from 'antd';
import { StoreResponse } from "model/core/store.model";
 
interface Props extends TreeSelectProps<string> {
  form?: FormInstance;
  formRef?:any;
  name?: string;
  placeholder?: string;
  listStore: Array<StoreResponse> | undefined;
}

const TreeStore = (props: Props) => {
  const { form,formRef, name, placeholder, listStore, ...restProps } = props;
  const [stores, setStores] = useState<Array<StoreResponse>>();

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
      treeNodeFilterProp='title'
      tagRender={tagRender}
      maxTagCount="responsive"
      onChange={(value) => {
          //form?.setFieldsValue({ [name]: value });
          //formRef?.current?.setFieldsValue({ store_ids: value });
          formRef?.current?.resetFields()
        }}
      {...restProps}
      filterTreeNode={(search: any, item: any) => {
        return item?.title.toLowerCase().includes(search.toLowerCase().trim());
      }}
    >
      {
        stores?.map((departmentItem: any) => {
          // console.log("departmentItem0",`${_.find(listStore, ["department", departmentItem[0]])?.code || ''}`)
          // console.log("departmentItem1",departmentItem[1])
          return (
            <TreeSelect.TreeNode
              key={`${_.find(listStore, ["department", departmentItem[0]])?.code || ''}`}
              value={`${_.find(listStore, ["department", departmentItem[0]])?.code || ''}`}
              title={departmentItem[0]}
            >
              {
                <React.Fragment>  
                  {
                    departmentItem[1].map((storeItem: any) => (
                      <TreeSelect.TreeNode
                        key={storeItem.id}
                        value={storeItem.id}
                        title={storeItem.name}
                      />
                    ))
                  }
                </React.Fragment>
              }
            </TreeSelect.TreeNode>
          )
        })
      }
    </TreeSelect>
  );
};
TreeStore.defaultProps = {
  placeholder: "Chọn cửa hàng"
}
export default TreeStore;