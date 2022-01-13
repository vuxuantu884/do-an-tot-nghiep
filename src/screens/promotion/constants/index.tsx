import { Form, Input, InputNumber } from "antd";
import { MenuAction } from "component/table/ActionButton";
import TagStatus from "component/tag/tag-status";
import UrlConfig from "config/url.config";
import { DiscountConditionRule, EntilementFormModel, ProductEntitlements } from "model/promotion/price-rules.model";
import { Rule } from "rc-field-form/lib/interface";
import { Link } from "react-router-dom";
import { formatCurrency } from "utils/AppUtils";
import { formatDiscountValue, renderDiscountValue, renderTotalBill } from "utils/PromotionUtils";
const { Item } = Form;

export const MAX_FIXED_DISCOUNT_VALUE = 999999999;

export const PRICE_RULE_FIELDS = {
  activated_by: "activated_by",
  activated_date: "activated_date",
  activated_name: "activated_name",
  async_allocation_count: "async_allocation_count",
  async_usage_count: "async_usage_count",
  cancelled_by: "cancelled_by",
  cancelled_date: "cancelled_date",
  cancelled_name: "cancelled_name",
  code: "code",
  customer_selection: "customer_selection",
  description: "description",
  disabled_by: "disabled_by",
  disabled_date: "disabled_date",
  disabled_name: "disabled_name",
  discount_codes: "discount_codes",
  ends_date: "ends_date",
  entitled_method: "entitled_method",
  entitlements: "entitlements",
  number_of_discount_codes: "number_of_discount_codes",
  number_of_entitlements : "number_of_entitlements",
  prerequisite_assignee_codes: "prerequisite_assignee_codes",
  prerequisite_birthday_duration: "prerequisite_birthday_duration",
  prerequisite_customer_group_ids: "prerequisite_customer_group_ids",
  prerequisite_customer_loyalty_level_ids: "prerequisite_customer_loyalty_level_ids",
  prerequisite_customer_type_ids : "prerequisite_customer_type_ids",
  prerequisite_genders: "prerequisite_genders",
  prerequisite_order_source_ids: "prerequisite_order_source_ids",
  prerequisite_sales_channel_names: "prerequisite_sales_channel_names",
  prerequisite_store_ids: "prerequisite_store_ids",
  prerequisite_subtotal_range: "prerequisite_subtotal_range",
  prerequisite_time_duration: "prerequisite_time_duration",
  prerequisite_wedding_duration: "prerequisite_wedding_duration",
  prerequisite_weekdays: "prerequisite_weekdays",
  priority: "priority",
  quantity_limit: "quantity_limit",
  rule: "rule",
  starts_date: "starts_date",
  state: "state",
  title: "title",
  total_usage_count: "total_usage_count",
  type: "type",
  value: "value",
  value_type: "value_type",
  usage_limit: "usage_limit",
  usage_limit_per_customer: "usage_limit_per_customer",
  conditions: "conditions",
}

export const DiscountUnitType = {
  PERCENTAGE: { value: "PERCENTAGE", label: "%" },
  FIXED_PRICE: { value: "FIXED_PRICE", label: "đ" },
  FIXED_AMOUNT: { value: "FIXED_AMOUNT", label: "đ" },
};
export const newEntitlements: EntilementFormModel = {
  entitled_variant_ids: [],
  entitled_product_ids: [],
  selectedProducts: [],
  prerequisite_variant_ids: [],
  entitled_category_ids: [],
  prerequisite_quantity_ranges: [
    {
      greater_than_or_equal_to: 0,
      less_than_or_equal_to: null,
      allocation_limit: undefined,
      value: 0,
      value_type: undefined,
    }
  ],
}

