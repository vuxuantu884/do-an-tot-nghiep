import BaseAction from "base/base.action";
import {WebAppType} from "domain/types/web-app.type";
import {WebAppResponse} from "model/response/web-app/ecommerce.response";
import {
  WebAppProductQuery,
  WebAppGetOrdersMappingQuery,
  WebAppRequestSyncStockQuery,
  WebAppDownloadOrderQuery,
  WebAppConfigRequest,
  WebAppCreateShopifyRequest,
} from "model/query/web-app.query";
import {PageResponse} from "model/base/base-metadata.response";
import {EcommerceStoreAddress} from "model/ecommerce/ecommerce.model";
import { SourceResponse } from "model/response/order/source.response";

//create shopify
export const webAppGetInfoShopify = (
  api_key: string,
  api_secret: string,
  setData: (data: WebAppResponse) => void
) => {
  const request = {
    api_key: api_key,
    api_secret: api_secret,
    access_token: "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"
  }
  return BaseAction(WebAppType.WEB_APP_GET_INFO_SHOPIFY,{
    request,
    setData
  })
}
export const webAppCreateShopify = (
  request: WebAppCreateShopifyRequest,
  setData: (data: WebAppResponse) => void
) => {
  return BaseAction(WebAppType.WEB_APP_CRATE_SHOPIFY,{
    request,
    setData
  })
}

// config
export const webAppConfigCreateAction = (
  request: WebAppConfigRequest,
  setData: (data: WebAppResponse) => void
) => {
  return BaseAction(WebAppType.WEB_APP_CREATE_CONFIG_REQUEST, {
    request,
    setData,
  });
};

export const webAppUpdateConfigAction = (
  id: number,
  request: WebAppConfigRequest,
  setData: (data: WebAppResponse) => void
) => {
  return BaseAction(WebAppType.WEB_APP_UPDATE_CONFIG_REQUEST, {
    id,
    request,
    setData,
  });
};

export const webAppConfigDeleteAction = (
  id: number,
  setData: (result: boolean) => void
) => {
  return BaseAction(WebAppType.WEB_APP_DELETE_CONFIG_REQUEST, {
    id,
    setData,
  });
};
// connect to web app

export const webAppConnectAction = (
  ecommerceId: number,
  setData: (result: any) => void
) => {
  return BaseAction(WebAppType.WEB_APP_CONNECT_CONFIG_REQUEST, {
    ecommerceId,
    setData,
  });
};

export const webAppConfigInfoAction = (
  params: any,
  setData: (result: WebAppResponse) => void
) => {
  return BaseAction(WebAppType.WEB_APP_GET_CONFIG_INFO_REQUEST, {
    params,
    setData,
  });
};

export const getWebAppProductAction = (
  query: WebAppProductQuery,
  setData: (data: any) => void
) => {
  return BaseAction(WebAppType.WEB_APP_GET_VARIANTS_REQUEST, {query, setData});
};

export const getWebAppShopList = (query: any, setData: (data: any) => void) => {
  return BaseAction(WebAppType.WEB_APP_GET_SHOP_REQUEST, {query, setData});
};

export const downloadWebAppProductAction = (
  query: WebAppDownloadOrderQuery,
  setData: (data: any) => void
) => {
  return BaseAction(WebAppType.WEB_APP_DOWNLOAD_PRODUCT_REQUEST, {query, setData});
};

export const deleteWebAppProductAction = (ids: any, setData: (data: any) => void) => {
  return BaseAction(WebAppType.WEB_APP_DELETE_PRODUCT_REQUEST, {ids, setData});
};

export const disconnectWebAppProductAction = (ids: any, setData: (data: any) => void) => {
  return BaseAction(WebAppType.WEB_APP_DISCONNECT_PRODUCT_REQUEST, {ids, setData});
};

export const syncWebAppStockProductAction = (
  query: WebAppRequestSyncStockQuery,
  setData: (data: any) => void
) => {
  return BaseAction(WebAppType.WEB_APP_SYNC_STOCK_PRODUCT_REQUEST, {
    query,
    setData,
  });
};

export const syncWebAppOrderAction = (
  query: any,
  setData: (data: any) => void
) => {
  return BaseAction(WebAppType.WEB_APP_SYNC_ORDER_REQUEST, {
    query,
    setData,
  });
};


export const putConnectWebAppProductAction = (query: any, setData: (data: any) => void) => {
  return BaseAction(WebAppType.WEB_APP_PUT_CONNECT_PRODUCT_REQUEST, {query, setData});
};

//web app order actions
export const downloadWebAppOrderAction = (
  query: WebAppDownloadOrderQuery,
  setData: (data: any) => void
) => {
  return BaseAction(WebAppType.WEB_APP_DOWNLOAD_ORDER_REQUEST, {query, setData});
};

//get orders mapping list
export const getOrderMappingListAction = (
  query: WebAppGetOrdersMappingQuery,
  setData: (data: PageResponse<any> | false) => void
) => {
  return BaseAction(WebAppType.WEB_APP_GET_ORDER_SYNC_LIST_REQUEST, {
    query,
    setData,
  });
};

export const getEcommerceStoreAddress = (
    query: any,
    callback: (data: Array<EcommerceStoreAddress>) => void
) => {
  return BaseAction(WebAppType.WEB_APP_GET_STORE_ADDRESS, {
    query,
    callback
  });
};

export const createEcommerceLogistic = (
    request: any,
    callback: (data: any) => void
) => {
  return BaseAction(WebAppType.WEB_APP_CREATE_LOGISTIC, {
    request,
    callback
  });
};

export const webAppConcatenateByExcelAction = (formData: FormData, callback: (data: any) => void) => {
  return BaseAction(WebAppType.WEB_APP_CONCANATE_BY_EXCEL, {formData,  callback});
}

export const downloadWebAppPrintForm = (
    request: any,
    callback: (data: any) => void
) => {
  return BaseAction(WebAppType.WEB_APP_DOWNLOAD_PRINT_FORM, {
    request,
    callback
  });
};

// exit web app process Action
export const exitWebAppJobsAction = (
  processId: number | null,
  callback: (response: PageResponse<any> | false) => void
) => {
  const query = {
    processId: processId
  }
  return BaseAction(WebAppType.WEB_APP_EXIT_JOBS, {
    query,
    callback
  });
};

//get source
export const getSourceListAction = (setData: (data: Array<SourceResponse>) => void) => {
  return BaseAction(WebAppType.WEB_APP_GET_LIST_SOURCE_REQUEST, {setData});
}
