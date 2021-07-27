import { AppType } from 'domain/types/app.type';
import { SETTING_TYPES } from 'domain/types/settings.type';
import { AnyAction } from 'redux';
import { setAppSetting } from 'utils/LocalStorageUtils';

const initialState = {
  fulfillment: {
    list: [],
  }
}

const settingsReducer = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case SETTING_TYPES.fulfillment.listAll:
      return {
        ...initialState,
        fulfillment: {
          list: []
        }
      }
      case SETTING_TYPES.fulfillment.listAllSuccessful:
      return {
        ...initialState,
        fulfillment: {
          list: action.payload
        }
      }
    default:
      return state;
  }
}

export default settingsReducer;