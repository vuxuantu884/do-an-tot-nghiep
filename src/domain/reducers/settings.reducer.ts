import { SETTING_TYPES } from "domain/types/settings.type";
import { AnyAction } from "redux";

const initialState = {
  fulfillment: {
    list: [],
  },
  orderSources: {
    list: [],
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
        },
      };
    case SETTING_TYPES.orderSources.listAllSuccessful:
      return {
        ...initialState,
        orderSources: {
          list: action.payload.data,
        },
      };
    case SETTING_TYPES.orderSources.listAllFailed:
      return {
        ...initialState,
        orderSources: {
          list: [],
        },
      };
    default:
      return state;
  }
};

export default settingsReducer;
