import { SETTING_TYPES } from "domain/types/settings.type";
import BaseAction from "base/base.action";
import { SmsConfigRequest } from "model/request/settings/sms-settings.resquest";
import { smsPromotionVoucher } from "model/sms-config/smsConfig.model";

export const getSmsConfigAction = (handleData: (data: any) => void) => {
  return BaseAction(SETTING_TYPES.smsSettingsType.GET_SMS_CONFIG, {
    handleData,
  });
};

export const updateSmsConfigAction = (
  request: SmsConfigRequest,
  handleData: (data: any) => void,
) => {
  return BaseAction(SETTING_TYPES.smsSettingsType.UPDATE_SMS_CONFIG, {
    request,
    handleData,
  });
};

export const configSmsMessageAction = (request: any, handleData: (data: any) => void) => {
  return BaseAction(SETTING_TYPES.smsSettingsType.CONFIG_SMS_MESSAGE, {
    request,
    handleData,
  });
};

export const createSmsPromotionVoucherAction = (
  params: smsPromotionVoucher,
  callback: (data: any) => void
) => {
  return BaseAction(SETTING_TYPES.smsSettingsType.CREATE_SMS_PROMOTION_VOUCHER, {
    params,
    callback,
  });
};

export const updateSmsPromotionVoucherAction = (
  id: number,
  params: smsPromotionVoucher,
  callback: (data: any) => void
) => {
  return BaseAction(SETTING_TYPES.smsSettingsType.UPDATE_SMS_PROMOTION_VOUCHER, {
    id,
    params,
    callback,
  });
};
