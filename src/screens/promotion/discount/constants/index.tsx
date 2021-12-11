import { Form, Input, InputNumber } from "antd";
import CategorySearchSelect from "component/custom/select-search/category-search";
import ColorSelectSearch from "component/custom/select-search/color-select";
import SizeSearchSelect from "component/custom/select-search/size-search";
import { Rule } from "rc-field-form/lib/interface";
import { formatDiscountValue } from "utils/PromotionUtils";
const { Item } = Form;
export const FieldSelectOptions = [
  {
    label: "Tên sản phẩm",
    value: "product_name",
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <Item name={name} rules={rules}>
        <Input placeholder="Tên sản phẩm" defaultValue={defaultValue} />
      </Item>
    ),
  },
  {
    label: "Mã SKU",
    value: "sku",
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <Item name={name} rules={rules}>
        <Input placeholder="Mã SKU" defaultValue={defaultValue} />
      </Item>
    ),
  },
  {
    label: "Danh mục sản phẩm",
    value: "category_name",
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <CategorySearchSelect
        placeholder="Danh mục sản phẩm"
        name={name}
        rules={rules}
        defaultValue={defaultValue ? Number(defaultValue) : undefined}
        label=""
      />
    ),
  },
  {
    label: "Tag sản phẩm",
    value: "product_tag",
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <Item name={name} rules={rules}>
        <Input placeholder="Tag sản phẩm" defaultValue={defaultValue} />
      </Item>
    ),
  },
  {
    label: "Kích cỡ",
    value: "product_size",
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <SizeSearchSelect placeholder="Kích cỡ" name={name} rules={rules} label="" defaultValue={defaultValue} />
    ),
  },
  {
    label: "Màu sắc",
    value: "option_color",
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <ColorSelectSearch
        placeholder="Màu sắc"
        name={name}
        rules={rules}
        label=""
        querySearch={{ is_main_color: 0 }}
        defaultValue={defaultValue}
      />
    ),
  },
  {
    label: "Giá trị đơn hàng",
    value: "subtotal",
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <Item name={name} rules={rules}>
        <InputNumber placeholder="Giá trị đơn hàng" defaultValue={defaultValue} formatter={(value) => formatDiscountValue(Number(value), false)} />
      </Item>
    ),
  },
  {
    label: "Số lượng",
    value: "quantity",
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <Item name={name} rules={rules}>
        <InputNumber placeholder="Số lượng" defaultValue={defaultValue} formatter={(value) => formatDiscountValue(Number(value), false)} />
      </Item>
    ),
  },
];