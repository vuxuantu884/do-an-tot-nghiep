const ServiceNames = {
  CONTENT_SERVICE: "content-service",
  PRODUCT_SERVICE: "product-service",
  CORE_SERVICE: "core-service",
  ACCOUNT_SERVICE: "account-service",
  ORDER_SERVICE: "order-service",
  CUSTOMER_SERVICE: "customer-service",
  AUTH_SERVICE: "auth-service",
  PURCHASE_ORDER_SERVICE: "purchase-order-service",
  IMPORT_EXPORT_SERVICE: "import-export-service",
  INVENTORY_SERVICE: "inventory-service",
  INVENTORY_TRANSFER_SERVICE: "inventory-transfer-service",
  LOYALTY_SERVICE: "loyalty-service",
  ECOMMERCE_SERVICE: "ecommerce-service",
  WEBSITE_SERVICE: "website-service",
  LOGISTIC_GATEWAY_SERVICE: "logistic-gateway-service",
  INVENTORY_ADJUSTMENT_SERVICE: "inventory-adjustment-service",
  PROMOTION_SERVICE: "promotion-service"
};

const v1 = ``;

const ApiConfig = {
  CONTENT: `${v1}/${ServiceNames.CONTENT_SERVICE}`,
  PRODUCT: `${v1}/${ServiceNames.PRODUCT_SERVICE}`,
  CORE: `${v1}/${ServiceNames.CORE_SERVICE}`,
  ACCOUNTS: `${v1}/${ServiceNames.ACCOUNT_SERVICE}`,
  ORDER: `${v1}/${ServiceNames.ORDER_SERVICE}`,
  CUSTOMER: `${v1}/${ServiceNames.CUSTOMER_SERVICE}`,
  AUTH: `${v1}/${ServiceNames.AUTH_SERVICE}`,
  PURCHASE_ORDER: `${v1}/${ServiceNames.PURCHASE_ORDER_SERVICE}`,
  IMPORT_EXPORT: `${v1}/${ServiceNames.IMPORT_EXPORT_SERVICE}`,
  INVENTORY: `${v1}/${ServiceNames.INVENTORY_SERVICE}`,
  INVENTORY_TRANSFER: `${v1}/${ServiceNames.INVENTORY_TRANSFER_SERVICE}`,
  LOYALTY: `${v1}/${ServiceNames.LOYALTY_SERVICE}`,
  ECOMMERCE: `${v1}/${ServiceNames.ECOMMERCE_SERVICE}`,
  WEB_APP: `${v1}/${ServiceNames.WEBSITE_SERVICE}`,
  LOGISTIC_GATEWAY: `${v1}/${ServiceNames.LOGISTIC_GATEWAY_SERVICE}`,
  INVENTORY_ADJUSTMENT: `${v1}/${ServiceNames.INVENTORY_ADJUSTMENT_SERVICE}`,
  PROMOTION: `${v1}/${ServiceNames.PROMOTION_SERVICE}`,
  ANALYTICS: `${v1}/reports`,
  CUSTOMER_VISITORS: `${v1}/customer-visitors`,
  WARRANTY: `${v1}/warranty-service`,
  DASHBOARD: `${v1}/dashboard-service`,
};

export { ApiConfig };
