import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import BaseAxios from "base/base.axios";
import { SmsConfigRequest } from "model/request/settings/sms-settings.resquest";
import { smsPromotionVoucher } from "model/sms-config/smsConfig.model";

//get sms config
export const getSmsConfigApi = (): Promise<BaseResponse<any>> => {
  const requestUrl = `${ApiConfig.LOYALTY}/sms-config`;
  return BaseAxios.get(requestUrl);
};

//update sms config
export const updateSmsConfigApi = (request: SmsConfigRequest): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.LOYALTY}/sms-config`;
  return BaseAxios.post(url, request);
};

export const configSmsMessageApi = (request: any): Promise<BaseResponse<any>> => {
  let url = `${ApiConfig.LOYALTY}/sms-config/other-config`;
  return BaseAxios.post(url, request);
};

export const createSmsPromotionVoucherApi = (params: smsPromotionVoucher): Promise<BaseResponse<any>> => {
  const url = `${ApiConfig.LOYALTY}/sms-config/sms-messages/vouchers`;
  return BaseAxios.post(url, params);
};

export const updateSmsPromotionVoucherApi = (id: number, params: smsPromotionVoucher): Promise<BaseResponse<any>> => {
  const url = `${ApiConfig.LOYALTY}/sms-config/sms-messages/vouchers/${id}`;
  return BaseAxios.put(url, params);
};
