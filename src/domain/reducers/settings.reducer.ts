import { SETTING_TYPES } from "domain/types/settings.type";
import { AnyAction } from "redux";

const initialState = {
  fulfillment: {
    list: [],
  },
  orderSources: {
    list: [],
    total: 0,
  },
};

const settingsReducer = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    // fulfillment
    case SETTING_TYPES.fulfillment.listAll:
      return {
        ...initialState,
        fulfillment: {
          list: [],
        },
      };
    case SETTING_TYPES.fulfillment.listAllSuccessful:
      return {
        ...initialState,
        fulfillment: {
          list: action.payload.data,
        },
      };
    case SETTING_TYPES.fulfillment.listAllFailed:
      return {
        ...initialState,
        fulfillment: {
          list: [],
        },
      };

    // order resource
    case SETTING_TYPES.orderSources.listAll:
      return {
        ...initialState,
        orderSources: {
          list: [],
          total: 0,
        },
      };
    case SETTING_TYPES.orderSources.listAllSuccessful:
      const {total} = action.payload
      const list = action.payload.listOrderSources
      return {
        ...initialState,
        orderSources: {
          list,
          total
        },
      };
    case SETTING_TYPES.orderSources.listAllFailed:
      return {
        ...initialState,
        orderSources: {
          list: [],
          total: 0,
        },
      };
    default:
      return state;
  }
};

export default settingsReducer;
