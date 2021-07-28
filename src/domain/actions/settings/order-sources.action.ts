import { SETTING_TYPES } from "domain/types/settings.type";

export const actionFetchListOrderSources = (params = {}) => {
  return {
    type: SETTING_TYPES.orderSources.listData,
    payload: {
      params,
    },
  };
}

export const actionFetchListOrderSourcesSuccessful = (listOrderSources: any, total: number) => {
  return {
    type: SETTING_TYPES.orderSources.listDataSuccessful,
    payload: {
      listOrderSources,
      total
    },
  };
};

export const actionFetchListOrderSourcesFailed = (error:any) => {
  return {
    type: SETTING_TYPES.orderSources.listDataFailed,
    payload: {
      error,
    },
  };
};

export const actionFetchListOrderSourceCompanies = (params = {}) => {
  return {
    type: SETTING_TYPES.orderSources.listSourceCompany,
    payload: {
      params,
    },
  };
}

export const actionFetchListOrderSourceCompaniesSuccessful = (listOrderSourceCompanies: any) => {
  return {
    type: SETTING_TYPES.orderSources.listSourceCompanySuccessful,
    payload: {
      listOrderSourceCompanies,
    },
  };
};

export const actionFetchListOrderSourceCompaniesFailed = (error:any) => {
  return {
    type: SETTING_TYPES.orderSources.listSourceCompanyFailed,
    payload: {
      error,
    },
  };
};