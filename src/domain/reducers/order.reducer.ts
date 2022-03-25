import { YodyAction } from "base/base.action";
import { OrderType } from "domain/types/order.type";


const initialState = {
  orderStore: {
    storeDetail: null,
    storeBankAccountNumbers: [],
    selectedStoreBankAccount: null,
    isShouldSetDefaultStoreBankAccount: false,
  },
  orderDetail: {
    orderCustomer: null,
    orderLineItems: [],
    thirdPL: null,
    isExportBill: false,
  },
  shippingServiceConfig: [],
  isLoadingDiscount: false,
};

const orderReducer = (state = initialState, action: YodyAction) => {
  const { type, payload } = action;
  switch (type) {
    case OrderType.CHANGE_STORE_DETAIL:
      return {
        ...state,
        orderStore: {
          ...state.orderStore,
          storeDetail: payload.storeDetail,
        }
      };
    case OrderType.GET_BANK_ACCOUNT_NUMBERS:
      return {
        ...state,
        orderStore: {
          ...state.orderStore,
          storeBankAccountNumbers: payload.storeBankAccountNumbers,
        }
      };
    case OrderType.CHANGE_SELECTED_STORE_BANK_ACCOUNT:
      return {
        ...state,
        orderStore: {
          ...state.orderStore,
          selectedStoreBankAccount: payload.selectedStoreBankAccount,
        }
      };
    case OrderType.SET_IS_SHOULD_SET_DEFAULT_BANK_ACCOUNT:
    return {
      ...state,
      orderStore: {
        ...state.orderStore,
        isShouldSetDefaultStoreBankAccount: payload.isShouldSetDefaultStoreBankAccount,
      }
    };
    case OrderType.SET_IS_EXPORT_BILL:
      return {
        ...state,
        orderDetail: {
          ...state.orderDetail,
          isExportBill: payload.isExportBill,
        }
      };
    case OrderType.CHANGE_ORDER_CUSTOMER:
      return {
        ...state,
        orderDetail: {
          ...state.orderDetail,
          orderCustomer: payload.orderCustomer
        }
      };

    case OrderType.CHANGE_SHIPPING_SERVICE_CONFIG:
      return {
        ...state,
        shippingServiceConfig: payload.shippingServiceConfig
      };

    case OrderType.CHANGE_ORDER_LINE_ITEMS:
      return {
        ...state,
        orderDetail: {
          ...state.orderDetail,
          orderLineItems: payload.orderLineItems
        }
      };

    case OrderType.CHANGE_ORDER_THIRD_PL:
      return {
        ...state,
        orderDetail: {
          ...state.orderDetail,
          thirdPL: payload.thirdPL
        }
      };

    case OrderType.CHANGE_IS_LOADING_DISCOUNT:
      return {
        ...state,
        isLoadingDiscount: payload.isLoadingDiscount,
      };

    default:
      return state;
  }
};

export default orderReducer;
