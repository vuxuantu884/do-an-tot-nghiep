import { AppConfig } from "./AppConfig";

const v1 = ``;

const ApiConfig = {
  CONTENT: `${v1}/${AppConfig.CONTENT_SERVICE}`,
  PRODUCT: `${v1}/${AppConfig.PRODUCT_SERVICE}`,
  CORE: `${v1}/${AppConfig.CORE_SERVICE}`,
  ACCOUNTS: `${v1}/${AppConfig.ACCOUNT_SERVICE}`,
  ORDER: `${v1}/${AppConfig.ORDER_SERVICE}`,
  CUSTOMER: `${v1}/${AppConfig.CUSTOMER_SERVICE}`,
  AUTH: `${v1}/${AppConfig.AUTH_SERVICE}`,
  PURCHASE_ORDER: `${v1}/${AppConfig.PURCHASE_ORDER_SERVICE}`,
}

export { ApiConfig };
