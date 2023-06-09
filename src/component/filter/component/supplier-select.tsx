import { Form, FormItemProps, Select } from "antd";
import { FormInstance } from "antd/es/form/Form";
import _, { debounce } from "lodash";
import { SupplierResponse, SupplierQuery } from "model/core/supplier.model";
import React, { ReactElement, useCallback, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { callApiNative } from "utils/ApiUtils";
import { supplierGetApi } from "service/core/supplier.service";
import CustomSelect from "component/custom/select.custom";
import { getQueryParams, useQuery } from "../../../utils/useQuery";

const { Option } = Select;
interface Props extends FormItemProps {
  form?: FormInstance;
  label?: string | boolean;
  name: string;
  rules?: any[];
  placeholder?: string;
  querySupplier?: SupplierQuery;
  mode?: "multiple" | "tags" | undefined;
  key?: "code" | "id";
  defaultValue?: string | number | string[];
  maxTagCount?: number | "responsive";
  supplier_ids?: Array<number>;
}

SupplierSelect.defaultProps = {
  label: "Nhà cung cấp",
  placeholder: "Chọn nhà cung cấp",
  rules: [],
  querySupplier: {
    info: "",
  },
  mode: undefined,
  key: "id",
  defaultValue: undefined,
};

function SupplierSelect({
  form,
  label,
  placeholder,
  name,
  rules,
  mode,
  key,
  querySupplier,
  defaultValue,
  maxTagCount,
  supplier_ids,
  ...restFormProps
}: Props): ReactElement {
  const dispatch = useDispatch();
  const [lstSupplier, setLstSupplier] = React.useState<{
    items: Array<SupplierResponse>;
    isLoading: boolean;
  }>({ items: [], isLoading: false });

  const handleChangeSupplierSearch = useCallback(
    async (key: string, codes?: string[]) => {
      if (querySupplier) {
        setLstSupplier((prev) => {
          return { items: prev?.items || [], isLoading: true };
        });

        const query = _.cloneDeep(querySupplier);
        query.condition = key;
        query.codes = codes;

        const res = await callApiNative({ isShowLoading: false }, dispatch, supplierGetApi, query);
        if (res) {
          setLstSupplier(() => {
            return {
              items: res.items,
              isLoading: false,
            };
          });
        }
      }
    },
    [dispatch, querySupplier],
  );
  const onSearchSupplier = debounce((key: string) => {
    handleChangeSupplierSearch(key);
  }, 300);

  const query = useQuery();
  let paramsUrl: any = useMemo(() => {
    return { ...getQueryParams(query) };
  }, [query]);

  const getSupplierByCode = async (ids: string) => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, supplierGetApi, {
      ids,
    });
    if (res) {
      setLstSupplier((lstSupplier) => {
        return {
          items: [...res.items, ...lstSupplier.items],
          isLoading: false,
        };
      });
    }
  };

  useEffect(() => {
    if (paramsUrl.suppliers) {
      getSupplierByCode(paramsUrl.suppliers).then();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (supplier_ids) {
      getSupplierByCode(supplier_ids.toString()).then();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let value = defaultValue;

    if (!defaultValue && form) {
      value = form.getFieldValue(name);
    }

    if (mode === "multiple" && Array.isArray(value)) {
      handleChangeSupplierSearch("", value);
    } else if (typeof value === "string") {
      handleChangeSupplierSearch("", [value]);
    } else {
      handleChangeSupplierSearch("");
    }
  }, [handleChangeSupplierSearch, querySupplier?.condition, mode, defaultValue, form, name]);

  return (
    <Form.Item
      label={label}
      name={name}
      rules={rules}
      labelCol={{ span: 24, offset: 0 }}
      {...restFormProps}
    >
      <CustomSelect
        mode={mode}
        placeholder={placeholder}
        showArrow
        optionFilterProp="children"
        showSearch
        allowClear
        loading={lstSupplier?.isLoading}
        onSearch={(value) => onSearchSupplier(value.trim() || "")}
        onClear={() => onSearchSupplier("")}
        maxTagCount={maxTagCount}
        defaultValue={defaultValue}
        notFoundContent="Không có dữ liệu"
        filterOption={(input, option: any) => {
          return (
            option?.children.toLowerCase().indexOf(input.toLowerCase().trim()) >= 0 ||
            option?.key.toLowerCase().indexOf(input.toLowerCase().trim()) >= 0
          );
        }}
      >
        {lstSupplier?.items?.map((supplier) => {
          return (
            <Option
              key={`${supplier.id}-${supplier.code}-${supplier.phone}-${supplier.contacts
                .map((i) => i.phone)
                .join(",")}`}
              value={supplier[key || "id"]}
            >
              {supplier.name}
            </Option>
          );
        })}
      </CustomSelect>
    </Form.Item>
  );
}

const SupplierSearchSelect = React.memo(SupplierSelect, (prev, next) => {
  return prev.querySupplier?.condition === next.querySupplier?.condition;
});
export default SupplierSearchSelect;
