import { AppConfig } from "config/app.config";
import { debounce } from "lodash";
import { FormInstance } from "antd";
import UrlConfig from "config/url.config";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { ProductStampPrinting, PurchaseOrder } from "model/purchase-order/purchase-order.model";

export enum FormFiledStampPrinting {
  variants = "variants",
  type_name = "type_name",
  order_code = "order_code",
  supplier_id = "supplier_id",
  supplier = "supplier",
  note = "note",
  order_id = "order_id",
}
export const initFormValueStampPrinting = {
  type_name: "excel",
  variants: [],
};
export const defaultBreadcrumbStampPrinting = [
  {
    name: "Kho hàng",
  },
  {
    name: "Đặt hàng",
    path: `${UrlConfig.PURCHASE_ORDERS}`,
  },
];
export const handleSelectProduct = (
  item: PurchaseOrderLineItem,
  index: number,
  selectedIds: number[],
  setSelectedIds: (data: number[]) => void,
) => {
  if (item.variant_id) {
    if (selectedIds.includes(item.variant_id)) {
      setSelectedIds(selectedIds.filter((id) => id !== item.variant_id));
    } else {
      setSelectedIds([...selectedIds, item.variant_id]);
    }
  }
};
const debounceQtyPrintByVariant = debounce(function (
  index: number,
  products: ProductStampPrinting[],
  form: FormInstance,
) {
  const quantity_req = products[index].quantity_req;
  const surplus = (quantity_req || 0) % AppConfig.AMOUNT_IN_STAMP_ON_ONE_LINE;
  products[index].quantity_req = !surplus
    ? quantity_req
    : quantity_req + (AppConfig.AMOUNT_IN_STAMP_ON_ONE_LINE - surplus);
  form.setFieldsValue({ [FormFiledStampPrinting.variants]: [...products] });
},
AppConfig.TYPING_TIME_REQUEST);

export const handleChangeQtyPrintByVariantId = (
  variantId: number,
  quantity: number,
  form: FormInstance,
) => {
  if (typeof quantity === "number") {
    const selectedProduct: ProductStampPrinting[] =
      form.getFieldValue(FormFiledStampPrinting.variants) || [];
    const index = selectedProduct.findIndex((item) => item.variant_id === variantId);
    if (index >= 0) {
      selectedProduct[index].quantity_req = quantity;
      form.setFieldsValue({
        [FormFiledStampPrinting.variants]: [...selectedProduct],
      });
      debounceQtyPrintByVariant(index, selectedProduct, form);
    }
  }
};

export const handleSupplementalStamp = (
  rate: number,
  form: FormInstance,
  poData: PurchaseOrder,
) => {
  const lineItems = poData?.line_items || [];
  const selectedProduct: ProductStampPrinting[] =
    form.getFieldValue(FormFiledStampPrinting.variants) || [];
  const newProduct = selectedProduct.map((item) => {
    const lineItem = lineItems.find((lineItem) => lineItem.variant_id === item.variant_id);
    const lineItemQty = lineItem ? lineItem.quantity : 0;
    const quantity = lineItemQty + Math.round((lineItemQty * rate) / 100);
    const surplus = (quantity || 0) % AppConfig.AMOUNT_IN_STAMP_ON_ONE_LINE;
    const quantity_req = !surplus
      ? quantity
      : quantity + (AppConfig.AMOUNT_IN_STAMP_ON_ONE_LINE - surplus);
    return {
      ...item,
      quantity_req,
    };
  });
  form.setFieldsValue({ [FormFiledStampPrinting.variants]: [...newProduct] });
};
