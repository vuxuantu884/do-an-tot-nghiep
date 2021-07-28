import { SETTING_TYPES } from "domain/types/settings.type";
import { AnyAction } from "redux";

const initialState = {
  fulfillment: {
    data: [],
  },
  orderSources: {
    data: [],
    listCompanies: [],
    total: 0,
  },
};

const settingsReducer = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    // fulfillment
    case SETTING_TYPES.fulfillment.listAll:
      return {
        ...state,
        fulfillment: {
          data: [],
        },
      };
    case SETTING_TYPES.fulfillment.listAllSuccessful:
      return {
        ...state,
        fulfillment: {
          data: action.payload.data,
        },
      };
    case SETTING_TYPES.fulfillment.listAllFailed:
      return {
        ...state,
        fulfillment: {
          data: [],
        },
      };

    // order resource
    case SETTING_TYPES.orderSources.listData:
      return {
        ...state,
        orderSources: {
          ...initialState.orderSources,
          data: [],
          total: 0,
        }
      };
    case SETTING_TYPES.orderSources.listDataSuccessful:
      console.log('action', action)
      return {
        ...state,
        orderSources: {
          ...state.orderSources,
          data: action.payload.listOrderSources,
          total: action.payload.total,
        }
      };
    case SETTING_TYPES.orderSources.listDataFailed:
      return {
        ...state,
        orderSources: {
          ...state.orderSources,
          data: [],
          total: 0,
        }
      };

      case SETTING_TYPES.orderSources.listSourceCompany:
        return {
          ...state,
          orderSources: {
            ...state.orderSources,
            listCompanies: [],
          }
        };
      case SETTING_TYPES.orderSources.listSourceCompanySuccessful:
        console.log('action', action)
        return {
          ...state,
          orderSources: {
            ...state.orderSources,
            listCompanies: action.payload.listOrderSourceCompanies,
          }
        };
      case SETTING_TYPES.orderSources.listSourceCompanyFailed:
        return {
          ...state,
          orderSources: {
            ...state.orderSources,
            listCompanies: [],
          }
        };
    default:
      return state;
  }
};

export default settingsReducer;
