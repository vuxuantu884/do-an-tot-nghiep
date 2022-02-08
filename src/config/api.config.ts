import { AppConfig } from "./app.config";

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
  IMPORT_EXPORT: `${v1}/${AppConfig.IMPORT_EXPORT_SERVICE}`,
  INVENTORY: `${v1}/${AppConfig.INVENTORY_SERVICE}`,
  INVENTORY_TRANSFER: `${v1}/${AppConfig.INVENTORY_TRANSFER_SERVICE}`,
  LOYALTY: `${v1}/${AppConfig.LOYALTY_SERVICE}`,
  ECOMMERCE: `${v1}/${AppConfig.ECOMMERCE_SERVICE}`,
  LOGISTIC_GATEWAY: `${v1}/${AppConfig.LOGISTIC_GATEWAY_SERVICE}`,
  INVENTORY_ADJUSTMENT: `${v1}/${AppConfig.INVENTORY_ADJUSTMENT_SERVICE}`,
  PROMOTION: `${v1}/${AppConfig.PROMOTION_SERVICE}`,
  DASHBOARD: `${v1}/${AppConfig.DASHBOARD_SERVICE}`,
};

export { ApiConfig };