export const OPERATOR_SELECT_OPTIONS  = [
  {
    label: "Bằng",
    value: "EQUALS",
    activeType:["string", "number"],
  },
  {
    label: "Không bằng",
    value: "NOT_EQUAL_TO",
    activeType:["string", "number"],
  },
  {
    label: "Chứa",
    value: "CONTAINS",
    activeType:["string", "number"],
  },
  {
    label: "Không chứa",
    value: "DOES_NOT_CONTAIN",
    activeType:["string", "number"],
  },
  {
    label: "Bắt đầu với",
    value: "STARTS_WITH",
    activeType:["string", "number"],
  },
  {
    label: "Kết thúc với",
    value: "ENDS_WITH",
    activeType:["string", "number"],
  },
  {
    label: "Lớn hơn",
    value: "GREATER_THAN",
    activeType:["number"],
  },
  {
    label: "Lớn hơn hoặc bằng",
    value: "GREATER_THAN_OR_EQUAL_TO",
    activeType:["number"],
  },
  {
    label: "Nhỏ hơn",
    value: "LESS_THAN",
    activeType:["number"],
  },
  {
    label: "Nhỏ hơn hoặc bằng",
    value: "LESS_THAN_OR_EQUAL_TO",
    activeType:["number"],
  },
];

export const FIELD_SELECT_OPTIONS = [
  {
    label: "Tên sản phẩm",
    value: "product_name",
    type:["string"],
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <Item name={name} rules={rules}>
        <Input placeholder="Tên sản phẩm" defaultValue={defaultValue} />
      </Item>
    ),
  },
  {
    label: "Mã SKU",
    value: "sku",
    type:["string"],
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <Item name={name} rules={rules}>
        <Input placeholder="Mã SKU" defaultValue={defaultValue} />
      </Item>
    ),
  },
  {
    label: "Danh mục sản phẩm",
    value: "category_name",
    type:["string"],
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <Item name={name} rules={rules}>
        <Input placeholder="Nhập danh mục" defaultValue={defaultValue} />
      </Item>
    ),
  },
  {
    label: "Tag sản phẩm",
    value: "product_tag",
    type:["string"],
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <Item name={name} rules={rules}>
        <Input placeholder="Nhập tag sản phẩm" defaultValue={defaultValue} />
      </Item>
    ),
  },
  {
    label: "Kích cỡ",
    value: "product_size",
    type:["string", "number"],
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <Item name={name} rules={rules}>
        <Input placeholder="Nhập kích cỡ" defaultValue={defaultValue} />
      </Item>
    ),
  },
  {
    label: "Màu sắc",
    value: "option_color",
    type:["string"],
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <Item name={name} rules={rules}>
        <Input placeholder="Nhập màu sắc" defaultValue={defaultValue} />
      </Item>
    ),
  },
  {
    label: "Giá trị đơn hàng",
    value: "subtotal",
    type:["number"],
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <Item name={name} rules={rules}>
        <InputNumber style={{ width: '100%' }} placeholder="Giá trị đơn hàng" defaultValue={Number(defaultValue)} formatter={(value) => formatDiscountValue(Number(value), false)} min={0} />
      </Item>
    ),
  },
  {
    label: "Số lượng",
    value: "quantity",
    type:["number"],
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <Item name={name} rules={rules}>
        <InputNumber style={{ width: '100%' }} placeholder="Số lượng" defaultValue={Number(defaultValue)} formatter={(value) => formatDiscountValue(Number(value), false)} min={0} max={999999} />
      </Item>
    ),
  },
];

export const priorityOptions = [
  {
    value: 1,
    label: "Số 1 (cao nhất)",
  },
  {
    value: 2,
    label: "Số 2",
  },
  {
    value: 3,
    label: "Số 3",
  },
  {
    value: 4,
    label: "Số 4",
  },
  {
    value: 5,
    label: "Số 5",
  },
  {
    value: 6,
    label: "Số 6",
  },
  {
    value: 7,
    label: "Số 7",
  },
  {
    value: 8,
    label: "Số 8",
  },
  {
    value: 9,
    label: "Số 9",
  },
];


