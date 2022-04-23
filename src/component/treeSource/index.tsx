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
  const KEY_MAP_STORE_LEVEL_3 = "department_h3";
  const KEY_MAP_STORE_LEVEL_4 = "department_h4";

  useEffect(() => {
    const groupBy = (list: Array<SourceResponse>, keyGetter: (store: SourceResponse) => any) => {
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
    };

    const groupByLevel4 = (list: Array<SourceResponse>, keyGetter: (store: SourceResponse) => any) => {
      const map = new Map();
      list.forEach((item) => {
        if (item.department_h4) {
          const key = keyGetter(item);
          const collection = map.get(key);
          if (!collection) {
            map.set(key, [item]);
          } else {
            collection.push(item);
          }
        } else {
          map.set(item.name, [item]);
        }
      });
      return map;
    };

    const grouped: any = listSource !== undefined ? groupBy(listSource, (source: SourceResponse) => source[KEY_MAP_STORE_LEVEL_3]) : [];
    const newSource = _.filter([...grouped], source => source[0]);
    setNoDepartmentStores(_.filter(listSource, source => !source[KEY_MAP_STORE_LEVEL_3]));

    newSource.forEach((item) => {
      if (item[1].length > 0) {
        const grouped: any = listSource !== undefined ? groupByLevel4(item[1], (source: SourceResponse) => source[KEY_MAP_STORE_LEVEL_4]) : [];
        const newSourcesLevel4 = _.filter([...grouped], source => source[0]);
        if (newSourcesLevel4.length > 0) item[1] = newSourcesLevel4;
      }
    });

    setSource(newSource);
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
        return (
          <TreeSelect.TreeNode
            key={departmentItem[0]}
            value={departmentItem[0]}
            title={departmentItem[0]}>
            <React.Fragment>
              {departmentItem[1].map((storeItem: any) => {
                return storeItem[1][0].name === storeItem[0] ? (
                  <TreeSelect.TreeNode
                    key={storeItem[1][0].code}
                    value={storeItem[1][0].id}
                    title={storeItem[1][0].name}
                  />
                ) : (
                  <TreeSelect.TreeNode
                    key={storeItem[0]}
                    value={storeItem[1][0][KEY_MAP_STORE_LEVEL_4]}
                    title={storeItem[0]}
                  >
                    {storeItem[1].map((storeItemLevel4: StoreResponse) => {
                      return (
                        <TreeSelect.TreeNode
                          key={storeItemLevel4.code}
                          value={storeItemLevel4.id}
                          title={storeItemLevel4.name}
                        />
                      );
                    })}
                  </TreeSelect.TreeNode>
                );
              })}
            </React.Fragment>
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
