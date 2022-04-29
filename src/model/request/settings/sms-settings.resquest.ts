export interface SmsConfigRequest {
	ads_price: number;
	api_key: string;
	brand_name: string;
	care_price: number;
	esms_host: string;
	is_unicode: boolean;
	secret_key: string;
	status: string;
	updated_date?: any,
	updated_by?: string;
	id?: number;
	remain_day_to_birthday?: number;
}
