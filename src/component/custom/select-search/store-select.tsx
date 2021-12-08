import {Form, FormItemProps, Select} from "antd";
import {FormInstance} from "antd/es/form/Form";
import {StoreSearchAction} from "domain/actions/core/store.action";
import _, {debounce} from "lodash";
import {PageResponse} from "model/base/base-metadata.response";
import {StoreQuery, StoreResponse} from "model/core/store.model";
import React, {ReactElement, useCallback, useEffect} from "react";
import {useDispatch} from "react-redux";

const {Option} = Select;
interface Props extends FormItemProps {
  form?: FormInstance;
  label: string;
  name: string;
  rules?: any[];
  placeholder?: string;
  queryAccount?: StoreQuery;
  mode?: "multiple" | "tags" | undefined;
  key?: "code" | "id";
  defaultValue?: string | number | string[];
  style?: any;
  className?: string;
}

StoreSelect.defaultProps = {
  label: "Cửa hàng",
  placeholder: "Chọn cửa hàng",
  rules: [],
  queryAccount: {
    info: "",
  },
  mode: undefined,
  key: "id",
  defaultValue: undefined,
};

function StoreSelect({
  form,
  label,
  placeholder,
  name,
  rules,
  mode,
  key,
  queryAccount,
  defaultValue,
  style,
  className,
  ...restFormProps
}: Props): ReactElement {
  const dispatch = useDispatch();
  const [accountList, setAccountList] = React.useState<{
    items: Array<StoreResponse>;
    isLoading: boolean;
  }>({items: [], isLoading: false});

  const handleChangeAccountSearch = useCallback(
    (key: string, ids?: string[]) => {
      if (queryAccount) {
        setAccountList((prev) => {
          return {items: prev?.items || [], isLoading: true};
        });

        const query = _.cloneDeep(queryAccount);
        query.info = key;
        query.ids = ids;
        dispatch(
          StoreSearchAction(query, (response: PageResponse<StoreResponse>) => {
            if (response) {
              setAccountList({
                items: response.items,
                isLoading: false,
              });
            }
          })
        );
      }
    },
    [dispatch, queryAccount]
  );
  const onSearchAccount = debounce((key: string) => {
    handleChangeAccountSearch(key);
  }, 300);

  useEffect(() => {
    let value = defaultValue;

    if (!defaultValue && form) {
      value = form.getFieldValue(name);
    }

    if (mode === "multiple" && Array.isArray(value)) {
      handleChangeAccountSearch("", value);
    } else if (typeof value === "string") {
      handleChangeAccountSearch("", [value]);
    } else {
      handleChangeAccountSearch("");
    }
  }, [handleChangeAccountSearch, queryAccount?.info, mode, defaultValue, form, name]);

  return (
    <Form.Item
      label={label}
      name={name}
      rules={rules}
      className={className}
      labelCol={{span: 24, offset: 0}}
      {...restFormProps}
    >
      <Select
        style={style}
        mode={mode}
        placeholder={placeholder}
        showArrow
        optionFilterProp="children"
        showSearch
        allowClear
        loading={accountList?.isLoading}
        onSearch={(value) => onSearchAccount(value || "")}
        onClear={() => onSearchAccount("")}
        maxTagCount="responsive"
        defaultValue={defaultValue}
        notFoundContent="Không có dữ liệu"
      >
        {accountList?.items?.map((item) => (
          <Option key={item.name} value={item[key || "id"]}>
            {`${item.name}`}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
}

const StoreSearchSelect = React.memo(StoreSelect, (prev, next) => {
  return prev.queryAccount?.info === next.queryAccount?.info;
});
export default StoreSearchSelect;
