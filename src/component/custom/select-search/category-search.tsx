import {Form, FormItemProps, Select} from "antd";
import {FormInstance} from "antd/es/form/Form";
import {getCategoryRequestAction} from "domain/actions/product/category.action";
import _ from "lodash";
import {CategoryQuery, CategoryResponse} from "model/product/category.model";
import {Rule} from "rc-field-form/lib/interface";
import React, {ReactElement, useCallback, useEffect} from "react";
import {useDispatch} from "react-redux";

const {Option} = Select;
interface Props extends FormItemProps {
  form?: FormInstance;
  label: string;
  name: string | any[];
  rules?: Rule[];
  placeholder?: string;
  querySearch?: CategoryQuery;
  mode?: undefined;
  key?: "code" | "id";
  defaultValue?: string | number | string[];
}

CategorySelect.defaultProps = {
  label: "Danh mục sản phẩm",
  placeholder: "Chọn danh mục",
  rules: [],
  querySearch: {
    info: "",
  },
  mode: undefined,
  key: "id",
  defaultValue: undefined,
};

function CategorySelect({
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
  const [categoryList, setCategoryList] = React.useState<Array<CategoryResponse>>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const getFlatCategory = useCallback((items: Array<CategoryResponse>) => {
    const flatCategory: Array<CategoryResponse> = [];
    items.forEach((item) => {
      flatCategory.push(item);
      if (item.children) {
        flatCategory.push(...getFlatCategory(item.children));
      }
    });
    return flatCategory;
  }, []);

  const handleChangeAccountSearch = useCallback(
    (key: string, codes?: string[]) => {
      if (querySearch) {
        setIsLoading(true);

        const query = _.cloneDeep(querySearch);
        query.query = key;
        // query.codes = codes;
        dispatch(
          getCategoryRequestAction(query, (response: Array<CategoryResponse>) => {
            if (response) {
              let temps: Array<CategoryResponse> = getFlatCategory(response);
              setIsLoading(false);
              console.log(JSON.stringify(temps.length));

              setCategoryList(temps);
            }
          })
        );
      }
    },
    [dispatch, getFlatCategory, querySearch]
  );

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
  }, [handleChangeAccountSearch, querySearch?.query, mode, defaultValue, form, name]);

  return (
    <Form.Item label={label} name={name} rules={rules} {...restFormProps}>
      <Select
        mode={mode}
        placeholder={placeholder}
        showArrow
        optionFilterProp="children"
        showSearch
        allowClear
        loading={isLoading}
        maxTagCount="responsive"
        defaultValue={defaultValue}
        notFoundContent="Không có dữ liệu"
      >
        {categoryList?.map((item) => (
          <Option key={item.name} value={item[key || "id"]}>
            {`${item.name}`}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
}

const CategorySearchSelect = React.memo(CategorySelect, (prev, next) => {
  return prev.querySearch?.query === next.querySearch?.query;
});
export default CategorySearchSelect;
