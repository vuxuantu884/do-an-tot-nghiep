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
    isExportBill: false,
  }
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
    
    default:
      return state;
  }
};

export default orderReducer;
