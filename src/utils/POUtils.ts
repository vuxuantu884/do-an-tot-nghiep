import { FormInstance } from "antd";
import { AppConfig } from "config/app.config";
import { isEmpty, uniqBy } from "lodash";
import { ProductResponse, VariantResponse } from "model/product/product.model";
import { CostLine } from "model/purchase-order/cost-line.model";
import { POField } from "model/purchase-order/po-field";
import {
  POLineItemType,
  POLoadType,
  PurchaseOrderLineItem,
  Vat,
} from "model/purchase-order/purchase-item.model";
import {
  POLineItemColor,
  POLineItemGridSchema,
  POLineItemGridValue,
  POPairSizeColor,
  POPairSizeQuantity,
  PurchaseOrder,
} from "model/purchase-order/purchase-order.model";
import {
  PurchaseProcument,
  PurchaseProcumentLineItem,
  PurchaseProcurementViewDraft,
} from "model/purchase-order/purchase-procument";
import { Dispatch } from "react";
import {
  QUANTITY_PROCUREMENT_UNIT,
  QuickInputQtyProcurementLineItem,
} from "screens/purchase-order/provider/purchase-order.provider";
import { productDetailApi } from "service/product/product.service";
import { callApiNative } from "./ApiUtils";
import { Products } from "./AppUtils";
import { POStatus } from "./Constants";

