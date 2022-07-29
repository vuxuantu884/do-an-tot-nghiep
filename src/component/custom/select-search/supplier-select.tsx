/**
 * @deprecated
 */
import { FormItemProps, SelectProps } from "antd";
import { FormInstance } from "antd/es/form/Form";
import _ from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { SupplierQuery, SupplierResponse } from "model/core/supplier.model";
import React, { ReactElement, ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { supplierGetApi } from "service/core/supplier.service";
import { callApiNative } from "utils/ApiUtils";
import SelectPagingV2 from "../SelectPaging/SelectPagingV2";
import { SelectContentProps } from "./account-select-paging";

export interface SelectSearchProps {
  form?: FormInstance;
  fixedQuery?: any;
  key?: "code" | "id";
  formItemProps?: FormItemProps<ReactNode>;
  selectProps?: SelectProps<any>;
  noFormItem?: boolean;
  [name: string]: any;
}

const defaultSelectProps: SelectProps<any> = {
  placeholder: "Chọn nhà cung cấp",
  mode: undefined,
  showArrow: true,
  optionFilterProp: "children",
  showSearch: true,
  allowClear: true,
  maxTagCount: "responsive",
  notFoundContent: "Không có dữ liệu",
};

SupplierSelect.defaultProps = {
  fixedQuery: {
    info: "",
  },
};

function SupplierSelect(props: SelectContentProps): ReactElement {
  const { id: name, value, mode, fixedQuery, key, isFilter, ...selectProps } = props;
  const dispatch = useDispatch();
  const [isSearching, setIsSearching] = React.useState(false);
  const [data, setData] = React.useState<PageResponse<SupplierResponse>>({
    items: [],
    metadata: {
      page: 1,
      limit: 30,
      total: 0,
    },
  });
  const [defaultOptons, setDefaultOptons] = useState<SupplierResponse[]>([]);

  const handleSupplierSearch = async (queryParams: SupplierQuery) => {
    setIsSearching(true);
    const query = { ...fixedQuery, ...queryParams };
    const response = await callApiNative({ isShowError: true }, dispatch, supplierGetApi, query);
    if (response) {
      setData(response);
    }
    setIsSearching(false);
  };

  /**
   * Option cho trang 1
   */
  useEffect(() => {
    const getDefaultOptions = async () => {
      const response = await callApiNative({ isShowError: true }, dispatch, supplierGetApi, {
        ...fixedQuery,
        page: 1,
        limit: 30,
      });
      setDefaultOptons(response.items);
      setData(response);
    };
    getDefaultOptions();
  }, [dispatch, fixedQuery]);

  /**
   * Request giá trị mặc định để lên đầu cho select và thêm 1 số item khác để user cho thêm sự lựa cho
   */
  useEffect(() => {
    const getIntialValue = async () => {
      let initParams: any = [];

      if (mode === "multiple" && Array.isArray(value)) {
        initParams = value;
      } else if (typeof value === "string" || typeof value === "number") {
        initParams = isFilter ? value : Number(value);
      } else {
        initParams = [];
      }
      if (initParams && initParams.toString().length > 0) {
        // call api lấy data của item(s) đang được chọn trước đó
        const initSelectedResponse = await callApiNative(
          { isShowError: true },
          dispatch,
          supplierGetApi,
          {
            ids: isFilter ? JSON.parse(initParams).code : initParams,
          },
        );

        let totalItems: SupplierResponse[] = [];
        if (initSelectedResponse?.items && defaultOptons?.length > 0) {
          let set = new Set();
          let mergeItems = [...initSelectedResponse.items, ...defaultOptons];
          totalItems = mergeItems.filter((item) => {
            if (!set.has(item.id)) {
              set.add(item.id);
              return true;
            }
            return false;
          }, set);
          totalItems = _.uniqBy(totalItems, key!);
        } else if (defaultOptons) {
          totalItems = defaultOptons;
        } else if (initSelectedResponse?.items) {
          totalItems = initSelectedResponse.items;
        }

        setData((prevState) => ({ ...prevState, items: totalItems }));
      }
      setIsSearching(false);
    };

    getIntialValue();
  }, [isFilter, mode, dispatch, value, defaultOptons, key]);

  return (
    <SelectPagingV2
      {...defaultSelectProps}
      defaultValue={value}
      mode={mode}
      metadata={data.metadata}
      loading={isSearching}
      onSearch={(value) => handleSupplierSearch({ condition: value })}
      onClear={() => handleSupplierSearch({ condition: "" })}
      onPageChange={(key: string, page: number) => {
        handleSupplierSearch({ condition: key, page: page });
      }}
      {...selectProps}
    >
      {data?.items?.map((item) => (
        <SelectPagingV2.Option
          key={item.code}
          value={
            isFilter
              ? JSON.stringify({
                  code: item.id,
                  name: item.name,
                })
              : item.id
          }
        >
          {`${item.code} - ${item.name}`}
        </SelectPagingV2.Option>
      ))}
    </SelectPagingV2>
  );
}

const SupplierSearchSelect = React.memo(SupplierSelect, (prev, next) => {
  const { value } = prev;
  const { value: nextValue } = next;
  return value === nextValue;
});
export default SupplierSearchSelect;
