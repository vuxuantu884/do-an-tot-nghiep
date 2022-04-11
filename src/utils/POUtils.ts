import { FormInstance } from "antd";
import { AppConfig } from "config/app.config";
import { Type } from "config/type.config";
import { uniqBy } from "lodash";
import { ProductResponse, VariantResponse } from "model/product/product.model";
import { CostLine } from "model/purchase-order/cost-line.model";
import { POField } from "model/purchase-order/po-field";
import {
  PurchaseOrderLineItem,
  Vat,
} from "model/purchase-order/purchase-item.model";
import { POLineItemColor, POLineItemGridSchema, POLineItemGridValue, POPairSizeColor, POPairSizeQuantity } from "model/purchase-order/purchase-order.model";
import {
  PurchaseProcumentLineItem,
  PurchaseProcument,
  PurchaseProcurementViewDraft
} from "model/purchase-order/purchase-procument";
import { QUANTITY_PROCUREMENT_UNIT, QuickInputQtyProcurementLineItem } from "screens/purchase-order/provider/purchase-order.provider";
import { Products } from "./AppUtils";
import { showError } from "./ToastUtils";

const POUtils = {
  convertVariantToLineitem: (
    variants: Array<VariantResponse>,
    position: number
  ): Array<PurchaseOrderLineItem> => {
    let result: Array<PurchaseOrderLineItem> = [];
    variants.forEach((variant, index) => {
      let newId = `${variant.sku}${new Date().getTime()}`;
      let price_response = Products.findPrice(
        variant.variant_prices,
        AppConfig.currency
      );
      let variant_image = Products.findAvatar(variant.variant_images);
      let price = price_response !== null ? price_response.import_price : 0;
      let newItem: PurchaseOrderLineItem = {
        sku: variant.sku,
        barcode: variant.barcode,
        variant_id: variant.id,
        product_id: variant.product_id,
        product: variant.product.name,
        variant: variant.name,
        product_type: variant.product.product_type,
        quantity: 1,
        price: price ?? 0,
        amount: price,
        note: "",
        type: Type.NORMAL,
        variant_image: variant_image !== null ? variant_image.url : null,
        unit: variant.product.unit,
        tax: 0,
        tax_rate: 0,
        tax_included: false,
        tax_type_id: null,
        line_amount_after_line_discount: price,
        discount_rate: null,
        discount_value: null,
        discount_amount: 0,
        position: position + index + 1,
        purchase_order_id: null,
        temp_id: newId,
        showNote: false,
        planned_quantity: 0,
        receipt_quantity: 0,
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
        oldItems.unshift(item);
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
  totalReceipt: (data: Array<PurchaseOrderLineItem>): number => {
    let total = 0;
    data.forEach((item) => (total = total + item.receipt_quantity));
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
  updateQuantityItem: (
    data: PurchaseOrderLineItem,
    price: number,
    discount_rate: number | null,
    discount_value: number | null,
    quantity: number
  ): PurchaseOrderLineItem => {
    let newQuantity = quantity;
    let amount = newQuantity * price;
    let discount_amount =
      POUtils.caculateDiscountAmount(price, discount_rate, discount_value) *
      quantity;
    let tax = amount * data.tax_rate / 100;
    return {
      ...data,
      tax: tax,
      price: price,
      quantity: newQuantity,
      amount: amount,
      discount_amount: discount_amount,
      discount_rate: discount_rate,
      discount_value: discount_value,
      line_amount_after_line_discount: amount - discount_amount,
    };
  },
  updateVatItem: (
    item: PurchaseOrderLineItem,
    tax_rate: number,
    data: Array<PurchaseOrderLineItem>,
    tradeDiscountRate: number | null,
    tradeDiscountValue: number | null
  ): PurchaseOrderLineItem => {
    let total = POUtils.totalAmount(data);
    let amount_after_discount = item.line_amount_after_line_discount;
    if (tradeDiscountRate !== null) {
      amount_after_discount =
        amount_after_discount -
        (amount_after_discount * tradeDiscountRate) / 100;
    } else if (tradeDiscountValue !== null) {
      amount_after_discount =
        amount_after_discount -
        (amount_after_discount / total) * tradeDiscountValue;
    }
    item.tax_rate = (tax_rate && tax_rate.toString() !== "") ? parseInt(tax_rate.toString()) : item.tax_rate;
    let tax = parseFloat(
      ((amount_after_discount * item.tax_rate) / 100).toFixed(2)
    );
    return { ...item, tax_rate: tax_rate, tax: tax };
  },
  caculatePrice: (
    price: number,
    discount_rate: number | null,
    discount_value: number | null
  ) => {
    if (discount_rate !== null) {
      return price - (price * discount_rate) / 100;
    }
    if (discount_value !== null) {
      return price - discount_value;
    }
    return price;
  },
  getVatList: (
    data: Array<PurchaseOrderLineItem>,
    tradeDiscountRate: number | null,
    tradeDiscountValue: number | null
  ): Array<Vat> => {
    let result: Array<Vat> = [];
    let total = POUtils.totalAmount(data);
    data.forEach((item) => {
      if (item.tax_rate > 0) {
        let index = result.findIndex(
          (vatItem) => vatItem.rate === item.tax_rate
        );
        let amount_after_discount = item.line_amount_after_line_discount;
        if (tradeDiscountRate !== null) {
          amount_after_discount =
            amount_after_discount -
            (amount_after_discount * tradeDiscountRate) / 100;
        } else if (tradeDiscountValue !== null) {
          amount_after_discount =
            amount_after_discount -
            (amount_after_discount / total) * tradeDiscountValue;
        }
        let amountTax = parseFloat(
          ((amount_after_discount * item.tax_rate) / 100).toFixed(2)
        );
        if (index === -1) {
          result.push({
            rate: item.tax_rate,
            amount: amountTax,
          });
        } else {
          result[index].amount = result[index].amount + amountTax;
        }
      }
    });
    return result;
  },
  getTotalDiscount: (
    total: number,
    rate: number | null,
    value: number | null
  ): number => {
    if (rate) {
      return (total * rate) / 100;
    }
    if (value) {
      return value;
    }
    return 0;
  },
  getTotaTradelDiscount: (
    total: number,
    rate: number | null,
    value: number | null
  ): number => {
    if (rate) {
      return (total * rate) / 100;
    }
    if (value) {
      return value;
    }
    return 0;
  },
  getTotalPayment: (
    total: number,
    trade_discount_total: number,
    payment_discount_total: number,
    total_cost_line: number,
    vats: Array<Vat>
  ): number => {
    let sum =
      total - trade_discount_total - payment_discount_total + total_cost_line;
    vats.forEach((item) => {
      sum = sum + item.amount;
    });
    return sum;
  },
  getTotaExpense: (data: Array<CostLine>): number => {
    let sum = 0;
    data.forEach((item) => {
      if (item && item.amount !== undefined && item.amount !== null) {
        sum = sum + item.amount;
      }
    });
    return sum;
  },
  getTotalAfterTax: (
    total: number,
    trade_discount_amount: number,
    vats: Array<Vat>
  ) => {
    let sum = total - trade_discount_amount;
    vats.forEach((item) => {
      sum = sum + item.amount;
    });
    return sum;
  },
  getPOProcumentItem: (data: Array<PurchaseOrderLineItem>) => {
    let result: Array<PurchaseProcumentLineItem> = [];
    data.forEach((item) => {
      result.push({
        barcode: item.barcode,
        line_item_id: item.position,
        code: item.code,
        sku: item.sku,
        variant: item.variant,
        variant_image: item.variant_image,
        ordered_quantity: item.quantity,
        planned_quantity: item.planned_quantity,
        accepted_quantity: item.receipt_quantity,
        quantity: 0,
        real_quantity: 0,
        note: "",
      });
    });
    return result;
  },
  totalQuantityProcument: (data: Array<PurchaseProcumentLineItem>) => {
    let total = 0;
    data.forEach((item) => (total = total + item.quantity));
    return total;
  },
  totalAccpectQuantityProcument: (data: Array<PurchaseProcumentLineItem>) => {
    let total = 0;
    data.forEach((item) => (total = total + item.accepted_quantity));
    return total;
  },
  totalRealQuantityProcument: (data: Array<PurchaseProcumentLineItem>) => {
    let total = 0;
    data.forEach((item) => (total = total + item.real_quantity));
    return total;
  },
  totalOrderQuantityProcument: (data: Array<PurchaseProcumentLineItem>) => {
    let total = 0;
    data.forEach((item) => (total = total + item.ordered_quantity));
    return total;
  },
  getNewProcument: (
    procuments: Array<PurchaseProcument>,
    data: Array<PurchaseOrderLineItem>
  ) => {
    let newProcuments: Array<PurchaseProcument> = [];
    procuments.forEach((item) => {
      let newProcumentLineItem = [...item.procurement_items];
      item.procurement_items.forEach((procumentItem, indexItem) => {
        let index = data.findIndex(
          (lineItem) => lineItem.sku === procumentItem.sku
        );
        if (index === -1) {
          newProcumentLineItem.splice(indexItem, 1);
        }
      });
      data.forEach((lineItem) => {
        let index = newProcumentLineItem.findIndex(
          (procumentItem) => lineItem.sku === procumentItem.sku
        );
        if (index === -1) {
          newProcumentLineItem.push({
            barcode: lineItem.barcode,
            line_item_id: lineItem.position,
            code: lineItem.code,
            sku: lineItem.sku,
            variant: lineItem.variant,
            variant_image: lineItem.variant_image,
            ordered_quantity: lineItem.quantity,
            planned_quantity: lineItem.planned_quantity,
            accepted_quantity: lineItem.receipt_quantity,
            quantity: procuments.length === 1 ? lineItem.quantity : 0,
            real_quantity: 0,
            note: "",
          });
        } else {
          if (procuments.length === 1) {
            newProcumentLineItem[index].quantity = lineItem.quantity;
            newProcumentLineItem[index].ordered_quantity = lineItem.quantity;
          }
        }
      });
      item.procurement_items = newProcumentLineItem;
      newProcuments.push(item);
    });
    console.log(newProcuments);
    return newProcuments;
  },
};


/**
 * Bảng chọn sản phẩm dạng Grid
 */
export function initSchemaLineItem(product: ProductResponse, mode: "CREATE" | "READ_UPDATE", line_items?: Array<PurchaseOrderLineItem>): POLineItemGridSchema {
  /**
  * Build schema cho grid
  */

  /**
   * danh sách tất cả màu sắc của sản phẩm, nếu sản phẩm nào không có màu thì dùng tên của variant đó làm màu
   */
  const tempVariant = [...product.variants];
  tempVariant.forEach((variant: VariantResponse) => {
    if (!variant.color) {
      variant.color = variant.sku;
    }
    if (!variant.size) {
      variant.size = variant.sku;
    }
  })
  const baseColor: Array<POLineItemColor> = uniqBy(tempVariant, "color").map((item: VariantResponse) => {
    let price = 0;
    if (mode === "CREATE" && item.variant_prices?.length > 0 && item.variant_prices[0]?.import_price) {
      price = item.variant_prices[0].import_price
    } else if (mode === "READ_UPDATE" && line_items && line_items.length > 0) {
      price = line_items.find((lineItem) => lineItem.variant_id === item.id)?.price || 0;
    }

    return {
      color: item.color.trim(),
      clothCode: item.sku.split("-")[1],
      lineItemPrice: price,// giá nhập, không có thì mặc định là 0
    };

  });

  /**
   * danh sách tất cả size của sản phẩm, nếu sản phẩm nào không có size thì dùng tên của variant đó làm size
   */
  const baseSize = uniqBy(tempVariant, "size").map((item: VariantResponse) => {
    return item.size.trim();
  });

  /**
   * dánh sách các variant của sản phẩm
   */
  const mappingColorAndSize = product.variants.map((variant: VariantResponse) => {
    return {
      color: variant.color ?? variant.sku.split("-")[0],
      size: variant.size ?? variant.sku.split("-")[0],
      variantId: variant.id,
      sku: variant.sku,
      variant: variant.name,
      product_id: product.id,
      product: product.name,

      barcode: variant.barcode,
      product_type: product.product_type,
      unit: product.unit,

    }
  })

  const variantIdList = product.variants.map((item: VariantResponse) => {
    return item.id;
  });

  return {
    productId: product.id,
    productName: product.name,
    productCode: product.code,
    baseColor,
    baseSize,
    mappingColorAndSize,
    variantIdList
  }
}

export function initValueLineItem(poLineItemGridSchema: POLineItemGridSchema, line_items?: Array<PurchaseOrderLineItem>): Map<string, POLineItemGridValue> {
  const map = new Map<string, POLineItemGridValue>();
  poLineItemGridSchema.baseColor.forEach((c: POLineItemColor) => {
    const sizeOfColor: POPairSizeColor[] = poLineItemGridSchema.mappingColorAndSize.filter(item => item.color === c.color);
    const initSizeValue: any = sizeOfColor.reduce((prev: Array<POPairSizeQuantity>, current: POPairSizeColor) => {
      return [
        ...prev,
        {
          variantId: current.variantId,
          size: current.size,
          quantity: line_items?.find(item => item.variant_id === current.variantId)?.quantity ?? 0,
        }
      ] as Array<POPairSizeQuantity>;
    }, [] as Array<POPairSizeQuantity>);

    map.set(c.color, {
      price: c.lineItemPrice || 0,
      sizeValues: initSizeValue,
    });
  })
  return map;
}

export const getTotalPriceOfAllLineItem = (poLineItemGridValue: Array<Map<string, POLineItemGridValue>>) => {
  let amount: number = 0;
  poLineItemGridValue.forEach((productLine: Map<string, POLineItemGridValue>) => {
    const mapIterator = productLine.values();
    const mapLength = productLine.size;
    for (let i = 0; i < mapLength; i++) {
      const value: POLineItemGridValue = mapIterator.next().value;
      amount += value.price * value.sizeValues.reduce((acc, cur) => acc + cur.quantity, 0);
    }
  })
  return amount;
}

export const combineLineItemToSubmitData = (
  poLineItemGridValue: Array<Map<string, POLineItemGridValue>>,
  poLineItemGridChema: Array<POLineItemGridSchema>,
  taxRate: number
) => {
  const newDataItems: any = [];
  poLineItemGridValue.forEach((item: Map<string, POLineItemGridValue>, index: number) => {
    poLineItemGridChema[index].mappingColorAndSize.forEach((pair: POPairSizeColor) => {
      const value: POLineItemGridValue | undefined = item.get(pair.color);

      if (value) {
        const qty = value.sizeValues.find(item => item.size === pair.size)?.quantity || 0;
        const amount = qty * value.price
        newDataItems.push({
          //Dữ liệu cơ bản thì lấy từ schema
          variant_id: pair.variantId,
          variant: pair.variant,
          product_id: pair.product_id,
          sku: pair.sku,
          product: pair.product,
          barcode: pair.barcode,

          // Dữ liệu nhập liệu thì lấy thì value object
          quantity: qty,
          price: value.price,
          purchase_order_id: null,
          tax: (amount * taxRate) / 100,
          tax_rate: taxRate,
          amount: amount, // Tổng tiền
          line_amount_after_line_discount: qty * value.price, // Tổng tiền sau giảm giá, hiện tại chưa có nên để bằng amount

        });
      }
    })
  });
  return newDataItems;
}

export const validateLineItem = (poLineItemGridValue: Array<Map<string, POLineItemGridValue>>) => {
  if (poLineItemGridValue.length === 0) {
    showError("Vui lòng thêm sản phẩm");
    return false;
  }
  /**
   * Validate xem đã nhập giá nhập chưa
   * poLineItemGridValue : mảng các Map chưa số lượng sản phẩm của từng size theo màu
   */
  return !poLineItemGridValue.some(item => {
    const mapIterator = item.values();
    const length = item.size;
    // Lọc theo độ dài của Map
    for (let i = 0; i < length; i++) {
      const value: POLineItemGridValue = mapIterator.next().value;
      // với mỗi màu tương ứng 1 row trong grid, nếu giá nhập chưa có thì báo lỗi
      if (!value.price) {
        showError("Vui lòng nhập đơn giá sản phẩm");
        return true;
      }
    }
    return false;
  })
}

export const setProcurementLineItemById =
  (formMain: FormInstance,
    variantIdList: number[],
    inputValue: number,
    quickInputQtyProcurementLineItem: QuickInputQtyProcurementLineItem) => {
    const procurements: Array<PurchaseProcurementViewDraft> = formMain.getFieldValue(POField.procurements);

    procurements.forEach((procurement: PurchaseProcurementViewDraft, index) => {
      /**
       * Lấy giá trị từ mảng quickInputQtyProcurementLineItem
       * kiểm nếu 
       */
      const { unit, value } = quickInputQtyProcurementLineItem[index];
      variantIdList.forEach((variantId: number) => {
      const mappingProcurementItem = procurement.procurement_items.find((item) => item.id === variantId);
      if (mappingProcurementItem) {
        if (unit === QUANTITY_PROCUREMENT_UNIT.PERCENT) {
          mappingProcurementItem.quantity = Math.ceil(inputValue * value / 100);
        } else {
          mappingProcurementItem.quantity = inputValue;
        }
      }
    })
    })

    //update lại giá trị vừa đc khởi tạo
    formMain.setFieldsValue({
      [POField.procurements]: [...procurements],
    });
  }
export { POUtils };