export const dayOfWeekOptions = [
  {
    value: "SUN",
    label: "Chủ nhật",
  },
  {
    value: "MON",
    label: "Thứ 2",
  },
  {
    value: "TUE",
    label: "Thứ 3",
  },
  {
    value: "WED",
    label: "Thứ 4",
  },
  {
    value: "THU",
    label: "Thứ 5",
  },
  {
    value: "FRI",
    label: "Thứ 6",
  },
  {
    value: "SAT",
    label: "Thứ 7",
  },
];


//discount view
export const DISCOUNT_STATUS = [
  {
    code: "ACTIVE",
    value: "Đang áp dụng",

    Component: <TagStatus type="primary">Đang áp dụng</TagStatus>,

  },
  {
    code: "DISABLED",
    value: "Tạm ngưng",

    Component: <TagStatus type="warning">Tạm ngưng</TagStatus>,

  },
  {
    code: "DRAFT",
    value: "Chờ áp dụng",
    Component: <TagStatus >Chờ áp dụng</TagStatus>,

  },
  {
    code: "CANCELLED",
    value: "Đã huỷ",
    Component: <TagStatus type="danger">Đã huỷ</TagStatus>,
  },
];

export const columnFixedPrice = [
  {
    title: "STT",
    align: "center",
    width: "5%",
    render: (value: any, item: any, index: number) => index + 1,
  },
  {
    title: "Sản phẩm",
    dataIndex: "sku",
    visible: true,
    align: "left",
    width: "20%",
    render: (sku: string, item: any, index: number) => {

      let url = `${UrlConfig.PRODUCT}/${item.product_id}`;
      if (item.variant_id) {
        url = `${url}/variants/${item.variant_id}`
      }
      return (
        <div>
          <Link to={url}>
            {sku}
          </Link>
          <div>{item.variant_title}</div>
        </div>
      );
    },
  },
  {
    title: "Giá bán",
    align: "center",
    visible: false,
    dataIndex: "cost",
    render: (value: number) => value >= 0 ? formatCurrency(value) : "-",
  },
  {
    title: "Chiết khấu",
    align: "center",
    dataIndex: "entitlement",
    render: (entitlement: EntilementFormModel, item: any, index: number) => {
      if (entitlement) {
        const { value, value_type } = entitlement.prerequisite_quantity_ranges[0]
        return renderDiscountValue(value || 0, value_type || '');
      } else {
        return ''
      }
    }
  },
  {
    title: "Giá sau chiết khấu",
    align: "center",
    dataIndex: "entitlement",
    render: (entitlement: EntilementFormModel, record: ProductEntitlements) => {
      if (Array.isArray(entitlement?.prerequisite_quantity_ranges) && entitlement.prerequisite_quantity_ranges?.length > 0 && record.cost >= 0) {
        const { value, value_type } = entitlement.prerequisite_quantity_ranges[0]

        return <span style={{ color: "#E24343" }}>{
          renderTotalBill(
            record.cost,
            value || 0,
            value_type || ''
          )
        }</span>
      } else {
        return "-"
      }

    },
  },
  {
    title: "SL Tối thiểu",
    align: "center",
    dataIndex: "entitlement",
    render: (entitlement: EntilementFormModel, record: ProductEntitlements) => {
      if (Array.isArray(entitlement?.prerequisite_quantity_ranges) && entitlement.prerequisite_quantity_ranges?.length > 0) {
        return entitlement.prerequisite_quantity_ranges[0].greater_than_or_equal_to;
      }
    }
  },
];

