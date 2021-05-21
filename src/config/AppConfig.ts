export const AppConfig = {
  baseUrl: process.env.REACT_APP_BASE_URL,
  timeOut: process.env.REACT_APP_TIME_OUT ? parseInt(process.env.REACT_APP_TIME_OUT) : 10000 ,
  production: process.env.REACT_APP_PRODUCTION,
  currency: 'VNĐ',
  price_type: 'retail_price',
  channel_id: 1,
};
