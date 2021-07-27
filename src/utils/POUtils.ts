import { AppConfig } from "config/AppConfig";
import { Type } from "config/TypeConfig";
import { VariantResponse } from "model/product/product.model";
import { PurchaseOrderLineItem, Vat } from "model/purchase-order/purchase-item.model";
import { Products } from "./AppUtils";

const POUtils = {
  convertVariantToLineitem: (
    variants: Array<VariantResponse>
  ): Array<PurchaseOrderLineItem> => {
    let result: Array<PurchaseOrderLineItem> = [];
    variants.forEach((variant) => {
      let newId = `${variant.sku}${new Date().getTime()}`;
      let price_response = Products.findPrice(
        variant.variant_prices,
        AppConfig.import_price,
        AppConfig.currency
      );
      let variant_image = Products.findAvatar(variant.variant_images);
      let price = price_response !== null ? price_response.price : 0;
      let newItem: PurchaseOrderLineItem = {
        sku: variant.sku,
        variant_id: variant.id,
        product_id: variant.product_id,
        product: variant.product.name,
        variant: variant.name,
        product_type: variant.product.product_type,
        quantity: 1,
        price: price,
        amount: price,
        note: "",
        type: Type.NORMAL,
        variant_image: variant_image !== null ? variant_image.url : null,
        unit: variant.product.unit,
        tax: 0,
        tax_included: false,
        tax_type_id: null,
        line_amount_after_line_discount: price,
        discount_rate: null,
        discount_value: null,
        discount_amount: 0,
        position: null,
        purchase_order_id: null,
        temp_id: newId,
      };
      result.push(newItem);
    });
    return result;
  },
  addProduct: (
    oldItems: Array<PurchaseOrderLineItem>,
    newItems: Array<PurchaseOrderLineItem>,
    split: boolean
  ) => {
    if (split) {
      return [...newItems, ...oldItems];
    }
    newItems.forEach((item) => {
      let index = oldItems.findIndex((oldItem) => oldItem.sku === item.sku);
      if (index === -1) {
        oldItems.push(item);
      } else {
        let oldItem = oldItems[index];
        let newQuantity = oldItem.quantity + 1;
        let amount = newQuantity * oldItem.price;
        let discount_amount =
          POUtils.caculateDiscountAmount(
            oldItem.price,
            oldItem.discount_rate,
            oldItem.discount_value
          ) * newQuantity;
        oldItems[index] = {
          ...oldItem,
          quantity: newQuantity,
          amount: amount,
          discount_amount: discount_amount,
          line_amount_after_line_discount: amount - discount_amount,
        };
      }
    });
    return [...oldItems];
  },
  caculateDiscountAmount: (
    price: number,
    discount_rate: number | null,
    discount_value: number | null
  ) => {
    if (discount_rate !== null && discount_rate !== 0) {
      return (price * discount_rate) / 100;
    }
    if (discount_value !== null && discount_value !== 0) {
      return discount_value;
    }
    return 0;
  },
  totalQuantity: (data: Array<PurchaseOrderLineItem>): number => {
    let total = 0;
    data.forEach((item) => (total = total + item.quantity));
    return total;
  },
  totalDiscount: (data: Array<PurchaseOrderLineItem>): number => {
    let total = 0;
    data.forEach((item) => (total = total + item.discount_amount));
    return total;
  },
  totalAmount: (data: Array<PurchaseOrderLineItem>): number => {
    let total = 0;
    data.forEach(
      (item) => (total = total + item.line_amount_after_line_discount)
    );
    return total;
  },
  updateQuantityItem: (data: PurchaseOrderLineItem, price: number, discount_rate: number|null, discount_value: number|null, quantity: number): PurchaseOrderLineItem => {
    let newQuantity = quantity;
    let amount = newQuantity * price;
    let discount_amount = POUtils.caculateDiscountAmount(
        price,
        discount_rate,
        discount_value
      ) * quantity;
    return {
      ...data, 
      price: price,
      quantity: newQuantity, 
      amount: amount, 
      discount_amount: discount_amount, 
      discount_rate: discount_rate, 
      discount_value: discount_value,
      line_amount_after_line_discount: amount - discount_amount
    };
  },
  updateVatItem: (data: PurchaseOrderLineItem, tax: number): PurchaseOrderLineItem => {
    return {...data, tax: tax}
  },
  caculatePrice: (price: number, discount_rate: number|null, discount_value: number|null) => {
    if(discount_rate !== null) {
      return price - price * discount_rate / 100;
    }
    if(discount_value !== null) {
      return price - discount_value;
    }
    return price;
  },
  getVatList: (data: Array<PurchaseOrderLineItem>): Array<Vat> => {
    let result: Array<Vat> = [];
    data.forEach((item) => {
      if(item.tax > 0) {
        let index = result.findIndex((vatItem) => vatItem.value === item.tax);
        let amountTax = item.line_amount_after_line_discount * item.tax / 100;
        if(index === -1) {
          result.push({
            value: item.tax,
            amount: amountTax,
          })
        } else {
          result[index].amount = result[index].amount + amountTax;
        }
      }
    })
    return result;
  },
  getTotalDiscount: (total: number, rate: number|null, value: number|null): number => {
    if(rate) {
      return total * rate / 100;
    }
    if(value) {
      return value;
    }
    return 0;
  },
  getTotalPayment: (total: number, total_discount: number, vats: Array<Vat>): number => {
    let sum = total - total_discount;
    vats.forEach((item) => {
      sum = sum + item.amount;
    })
    return sum;
  }
};

export { POUtils };
