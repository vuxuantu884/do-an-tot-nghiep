import { AppConfig } from "config/app.config";
import { Type } from "config/type.config";
import { VariantResponse } from "model/product/product.model";
import { CostLine } from "model/purchase-order/cost-line.model";
import {
  PurchaseOrderLineItem,
  Vat,
} from "model/purchase-order/purchase-item.model";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import {
  PurchaseProcumentLineItem,
  PurchaseProcument,
} from "model/purchase-order/purchase-procument";
import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import { Products } from "./AppUtils";
import {
  POStatus,
  ProcumentStatus,
  PoFinancialStatus,
  PoPaymentStatus,
} from "utils/Constants";

const POUtils = {
  calculatePOStatus: (
    poData: PurchaseOrder,
    newProcument: PurchaseProcument | null,
    newPayment: PurchasePayments | null,
    action: "update" | "delete"
  ) => {
    //new procument --> draft --> return trạng thái poData

    /**
     * trang thai PO = trang thai nhap kho + trang thai thanh toan
     * 0: dat hang, 1: xac nhan, 2: phieu nhap, 3: nhap kho, 4: hoan thanh
     */

    let {
      receive_status,
      financial_status,
      receipt_quantity,
      planned_quantity,
      status: poStatus,
      procurements,
      total_payment,
      payments,
    } = poData;
    if (
      poStatus === POStatus.FINISHED ||
      poStatus === POStatus.COMPLETED ||
      poStatus === POStatus.CANCELLED
    )
      return poStatus;
    if (
      receive_status === ProcumentStatus.FINISHED ||
      receive_status === ProcumentStatus.RECEIVED
    ) {
      if (financial_status === PoFinancialStatus.PAID) {
        if (receipt_quantity >= planned_quantity) return POStatus.COMPLETED;
        else return POStatus.FINISHED;
      }
    }

    let cloneProcuments = JSON.parse(JSON.stringify(procurements));
    //truong hop update procument
    /**
     * SL thuc nhan > SL da len KH: PO trang thai nhap kho
     * SL đặt hàng >= SL đã lên KH: PO trang thai phiếu nháp
     * SL đặt hàng < SL đã lên KH: PO trang thai xác nhận
     */
    if (newProcument) {
      let procumentIndex = cloneProcuments.findIndex(
        (item: PurchaseProcument) => item.id === newProcument.id
      );

      if (procumentIndex === -1) {
        cloneProcuments = [...cloneProcuments, newProcument];
      } else {
        if (action === "update") {
          cloneProcuments[procumentIndex] = newProcument;
        } else cloneProcuments.splice(procumentIndex, 1);
      }
      let totalReceived = 0;
      cloneProcuments.forEach((procumentItem: PurchaseProcument) => {
        totalReceived += POUtils.totalRealQuantityProcument(
          procumentItem.procurement_items
        );
      });
      if (totalReceived >= planned_quantity) return POStatus.STORED;
      let totalOrdered = 0;
      cloneProcuments.forEach((procurementItem: PurchaseProcument) => {
        totalOrdered += POUtils.totalQuantityProcument(
          procurementItem.procurement_items
        );
      });

      if (planned_quantity && totalOrdered >= planned_quantity)
        return POStatus.FINALIZED;
    }

    //truong hop update payment
    /**
     * nếu là paid | refund ---> tính lại total paid
     * so sánh total paid --->
     */

    let clonePayments = JSON.parse(JSON.stringify(payments)),
      total_paid = 0;
    if (newPayment) {
      let paymentIndex = clonePayments.findIndex(
        (item: PurchaseProcument) => item.id === newPayment.id
      );

      if (paymentIndex === -1) {
        clonePayments = [...clonePayments, newPayment];
      } else {
        if (action === "update") {
          clonePayments[paymentIndex] = newPayment;
        } else clonePayments.splice(paymentIndex, 1);
      }
      console.log('payments', payments);
      clonePayments.forEach((payment: PurchasePayments) => {
        if (
          payment.status === PoPaymentStatus.PAID ||
          payment.status === PoPaymentStatus.REFUND
        ) {
          if (payment.amount) {
            total_paid += payment.amount;
          }
        }
      });
      console.log('total_paid', total_paid);
      console.log('total_payment', total_payment);
      console.log('receipt_quantity', receipt_quantity);
      console.log('planned_quantity', planned_quantity);
      if (total_paid >= total_payment) {
        if (
          receive_status === ProcumentStatus.FINISHED ||
          receive_status === ProcumentStatus.RECEIVED
        ) {
          if (receipt_quantity >= planned_quantity) return POStatus.COMPLETED;
          else return POStatus.FINISHED;
        }
      }
    }

    return poStatus;
  },
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
    return {
      ...data,
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
    let newProcument = procuments.map((item) => {
      let newProcumentLineItem = [...item.procurement_items];
      item.procurement_items.forEach((procumentItem) => {
        let index = data.findIndex(
          (lineItem) => lineItem.sku === procumentItem.sku
        );
        if (index === -1) {
          newProcumentLineItem.splice(index, 1);
        }
      });
      data.forEach((lineItem) => {
        let index = newProcumentLineItem.findIndex(
          (procumentItem) => lineItem.sku === procumentItem.sku
        );
        if (index === -1) {
          newProcumentLineItem.push({
            line_item_id: lineItem.position,
            code: lineItem.code,
            sku: lineItem.sku,
            variant: lineItem.variant,
            variant_image: lineItem.variant_image,
            ordered_quantity: lineItem.quantity,
            planned_quantity: lineItem.planned_quantity,
            accepted_quantity: lineItem.receipt_quantity,
            quantity: procuments.length === 1 ? lineItem.quantity: 0,
            real_quantity: 0,
            note: "",
          });
        }else {
          if(procuments.length === 1) {
            newProcumentLineItem[index].quantity = lineItem.quantity;
            newProcumentLineItem[index].ordered_quantity = lineItem.quantity;
          }
        }
      });
      item.procurement_items = newProcumentLineItem;
      return item;
    });
    return newProcument;
  },
};

export { POUtils };
