import { Form, Input, InputNumber } from "antd";
import TagStatus from "component/tag/tag-status";
import UrlConfig from "config/url.config";
import { DiscountConditionRule, EntilementFormModel, ProductEntitlements } from "model/promotion/discount.create.model";
import { Rule } from "rc-field-form/lib/interface";
import { Link } from "react-router-dom";
import { formatCurrency } from "utils/AppUtils";
import { formatDiscountValue, renderDiscountValue, renderTotalBill } from "utils/PromotionUtils";
const { Item } = Form;

export const DiscountUnitType = {
  PERCENTAGE: { value: "PERCENTAGE", label: "%" },
  FIXED_PRICE: { value: "FIXED_PRICE", label: "đ" },
  FIXED_AMOUNT: { value: "FIXED_AMOUNT", label: "đ" },
};

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
      // <CategorySearchSelect
      //   placeholder="Danh mục sản phẩm"
      //   name={name}
      //   rules={rules}
      //   defaultValue={defaultValue ? Number(defaultValue) : undefined}
      //   label=""
      // />
      <Item name={name} rules={rules}>
        <Input placeholder="Nhập danh mục" defaultValue={defaultValue} />
      </Item>
    ),
  },
  {
    label: "Tag sản phẩm",
    value: "product_tag",
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <Item name={name} rules={rules}>
        <Input placeholder="Nhập tag sản phẩm" defaultValue={defaultValue} />
      </Item>
    ),
  },
  {
    label: "Kích cỡ",
    value: "product_size",
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      // <SizeSearchSelect placeholder="Nhập kích cỡ" name={name} rules={rules} label="" defaultValue={defaultValue} />
      <Item name={name} rules={rules}>
        <Input placeholder="Nhập kích cỡ" defaultValue={defaultValue} />
      </Item>
    ),
  },
  {
    label: "Màu sắc",
    value: "option_color",
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      // <ColorSelectSearch
      //   placeholder="Màu sắc"
      //   name={name}
      //   rules={rules}
      //   label=""
      //   querySearch={{ is_main_color: 0 }}
      //   defaultValue={defaultValue}
      // />
      <Item name={name} rules={rules}>
        <Input placeholder="Nhập màu sắc" defaultValue={defaultValue} />
      </Item>
    ),
  },
  {
    label: "Giá trị đơn hàng",
    value: "subtotal",
    valueComponent: (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
      <Item name={name} rules={rules}>
        <InputNumber style={{ width: '100%' }} placeholder="Giá trị đơn hàng" defaultValue={Number(defaultValue)} formatter={(value) => formatDiscountValue(Number(value), false)} min={0} />
      </Item>
    ),
  },
  {
    label: "Số lượng",
    value: "quantity",
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
export const discountStatus = [
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
  {
    title: "Giới hạn",
    align: "center",
    dataIndex: "entitlement",
    render: (entitlement: EntilementFormModel, record: ProductEntitlements) => {
      if (Array.isArray(entitlement?.prerequisite_quantity_ranges) && entitlement.prerequisite_quantity_ranges?.length > 0) {
        return entitlement.prerequisite_quantity_ranges[0].allocation_limit;
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
      if (Array.isArray(entitlement?.prerequisite_quantity_ranges) && entitlement.prerequisite_quantity_ranges?.length > 0 ) {
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
  },
  {
    title: "Giới hạn",
    align: "center",
    dataIndex: "entitlement",
    render: (entitlement: EntilementFormModel) => {
      if (Array.isArray(entitlement?.prerequisite_quantity_ranges) && entitlement.prerequisite_quantity_ranges?.length > 0) {
        return (
          <span>{entitlement.prerequisite_quantity_ranges[0].allocation_limit || ''}</span>
        )
      } else {
        return '';
      }
    }
  },
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
      return (FieldSelectOptions.find(x => x.value === field)?.label || '');
    }
  },
  {
    title: "Loại điều kiện",
    dataIndex: "operator",
    visible: true,
    width: "20%",
    render: (operator: string) => {
      return (OperatorSelectOptions.find(x => x.value === operator)?.label || '');
    }
  },
  {
    title: "Giá trị",
    dataIndex: "value",
    visible: true,
    width: "20%"
  },
];


// update
export const OperatorSelectOptions = [
  {
    label: "Bằng",
    value: "EQUALS",
  },
  {
    label: "Không bằng",
    value: "NOT_EQUAL_TO",
  },
  {
    label: "Chứa",
    value: "CONTAINS",
  },
  {
    label: "Không chứa",
    value: "DOES_NOT_CONTAIN",
  },
  {
    label: "Bắt đầu với",
    value: "STARTS_WITH",
  },
  {
    label: "Kết thúc với",
    value: "ENDS_WITH",
  },
  {
    label: "Lớn hơn",
    value: "GREATER_THAN",
  },
  {
    label: "Lớn hơn hoặc bằng",
    value: "GREATER_THAN_OR_EQUAL_TO",
  },
  {
    label: "Nhỏ hơn",
    value: "LESS_THAN",
  },
  {
    label: "Nhỏ hơn hoặc bằng",
    value: "LESS_THAN_OR_EQUAL_TO",
  },
];