import AppSettingType  from 'domain/types/appsetting.type';
import { YodyAction } from '../../base/BaseAction';
import OtherType from 'domain/types/other.type';

const intitalState = {
  isLoad: false,
  data: {
    splitLine: false,
    store: null,
    company: null
  }
};

const appSettingReducer = (state = intitalState, action: YodyAction) => {
  const {type, payload} = action;
  switch (type) {
    case AppSettingType.SPLIT_LINE_CHANGE:
      return {...state, data: {...state.data, splitLine: payload.value}};
    case AppSettingType.STORE_CHANGE:
      return {...state, data: {...state.data, store: payload.value}};
    case AppSettingType.COMPANY_UPDATE:
      return {...state, data: {...state.data, company: payload.value}}
    case OtherType.LOADING_FROM_LOCAL_STORAGE_SUCCESS:
      return {isLoad: true, data: {...state.data, ...payload}};
    default:
      return state;
  }
}

export default appSettingReducer;