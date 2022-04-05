import { FormInstance, TreeSelect, TreeSelectProps } from "antd";
import _ from "lodash";
import { StoreResponse } from "model/core/store.model";
import React, { useEffect, useState } from "react";
import { fullTextSearch } from "utils/StringUtils";
import { SourceResponse } from "../../model/response/order/source.response";
interface Props extends TreeSelectProps<string> {
  form?: FormInstance;
  name: string;
  placeholder?: string;
  listSource: Array<SourceResponse> | undefined;
}

const TreeSource = (props: Props) => {
  const { form, name, placeholder, listSource, ...restProps } = props;
  const [source, setSource] = useState<Array<SourceResponse>>();
  const [noDepartmentStores, setNoDepartmentStores] = useState<Array<SourceResponse>>();
  const KEY_MAP_STORE = "department_h3";
  useEffect(() => {
    const groupBy = (list: Array<SourceResponse>, keyGetter: (store: SourceResponse)=> any) => {
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

    const grouped: any = listSource !== undefined ? groupBy(listSource, (store: SourceResponse) => store[KEY_MAP_STORE]) : [];
    const newStores = _.filter([...grouped], store => store[0]);
    setNoDepartmentStores(_.filter(listSource, source => !source[KEY_MAP_STORE]));
    setSource(newStores);
  }, [listSource]);

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
      {source?.map((departmentItem: any) => {
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
      {noDepartmentStores?.map((sourceItem: SourceResponse) => (
        <TreeSelect.TreeNode key={sourceItem.code} value={sourceItem.id} title={sourceItem.name} />
      ))}
    </TreeSelect>
  );
};
TreeSource.defaultProps = {
  placeholder: "Chọn nguồn đơn hàng"
}
export default TreeSource;
