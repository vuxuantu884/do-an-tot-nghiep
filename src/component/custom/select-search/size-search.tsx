import {Form, FormItemProps, Select} from "antd";
import {FormInstance} from "antd/es/form/Form";
import {sizeSearchAction} from "domain/actions/product/size.action";
import _, {debounce} from "lodash";
import {PageResponse} from "model/base/base-metadata.response";
import {SizeQuery, SizeResponse} from "model/product/size.model";
import React, {ReactElement, useCallback, useEffect} from "react";
import {useDispatch} from "react-redux";

const {Option} = Select;
interface Props extends FormItemProps {
  form?: FormInstance;
  label: string;
  name: string | any[];
  rules?: any[];
  placeholder?: string;
  querySearch?: SizeQuery;
  mode?: "multiple" | "tags" | undefined;
  key?: "code" | "id";
  defaultValue?: string | number | string[];
}

SizeSelect.defaultProps = {
  label: "Kích cỡ",
  placeholder: "Chọn kích cỡ",
  rules: [],
  querySearch: {
    info: "",
  },
  mode: undefined,
  key: "code",
  defaultValue: undefined,
};

function SizeSelect({
  form,
  label,
  placeholder,
  name,
  rules,
  mode,
  key,
  querySearch,
  defaultValue,
  ...restFormProps
}: Props): ReactElement {
  const dispatch = useDispatch();
  const [sizeList, setSizeList] = React.useState<{
    items: Array<SizeResponse>;
    isLoading: boolean;
  }>({items: [], isLoading: false});

  const handleChangeAccountSearch = useCallback(
    (code: string, codes?: string[]) => {
      if (querySearch) {
        setSizeList((prev) => {
          return {items: prev?.items || [], isLoading: true};
        });

        const query = _.cloneDeep(querySearch);
        query.code = code;
        dispatch(
          sizeSearchAction(query, (response: PageResponse<SizeResponse>) => {
            if (response) {
              setSizeList({
                items: response.items,
                isLoading: false,
              });
            }
          })
        );
      }
    },
    [dispatch, querySearch]
  );
  const onSearchAccount = debounce((key: string) => {
    handleChangeAccountSearch(key);
  }, 300);

  useEffect(() => {
    // let value = defaultValue;

    // if (!defaultValue && form) {
    //   value = form.getFieldValue(name);
    // }

    // if (mode === "multiple" && Array.isArray(value)) {
    //   handleChangeAccountSearch("", value);
    // } else if (typeof value === "string") {
    //   handleChangeAccountSearch("", [value]);
    // } else {
    //   handleChangeAccountSearch("");
    // }
    handleChangeAccountSearch("");
  }, [handleChangeAccountSearch, mode, defaultValue, form, name]);

  return (
    <Form.Item label={label} name={name} rules={rules} {...restFormProps}>
      <Select
        mode={mode}
        placeholder={placeholder}
        showArrow
        optionFilterProp="children"
        showSearch
        allowClear
        loading={sizeList?.isLoading}
        onSearch={(value) => onSearchAccount(value || "")}
        onClear={() => onSearchAccount("")}
        maxTagCount="responsive"
        defaultValue={defaultValue}
        notFoundContent="Không có dữ liệu"
      >
        {sizeList?.items?.map((item) => (
          <Option key={item.code} value={item[key || "code"]}>
            {`${item.code}`}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
}

const SizeSearchSelect = React.memo(SizeSelect, (prev, next) => {
  return prev.querySearch?.code === next.querySearch?.code;
});
export default SizeSearchSelect;