const POUtils = {
  convertVariantToLineitem: (
    variants: Array<VariantResponse>,
    position: number,
    variantType: string,
  ): Array<PurchaseOrderLineItem> => {
    let result: Array<PurchaseOrderLineItem> = [];
    variants.forEach((variant, index) => {
      let newId = `${variant.sku}${new Date().getTime()}`;
      let price_response = Products.findPrice(variant.variant_prices, AppConfig.currency);
      let variant_image = Products.findAvatar(variant.variant_images);
      let price = price_response !== null ? price_response.import_price : 0;
      const retailPrice = variant.variant_prices[0].retail_price;
      const cost_price = variant.variant_prices[0].cost_price;

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
        type: variantType,
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
        retail_price: retailPrice,
        cost_price,
        color: variant.color_id,
        color_code: variant?.color_code,
        variant_prices: variant.variant_prices,
      };
      result.push(newItem);
    });
    return result;
  },
  addProduct: (
    oldItems: Array<PurchaseOrderLineItem>,
    newItems: Array<PurchaseOrderLineItem>,
    split: boolean,
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
            oldItem.discount_value,
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
    discount_value: number | null,
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
  totalAcceptedQuantity: (data: Array<PurchaseProcumentLineItem>): number => {
    let total = 0;
    data.forEach((item) => (total = total + item.accepted_quantity));
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
  totalAmount: (formMain: FormInstance): number => {
    let total = 0;
    const lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items);
    lineItems.forEach((item) => (total = total + item.line_amount_after_line_discount));
    return total;
  },
  updateLineItemByQuantity: (
    lineItem: PurchaseOrderLineItem,
    quantity: number,
  ): PurchaseOrderLineItem => {
    let amount = quantity * lineItem.price;
    let discount_amount =
      POUtils.caculateDiscountAmount(
        lineItem.price,
        lineItem.discount_rate,
        lineItem.discount_value,
      ) * quantity;
    return {
      ...lineItem,
      quantity: quantity,
      amount: amount,
      discount_amount: discount_amount,
      line_amount_after_line_discount: amount - discount_amount,
    };
  },
  updateLineItemByPrice: (
    lineItem: PurchaseOrderLineItem,
    price: number,
  ): PurchaseOrderLineItem => {
    let amount = price * lineItem.quantity;
    let discount_amount =
      POUtils.caculateDiscountAmount(price, lineItem.discount_rate, lineItem.discount_value) *
      lineItem.quantity;
    return {
      ...lineItem,
      price: price,
      amount: amount,
      discount_amount: discount_amount,
      line_amount_after_line_discount: amount - discount_amount,
    };
  },
  updateQuantityItem: (
    data: PurchaseOrderLineItem,
    price: number,
    discount_rate: number | null,
    discount_value: number | null,
    quantity: number,
  ): PurchaseOrderLineItem => {
    let amount = quantity * price;
    let discount_amount =
      POUtils.caculateDiscountAmount(price, discount_rate, discount_value) * quantity;
    let tax = (amount * data.tax_rate) / 100;
    return {
      ...data,
      tax: tax,
      price: price,
      quantity: quantity,
      amount: amount,
      discount_amount: discount_amount,
      discount_rate: discount_rate,
      discount_value: discount_value,
      line_amount_after_line_discount: amount - discount_amount,
    };
  },
  updateLineItemByVat: (
    lineItem: PurchaseOrderLineItem,
    tax_rate: number,
  ): PurchaseOrderLineItem => {
    lineItem.tax_rate = tax_rate;
    lineItem.tax = parseFloat(
      ((lineItem.line_amount_after_line_discount * tax_rate) / 100).toFixed(2),
    );
    return lineItem;
  },
  caculatePrice: (price: number, discount_rate: number | null, discount_value: number | null) => {
    if (discount_rate !== null) {
      return price - (price * discount_rate) / 100;
    }
    if (discount_value !== null) {
      return price - discount_value;
    }
    return price;
  },
  getVatList: (formMain: FormInstance, isSupplement?: Boolean): Array<Vat> => {
    let result: Array<Vat> = [];
    let lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items);
    let tradeDiscountRate = formMain.getFieldValue(POField.trade_discount_rate);
    let tradeDiscountValue = formMain.getFieldValue(POField.trade_discount_value);
    let total = POUtils.totalAmount(formMain);
    lineItems.forEach((item) => {
      if (
        item.tax_rate > 0 && isSupplement
          ? item.type === POLineItemType.SUPPLEMENT
          : item.type !== POLineItemType.SUPPLEMENT
      ) {
        let index = result.findIndex((vatItem) => vatItem.rate === item.tax_rate);
        let amount_after_discount = item.line_amount_after_line_discount;
        if (tradeDiscountRate !== null) {
          amount_after_discount =
            amount_after_discount - (amount_after_discount * tradeDiscountRate) / 100;
        } else if (tradeDiscountValue !== null) {
          amount_after_discount =
            amount_after_discount - (amount_after_discount / total) * tradeDiscountValue;
        }
        let amountTax = parseFloat(((amount_after_discount * item.tax_rate) / 100).toFixed(2));
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
  getTotalDiscount: (formMain: FormInstance, total: number): number => {
    let discountRate = formMain.getFieldValue(POField.trade_discount_rate);
    let discountValue = formMain.getFieldValue(POField.trade_discount_value);
    if (discountRate) {
      return (total * discountRate) / 100;
    } else if (discountValue) {
      return discountValue;
    }
    return 0;
  },
  getTotaTradelDiscount: (total: number, rate: number | null, value: number | null): number => {
    if (rate) {
      return (total * rate) / 100;
    }
    if (value) {
      return value;
    }
    return 0;
  },
  getTotalAfterTax: (formMain: FormInstance) => {
    let total = formMain.getFieldValue(POField.untaxed_amount);
    let sum = total - POUtils.getTotalDiscount(formMain, total);
    let vats = POUtils.getVatList(formMain);
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
        retail_price: item.retail_price,
        variant_id: item.variant_id,
        price: item.price,
        product_name: item.product,
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
  totalPlannedQuantityProcurement: (data: Array<PurchaseProcumentLineItem>) => {
    let total = 0;
    data.forEach((item) => (total = total + item.planned_quantity));
    return total;
  },
  getNewProcument: (
    procuments: Array<PurchaseProcument>,
    data: Array<PurchaseOrderLineItem>,
    poLineItemType: POLineItemType,
  ) => {
    let newProcuments: Array<PurchaseProcument> = [];
    procuments?.forEach((item) => {
      let newProcumentLineItem: PurchaseProcumentLineItem[] = [...item.procurement_items];
      item.procurement_items.forEach((procumentItem, indexItem) => {
        let index = data.findIndex((lineItem) => lineItem.sku === procumentItem.sku);
        if (index === -1) {
          newProcumentLineItem.splice(indexItem, 1);
        }
      });
      data.forEach((lineItem) => {
        if (poLineItemType !== POLineItemType.SUPPLEMENT) {
          let index = newProcumentLineItem.findIndex(
            (procumentItem) => lineItem.sku === procumentItem.sku,
          );
          if (index === -1) {
            newProcumentLineItem.push({
              barcode: lineItem.barcode,
              line_item_id: lineItem.position,
              code: lineItem.code,
              sku: lineItem.sku,
              variant: lineItem.variant,
              variant_image: lineItem.variant_image,
              ordered_quantity: 0,
              planned_quantity: lineItem.planned_quantity,
              accepted_quantity: 0,
              quantity: procuments.length === 1 ? lineItem.quantity : 0,
              real_quantity: 0,
              note: "",
              variant_id: lineItem.variant_id,
              retail_price: lineItem.retail_price,
              price: lineItem.price,
              product_name: lineItem.product,
            });
          } else if (procuments.length === 1) {
            newProcumentLineItem[index].quantity = lineItem.quantity;
            newProcumentLineItem[index].ordered_quantity = lineItem.quantity;
          }
        }
      });
      item.procurement_items = newProcumentLineItem;
      newProcuments.push(item);
    });
    return newProcuments;
  },
};

/**
 * Bảng chọn sản phẩm dạng Grid
 */
export function initSchemaLineItem(
  product: ProductResponse,
  mode: "CREATE" | "READ_UPDATE",
  line_items?: Array<PurchaseOrderLineItem>,
): POLineItemGridSchema {
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
  });

  const baseColor: Array<POLineItemColor> = uniqBy(tempVariant, "color").map(
    (variant: VariantResponse) => {
      let price = 0;
      let lineItem: PurchaseOrderLineItem | undefined;

      if (mode === "READ_UPDATE" && line_items && line_items.length > 0) {
        const variantSameColor = tempVariant.filter(
          (variantItem: VariantResponse) => variantItem.color === variant.color,
        );
        // get lineItem has variant_id in variantSameColor id
        lineItem = line_items.find((lineItem: PurchaseOrderLineItem) =>
          variantSameColor.find(
            (variantItem: VariantResponse) => variantItem.id === lineItem.variant_id,
          ),
        );
        if (lineItem) {
          price = lineItem.price;
        }
      }
      if (
        (mode === "CREATE" &&
          variant.variant_prices?.length > 0 &&
          variant.variant_prices[0]?.import_price) ||
        isEmpty(lineItem)
      ) {
        price = variant.variant_prices[0].import_price || 0;
      }

      return {
        color: variant.color,
        color_code: variant.color_code ?? variant.sku,
        lineItemPrice: price, // giá nhập, không có thì mặc định là 0
      };
    },
  );

  /**
   * danh sách tất cả size của sản phẩm, nếu sản phẩm nào không có size thì dùng tên của variant đó làm size
   */
  const baseSize = uniqBy(tempVariant, "size").map((item: VariantResponse) => {
    return item.size;
  });

  /**
   * dánh sách các variant của sản phẩm
   */
  const mappingColorAndSize = product.variants.map((variant: VariantResponse) => {
    const lineItemId = line_items?.find((lineItem) => lineItem.variant_id === variant.id);
    let url: string = "";
    variant.variant_images?.forEach((item1) => {
      if (item1.variant_avatar) {
        url = item1.url;
      }
    });

    const retailPrice = lineItemId
      ? lineItemId.retail_price
      : variant.variant_prices[0].retail_price;
    const cost_price = lineItemId?.cost_price
      ? lineItemId.cost_price
      : variant.variant_prices[0].cost_price;
    return {
      lineItemId: lineItemId?.id,
      color: variant.color ?? variant.sku,
      size: variant.size ?? variant.sku,
      variantId: variant.id,
      sku: variant.sku,
      variant: variant.name,
      product_id: product.id,
      product: product.name,
      variant_image: url,
      planned_quantity: lineItemId?.planned_quantity || 0,
      receipt_quantity: lineItemId?.receipt_quantity || 0,
      barcode: variant.barcode,
      product_type: product.product_type,
      unit: product.unit,
      retailPrice: retailPrice,
      cost_price: cost_price,
    };
  });

  const mappingColorAndSizeResult = mappingColorAndSize.map((item) => {
    const mappingColorAndSizeFilter = mappingColorAndSize.filter((item) => item?.lineItemId);
    return {
      ...item,
      retailPrice:
        mappingColorAndSizeFilter.length > 0
          ? mappingColorAndSizeFilter[0].retailPrice
          : item.retailPrice,
    };
  });

  const variantIdList = product.variants.map((item: VariantResponse) => {
    return item.id;
  });
  return {
    productId: product.id,
    productName: product.name,
    productCode: product.code,
    baseColor,
    baseSize,
    mappingColorAndSize: mappingColorAndSizeResult,
    variantIdList,
    // retail_price: 0,
  };
}

export function initValueLineItem(
  poLineItemGridSchema: POLineItemGridSchema,
  line_items?: Array<PurchaseOrderLineItem>,
): Map<string, POLineItemGridValue> {
  const map = new Map<string, POLineItemGridValue>();
  poLineItemGridSchema.baseColor.forEach((c: POLineItemColor) => {
    const sizeOfColor: POPairSizeColor[] = poLineItemGridSchema.mappingColorAndSize.filter(
      (item) => item.color === c.color,
    );
    const initSizeValue: any = sizeOfColor.reduce(
      (prev: Array<POPairSizeQuantity>, current: POPairSizeColor) => {
        return [
          ...prev,
          {
            variantId: current.variantId,
            size: current.size,
            quantity: line_items?.find((item) => item.variant_id === current.variantId)?.quantity,
          },
        ] as Array<POPairSizeQuantity>;
      },
      [] as Array<POPairSizeQuantity>,
    );

    map.set(c.color, {
      price: c.lineItemPrice || 0,
      sizeValues: initSizeValue,
    });
  });
  return map;
}

export const getTotalPriceOfAllLineItem = (
  poLineItemGridValue: Array<Map<string, POLineItemGridValue>>,
) => {
  let amount: number = 0;
  poLineItemGridValue.forEach((productLine: Map<string, POLineItemGridValue>) => {
    const mapIterator = productLine.values();
    const mapLength = productLine.size;
    for (let i = 0; i < mapLength; i++) {
      const value: POLineItemGridValue = mapIterator.next().value;
      amount += value.price * value.sizeValues.reduce((acc, cur) => acc + (cur.quantity ?? 0), 0);
    }
  });
  return amount;
};

export const combineLineItemToSubmitData = (
  poLineItemGridValue: Array<Map<string, POLineItemGridValue>>,
  poLineItemGridChema: Array<POLineItemGridSchema>,
  taxRate: number,
  line_items?: PurchaseOrderLineItem[],
): any[] => {
  const newDataItems: any[] = [];
  poLineItemGridValue.forEach((item: Map<string, POLineItemGridValue>, index: number) => {
    poLineItemGridChema[index].mappingColorAndSize.forEach((pair: POPairSizeColor) => {
      const value: POLineItemGridValue | undefined = item.get(pair.color);

      if (value) {
        const qty = value.sizeValues.find((item) => item.size === pair.size)?.quantity || 0;
        if (qty > 0) {
          const amount = qty * value.price;
          const indexLineItem = (line_items || [])?.findIndex(
            (line_item) => line_item.variant_id === pair.variantId,
          );
          const retail_price =
            line_items && indexLineItem >= 0
              ? line_items[indexLineItem].retail_price
              : pair.retailPrice;
          const cost_price =
            line_items && indexLineItem >= 0 && line_items[indexLineItem].cost_price
              ? line_items[indexLineItem].cost_price
              : pair.cost_price;
          newDataItems.push({
            id: pair.lineItemId,
            //Dữ liệu cơ bản thì lấy từ schema
            variant_id: pair.variantId,
            variant: pair.variant,
            product_id: pair.product_id,
            sku: pair.sku,
            product: pair.product,
            barcode: pair.barcode,
            variant_image: pair.variant_image,
            retail_price: retail_price,
            cost_price: cost_price,
            receipt_quantity: pair?.receipt_quantity || 0,
            planned_quantity: pair?.planned_quantity || 0,
            // Dữ liệu nhập liệu thì lấy thì value object
            quantity: qty,
            price: value.price,
            purchase_order_id: null,
            tax: (amount * taxRate) / 100,
            tax_rate: taxRate,
            amount: amount, // Tổng tiền
            line_amount_after_line_discount: qty * value.price, // Tổng tiền sau giảm giá, hiện tại chưa có nên để bằng amount
            updated_by: "", // Để "" cho không lỗi máy chủ pận
            updated_name: "", // Để "" cho không lỗi máy chủ pận, phần này BE handle
          });
        }
      }
    });
  });
  return newDataItems;
};

export const validateLineItemQuantity = (lineItems: PurchaseOrderLineItem[]) => {
  if (lineItems?.every((item) => item.quantity === 0)) {
    return false;
  } else {
    return true;
  }
};

export const setProcurementLineItemById = (
  formMain: FormInstance,
  variantIdList: number[],
  inputValue: number,
  quickInputQtyProcurementLineItem: QuickInputQtyProcurementLineItem,
) => {
  const procurements: Array<PurchaseProcurementViewDraft> = formMain.getFieldValue(
    POField.procurements,
  );

  procurements.forEach((procurement: PurchaseProcurementViewDraft, index) => {
    /**
     * Lấy giá trị từ mảng quickInputQtyProcurementLineItem
     * kiểm nếu
     */
    const { unit, value } = quickInputQtyProcurementLineItem[index];
    variantIdList.forEach((variantId: number) => {
      const mappingProcurementItem = procurement.procurement_items.find(
        (item) => item.id === variantId,
      );
      if (mappingProcurementItem) {
        if (unit === QUANTITY_PROCUREMENT_UNIT.PERCENT) {
          mappingProcurementItem.quantity = Math.ceil((inputValue * value) / 100);
        } else {
          mappingProcurementItem.quantity = inputValue;
        }
      }
    });
  });

  //update lại giá trị vừa đc khởi tạo
  formMain.setFieldsValue({
    [POField.procurements]: [...procurements],
  });
};

export const fetchProductGridData = async (
  isGridMode: boolean,
  poData: PurchaseOrder,
  mode: "CREATE" | "READ_UPDATE",
  dispatch: Dispatch<any>,
  setPoLineItemGridSchema: (value: POLineItemGridSchema[]) => void,
  setPoLineItemGridValue: (value: Map<string, POLineItemGridValue>[]) => void,
  setTaxRate: (value: number) => void,
) => {
  if (isGridMode) {
    /**
     *Lấy thông tin sản phẩm để khởi tạo schema & value object (POLineItemGridSchema, POLineItemGridValue)
     */
    const productId = poData.line_items.filter((item) => item.type !== POLineItemType.SUPPLEMENT)[0]
      .product_id; // Vì là chỉ chọn 1 sản phẩm cho grid nên sẽ lấy product_id của sản phẩm đầu tiên
    const product: ProductResponse = await callApiNative(
      { isShowError: true },
      dispatch,
      productDetailApi,
      productId,
    );

    if (product?.variants) {
      const variants = product.variants
        .filter((variant) => variant.status !== "inactive" && variant.type !== 1)
        .sort((pre, next) => ("" + pre.sku).localeCompare(next.sku)); //variant.type === 1 là sản phẩm lỗi
      product.variants = variants;
      /**
       * Tạo schema cho grid (bộ khung để tạo lên grid, dùng để check các ô input có hợp lệ hay không, nếu không thì disable)
       */
      const newpoLineItemGridChema = [];

      /**
       * Lọc line item không phải sản phẩm bổ sung
       */
      const notSupplementLineItems = poData?.line_items?.filter(
        (item) => item.type !== POLineItemType.SUPPLEMENT,
      );
      newpoLineItemGridChema.push(initSchemaLineItem(product, mode, notSupplementLineItems));
      setPoLineItemGridSchema(newpoLineItemGridChema);

      /**
       * Tạo giá trị mặc định cho bảng
       */
      const newpoLineItemGridValue: Map<string, POLineItemGridValue>[] = [];
      newpoLineItemGridChema.forEach((schema) => {
        newpoLineItemGridValue.push(initValueLineItem(schema, notSupplementLineItems));
      });
      setPoLineItemGridValue(newpoLineItemGridValue);

      /**
       * Set giá trị thuế
       * Đối với mode grid thì thuế là chung cho các variant nên chỉ cần set 1 chỗ
       */
      setTaxRate(poData.line_items[0].tax_rate);
    }
  }
};

export const getUntaxedAmountByLineItemType = (
  lineItem: PurchaseOrderLineItem[],
  type: POLoadType,
) => {
  return Math.round(
    lineItem.reduce((prev: number, cur: PurchaseOrderLineItem) => {
      const amount = prev + cur.quantity * cur.price;

      if (type === POLoadType.SUPPLEMENT && cur.type === POLineItemType.SUPPLEMENT) {
        return amount;
      } else if (type === POLoadType.NOT_SUPPLEMENT && cur.type !== POLineItemType.SUPPLEMENT) {
        return amount;
      } else if (type === POLoadType.ALL) {
        return amount;
      } else {
        return prev;
      }
    }, 0),
  );
};

export const getTotalAmountByLineItemType = (
  lineItem: PurchaseOrderLineItem[],
  type: POLoadType,
) => {
  return Math.round(
    lineItem.reduce((prev: number, cur: PurchaseOrderLineItem) => {
      const curAmount = cur.quantity * cur.price;
      const amount = prev + (curAmount + curAmount * (cur.tax_rate / 100));

      if (type === POLoadType.SUPPLEMENT && cur.type === POLineItemType.SUPPLEMENT) {
        return amount;
      } else if (type === POLoadType.NOT_SUPPLEMENT && cur.type !== POLineItemType.SUPPLEMENT) {
        return amount;
      } else if (type === POLoadType.ALL) {
        return amount;
      } else {
        return prev;
      }
    }, 0),
  );
};

export const summaryContentByLineItemType = (
  form: FormInstance,
  poLineItemType?: POLineItemType,
) => {
  const status = form.getFieldValue(POField.status);
  const lineItems: PurchaseOrderLineItem[] = form.getFieldValue(POField.line_items);
  const hasSupplement = lineItems.some((item) => item.type === POLineItemType.SUPPLEMENT);
  if (
    hasSupplement &&
    [POStatus.FINALIZED, POStatus.STORED].includes(status) &&
    poLineItemType !== POLineItemType.SUPPLEMENT
  ) {
    return "Thành tiền (1)";
  } else {
    return "Tiền cần trả";
  }
};

export const checkCanEditDraft = (form: FormInstance, isEdit: boolean) => {
  const stt = form.getFieldValue(POField.status);
  return isEdit && (!stt || stt === POStatus.DRAFT || stt === POStatus.WAITING_APPROVAL);
};

export const checkCanEditPrice = (form: FormInstance, isEdit: boolean, canUpdatePrice: boolean) => {
  const stt = form.getFieldValue(POField.status);
  return isEdit && stt === POStatus.FINALIZED && canUpdatePrice;
};

export const isExpandsSupplement = (form: FormInstance, isEdit: boolean) => {
  const lineItems: PurchaseOrderLineItem[] = form.getFieldValue(POField.line_items);
  return isEdit || lineItems.some((item) => item.type === POLineItemType.SUPPLEMENT);
};

export const isShowSupplement = (form: FormInstance) => {
  const stt = form.getFieldValue(POField.status);
  return [POStatus.FINALIZED, POStatus.STORED, POStatus.FINISHED, POStatus.COMPLETED].includes(stt);
};

export const checkImportPriceLowByLineItem = (
  minPrice: number,
  lineItems: PurchaseOrderLineItem[],
) => {
  return lineItems?.some((item) => item.price <= minPrice);
};

export const checkChangePriceLineItem = (
  originLineItems: Array<PurchaseOrderLineItem>,
  newLineItems: Array<PurchaseOrderLineItem>,
) => {
  let isChangePrice = false;
  if (originLineItems.length === newLineItems.length) {
    originLineItems.forEach((item: PurchaseOrderLineItem) => {
      if (
        newLineItems.find(
          (el: PurchaseOrderLineItem) =>
            el.sku.toUpperCase().trim() === item.sku.toUpperCase().trim() &&
            el.price !== item.price,
        )
      ) {
        isChangePrice = true;
      }
    });
  }
  return isChangePrice;
};

export const MIN_IMPORT_PRICE_WARNING = 1000;
export const convertLineItemsToProcurementItems = (
  lineItems: Array<PurchaseOrderLineItem>,
  procurements: Array<PurchaseProcument>,
) => {
  const procurementItems: Array<PurchaseProcumentLineItem> = [];
  const newProcurement: Array<PurchaseProcument> = [];
  procurements.forEach((procurement: PurchaseProcument) => {
    lineItems.forEach((lineItem: PurchaseOrderLineItem) => {
      procurementItems.push({
        barcode: lineItem.barcode,
        line_item_id: lineItem.position ?? 0,
        // code: lineItem.code,
        sku: lineItem.sku,
        variant: lineItem.variant,
        variant_image: lineItem.variant_image,
        ordered_quantity: lineItem.quantity ?? 0,
        planned_quantity: lineItem.planned_quantity ?? 0,
        accepted_quantity: lineItem.receipt_quantity ?? 0,
        quantity: lineItem.quantity ?? 0,
        real_quantity: 0,
        note: "",
        variant_id: lineItem.variant_id,
        retail_price: lineItem.retail_price,
        price: lineItem.price,
        product_name: lineItem.product,
      });
    });
    procurement.procurement_items = procurementItems;
    newProcurement.push(procurement);
  });
  return newProcurement;
};
export { POUtils };
