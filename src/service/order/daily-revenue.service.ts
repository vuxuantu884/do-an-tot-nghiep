import BaseAxios, { DailyRevenueBaseAxios } from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  DailyRevenueDetailModel,
  DailyRevenueOtherPaymentParamsModel,
  DailyRevenueOtherPaymentTypeModel,
} from "model/order/daily-revenue.model";
import { ProductUploadModel } from "model/product/product-upload.model";

export const dailyRevenueService = {
  getDetail: (dailyRevenueId: number): Promise<DailyRevenueDetailModel> => {
    return DailyRevenueBaseAxios.get(`${ApiConfig.DAILY_PAYMENT}/${dailyRevenueId}`);
  },

  editStoreNote: (dailyRevenueId: number, storeNote: string): Promise<BaseResponse<any>> => {
    const params = {
      note: storeNote,
    };
    return DailyRevenueBaseAxios.put(
      `${ApiConfig.DAILY_PAYMENT}/${dailyRevenueId}/store-note`,
      params,
    );
  },

  editAccountantNote: (
    dailyRevenueId: number,
    accountantNote: string,
  ): Promise<BaseResponse<any>> => {
    const params = {
      note: accountantNote,
    };
    return DailyRevenueBaseAxios.put(
      `${ApiConfig.DAILY_PAYMENT}/${dailyRevenueId}/accountant-note`,
      params,
    );
  },

  refresh: (dailyRevenueId: number): Promise<DailyRevenueDetailModel> => {
    return DailyRevenueBaseAxios.post(`${ApiConfig.DAILY_PAYMENT}/${dailyRevenueId}/refresh`);
  },

  addOtherPayment: (
    dailyRevenueId: number,
    params: DailyRevenueOtherPaymentParamsModel,
  ): Promise<BaseResponse<any>> => {
    return DailyRevenueBaseAxios.post(
      `${ApiConfig.DAILY_PAYMENT}/${dailyRevenueId}/other-payments`,
      params,
    );
  },

  editOtherPayment: (
    dailyRevenueId: number,
    otherPaymentId: number,
    params: DailyRevenueOtherPaymentParamsModel,
  ): Promise<BaseResponse<any>> => {
    return DailyRevenueBaseAxios.put(
      `${ApiConfig.DAILY_PAYMENT}/${dailyRevenueId}/other-payments/${otherPaymentId}`,
      params,
    );
  },

  deleteOtherPayment: (
    dailyRevenueId: number,
    otherPaymentId: number,
  ): Promise<BaseResponse<any>> => {
    return DailyRevenueBaseAxios.delete(
      `${ApiConfig.DAILY_PAYMENT}/${dailyRevenueId}/other-payments/${otherPaymentId}`,
    );
  },

  submitPayMoney: (dailyRevenueId: number, imageUrl: string): Promise<BaseResponse<any>> => {
    const params = {
      image_url: imageUrl,
    };
    return DailyRevenueBaseAxios.post(
      `${ApiConfig.DAILY_PAYMENT}/${dailyRevenueId}/submit`,
      params,
    );
  },

  confirmPayMoney: (dailyRevenueId: number): Promise<any> => {
    return DailyRevenueBaseAxios.post(`${ApiConfig.DAILY_PAYMENT}/${dailyRevenueId}/confirm`);
  },

  getDailyPaymentType: (): Promise<DailyRevenueOtherPaymentTypeModel> => {
    return DailyRevenueBaseAxios.get(`${ApiConfig.DAILY_PAYMENT}/type`);
  },

  uploadPaymentImages: (
    files: Array<File>,
    folder: string = "variant",
  ): Promise<BaseResponse<Array<ProductUploadModel>>> => {
    let body = new FormData();
    body.append("folder", folder);
    files.forEach((item) => {
      body.append("file_upload", item);
    });
    return BaseAxios.post(`${ApiConfig.PRODUCT}/products/upload`, body, {
      headers: { "content-type": "multipart/form-data" },
    });
  },
};
