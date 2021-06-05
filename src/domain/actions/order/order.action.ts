import { OrderRequest } from 'model/request/order.request';
import { VariantModel } from '../../../model/other/Product/product-model';
import { OrderType } from '../../types/order.type';
import BaseAction from 'base/BaseAction';
import { OrderItemModel, OrderPaymentModel } from 'model/other/Order/order-model';

const createTab = (storeId: number, companyId: number,currency: string,account: string, account_code: string, source_id: number, source: string ) => {
  return BaseAction(OrderType.CREATE_TAB_REQUEST,
    {
      storeId: storeId,
      companyId: companyId,
      currency: currency,
      account: account,
      account_code: account_code,
      source_id: source_id,
      source: source
    });
};

const deleteTab = (index: number) => {
  return BaseAction(OrderType.DELETE_TAB_REQUEST, { index });
};

const selectTab = (index: number) => {
  return BaseAction(OrderType.SELECT_TAB, { index });
};

const nextPage = () => {
  return BaseAction(OrderType.NEXT_PAGE, null);
};

const previousPage = () => {
  return BaseAction(OrderType.PREVIOUS_PAGE, null);
};

const addOrderRequest = (variant: VariantModel, splitLine: boolean) => {
  return BaseAction(OrderType.ADD_ORDER_REQUEST, { variant: variant, splitLine: splitLine })
}

const orderQuantityTextChange = (indexItem: number, value: number) => {
  return BaseAction(OrderType.ORDER_QUANTITY_TEXT_CHANGE, { indexItem: indexItem, value: value })
}

const orderPriceTextChange = (indexItem: number, value: number) => {
  return BaseAction(OrderType.ORDER_PRICE_TEXT_CHANGE, { indexItem: indexItem, value: value })
}

const orderDeleteLineItem = (indexItem: number) => {
  return BaseAction(OrderType.ORDER_DELETE_ITEM, { indexItem: indexItem })
}

const orderDiscountTextChange = (indexItem: number, value: number, type: string) => {
  return BaseAction(OrderType.ORDER_DISCOUNT_TEXT_CHANGE, { indexItem: indexItem, value: value, type: type })
}

const showNoteAction = (indexItem: number) => {
  return BaseAction(OrderType.SHOW_NOTE, { indexItem: indexItem })
}

const hideNoteAction = (indexItem: number) => {
  return BaseAction(OrderType.HIDE_NOTE, { indexItem: indexItem })
}

const onOrderItemNoteChange = (indexItem: number, value: string) => {
  return BaseAction(OrderType.NOTE_CHANGE, { indexItem: indexItem, value: value })
}

const addDiscountOrder = (coupon: '', type: string, value: number, onOk: () => void) => {
  return BaseAction(OrderType.VALIDATE_DISCOUNT_CHANGE, { coupon: coupon, type: type, value: value, onOk: onOk })
}

const addDiscountSuccess = (coupon: '', type: string, value: number) => {
  return BaseAction(OrderType.VALIDATE_DISCOUNT_SUCCESS, { coupon: coupon, type: type, value: value })
}

const addFreeFormItem = (value: OrderItemModel) => {
  return BaseAction(OrderType.ADD_FREE_FORM, { value: value })
}

const changeNameFreeFormItem = (indexItem: number, value: string) => {
  return BaseAction(OrderType.ORDER_FREE_FORM_NAME_CHANGE_PRODUCT_TYPE_SERVICE, { indexItem: indexItem, value: value })
}

const changeQuantityFreeFormItem = (indexItem: number, value: number) => {
  return BaseAction(OrderType.ORDER_FREE_FORM_QUANTITY_TEXT_CHANGE_PRODUCT_TYPE_SERVICE, { indexItem: indexItem, value: value })
}

const changePriceFreeFormItem = (indexItem: number, value: number) => {
  return BaseAction(OrderType.ORDER_FREE_FORM_PRICE_TEXT_CHANGE_PRODUCT_TYPE_SERVICE, { indexItem: indexItem, value: value })
}

const orderDeleteFreeFormItem = (indexItem: number) => {
  return BaseAction(OrderType.ORDER_DELETE_FREE_FORM_ITEM, { indexItem: indexItem })
}

const orderGiftChange = (indexItem: number, gift: Array<OrderItemModel>) => {
  return BaseAction(OrderType.ORDER_GIFT_CHANGE, { indexItem: indexItem, gift: gift })
}

const finishActionRequest = () => {
  return BaseAction(OrderType.FINISH_ACTION_REQUEST, null)
}

const finishActionResponse = () => {
  return BaseAction(OrderType.FINISH_ACTION_RESPONSE, null)
}

const savePayment = (payments: Array<OrderPaymentModel>) => {
  return BaseAction(OrderType.SAVE_PAYMENT, {payments})
}

const changePointInPayment = (indexPayment: number, point: number) => {
  return BaseAction(OrderType.CHANGE_POINT_IN_PAYMENT, { indexPayment, point })
}

const changeSaleMan = (code: string, name: string) => {
  return BaseAction(OrderType.CHANGE_SALE, {code: code, name: name})
}

const changeCashier = (code: string, name: string) => {
  return BaseAction(OrderType.CHANGE_CASHIER, {code: code, name: name})
}


const onOrderNoteChange = (value: string) => {
  return BaseAction(OrderType.ORDER_NOTE_CHANGE, { value })
}

const onPaymentMoneyChange = (value: number) => {
  return BaseAction(OrderType.PAYMENT_MONEY_CHANGE, { value })
}

const orderCreateAction = (request: OrderRequest, setData: () => void) => {
  return BaseAction(OrderType.CREATE_ORDER_REQUEST, {request, setData});
}


export {
  createTab, deleteTab, selectTab, nextPage, previousPage, addOrderRequest, orderQuantityTextChange,
  orderDeleteLineItem, orderPriceTextChange, orderDiscountTextChange, showNoteAction, hideNoteAction, onOrderItemNoteChange,
  addFreeFormItem, changeNameFreeFormItem, changeQuantityFreeFormItem, changePriceFreeFormItem, orderDeleteFreeFormItem,
  addDiscountOrder, addDiscountSuccess, orderGiftChange, savePayment, changePointInPayment, finishActionRequest, finishActionResponse,
  onOrderNoteChange, changeSaleMan, changeCashier, onPaymentMoneyChange, orderCreateAction
};

