import BaseResponse from 'base/base.response';
import { ApiConfig } from 'config/api.config';
import BaseAxios from 'base/base.axios';
import {SmsConfigRequest} from "model/request/settings/sms-settings.resquest";


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