export const columnDiscountQuantity = [
  {
    title: "STT",
    align: "center",
    width: "5%",
    render: (value: any, item: any, index: number) => index + 1,
  },
  {
    title: "Sản phẩm",
    dataIndex: "sku",
    visible: true,
    align: "left",
    width: "20%",
    render: (sku: string, item: ProductEntitlements, index: number) => {

      let url = `${UrlConfig.PRODUCT}/${item.product_id}`;
      if (item.variant_id) {
        url = `${url}/variants/${item.variant_id}`
      }
      return (
        <div>
          <Link to={url}>
            {sku}
          </Link><br />
          <div>{item.variant_title}</div>
        </div>
      );
    },
  },
  {
    title: "Giá bán",
    align: "center",
    visible: false,
    dataIndex: "cost",
    render: (cost: number) => {
      if (cost >= 0) {
        return formatCurrency(cost)
      } else {
        return "-"
      }
    },
  },
  {
    title: "Giá cố định",
    align: "center",
    dataIndex: "entitlement",
    render: (entitlement: EntilementFormModel, record: ProductEntitlements) => {
      if (Array.isArray(entitlement?.prerequisite_quantity_ranges) && entitlement.prerequisite_quantity_ranges?.length > 0) {
        return (
          <span style={{ color: "#E24343" }}>{formatCurrency(entitlement.prerequisite_quantity_ranges[0].value || '')}</span>
        )
      } else {
        return '';
      }
    },
  },
  {
    title: "SL Tối thiểu",
    align: "center",
    dataIndex: "entitlement",
    render: (entitlement: EntilementFormModel) => {
      if (Array.isArray(entitlement?.prerequisite_quantity_ranges) && entitlement.prerequisite_quantity_ranges?.length > 0) {
        return (
          <span>{formatCurrency(entitlement.prerequisite_quantity_ranges[0].greater_than_or_equal_to || '')}</span>
        )
      } else {
        return '';
      }
    }
  }
];

export const columnDiscountByRule = [
  {
    title: "STT",
    width: "5%",
    render: (value: any, item: DiscountConditionRule, index: number) => index + 1,
  },
  {
    title: "Thuộc tính",
    dataIndex: "field",
    visible: true,
    width: "20%",
    render: (field: string) => {
      return (FIELD_SELECT_OPTIONS.find(x => x.value === field)?.label || '');
    }
  },
  {
    title: "Loại điều kiện",
    dataIndex: "operator",
    visible: true,
    width: "20%",
    render: (operator: string) => {
      return (OPERATOR_SELECT_OPTIONS.find(x => x.value === operator)?.label || '');
    }
  },
  {
    title: "Giá trị",
    dataIndex: "value",
    visible: true,
    width: "20%",
    render: (value: string, item: DiscountConditionRule) => {
      if (item.field === "quantity" || item.field === "subtotal") {
        return formatCurrency(value);
      }
      return value;
    }
  },
];


// update


// promo code 
export const STATUS_PROMO_CODE: any = [
  {
    disabled: false,
    Component: <TagStatus type="primary">Đang áp dụng</TagStatus>,
  },
  {
    disabled: true,
    Component: <TagStatus type="warning">Ngừng áp dụng</TagStatus>,
  },
];

export const statuses = [
  {
    code: "ENABLED",
    value: "Đang áp dụng",
  },
  {
    code: "DISABLED",
    value: "Ngừng áp dụng",
  },
];

export const ACTIONS_PROMO: Array<MenuAction> = [
  { id: 1, name: "Kích hoạt" },
  { id: 2, name: "Tạm ngừng" },
  { id: 3, name: "Xuất Excel", disabled: true },
  { id: 4, name: "Xoá", disabled: true },
];

export const ACTIONS_DISCOUNT: Array<MenuAction> = [
  { id: 1, name: "Kích hoạt" },
  { id: 2, name: "Tạm ngừng" },
  // { id: 3, name: "Xuất Excel", disabled: true },
];

export const ACTIONS_PROMO_CODE: Array<MenuAction> = [
  {
    id: 2,
    name: "Áp dụng",
    disabled: false,
  },
  {
    id: 3,
    name: "Ngừng áp dụng",
    disabled: false,
  },
];