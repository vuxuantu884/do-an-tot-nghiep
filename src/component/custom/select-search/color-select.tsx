import {Form, FormItemProps, Select} from "antd";
import {FormInstance} from "antd/es/form/Form";
import {getColorAction} from "domain/actions/product/color.action";
import _, {debounce} from "lodash";
import {PageResponse} from "model/base/base-metadata.response";
import {ColorResponse, ColorSearchQuery} from "model/product/color.model";
import React, {ReactElement, useCallback, useEffect} from "react";
import {useDispatch} from "react-redux";

const {Option} = Select;
interface Props extends FormItemProps {
  form?: FormInstance;
  label: string;
  name: string | any[];
  rules?: any[];
  placeholder?: string;
  querySearch?: ColorSearchQuery;
  mode?: "multiple" | "tags" | undefined;
  key?: "code" | "id";
  defaultValue?: string | number | string[];
}

ColorSelectSearch.defaultProps = {
  label: "Kích cỡ",
  placeholder: "Chọn kích cỡ",
  rules: [],
  querySearch: {
    info: "",
  },
  mode: undefined,
  key: "id",
  defaultValue: undefined,
};

function ColorSelectSearch({
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
    items: Array<ColorResponse>;
    isLoading: boolean;
  }>({items: [], isLoading: false});

  const handleChangeAccountSearch = useCallback(
    (info: string, codes?: string[]) => {
      if (querySearch) {
        setSizeList((prev) => {
          return {items: prev?.items || [], isLoading: true};
        });

        const query = _.cloneDeep(querySearch);
        query.info = info;

        dispatch(
          getColorAction(query, (response: PageResponse<ColorResponse>) => {
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
          <Option key={item.name} value={item[key || "id"]}>
            {`${item.name}`}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
}

export default ColorSelectSearch;
