const SETTINGS = "settings";
const UrlConfig = {
  HOME: `/`,
  LOGIN: `/login`,
  PRODUCT: `/products`,
  VARIANTS: `/variants`,
  CATEGORIES: `/categories`,
  COLLECTIONS: `/collections`,
  PURCHASE_ORDERS: `/purchase-orders`,
  INVENTORY: "/inventories",
  MATERIALS: `/materials`,
  SIZES: `/sizes`,
  COLORS: `/colors`,
  SUPPLIERS: `/suppliers`,
  ACCOUNTS: `/accounts`,
  STORE: `/stores`,
  ROLES: `/roles`,
  ORDER: `/orders`,
  OFFLINE_ORDERS: `/offline-orders`,
  ORDERS_RETURN: `/order-returns`,
  SPLIT_ORDERS: `/split-orders`,
  ORDER_PROCESSING_STATUS: `/order-processing-status`,
  ORDER_SOURCES: `/order-sources`,
  ORDERS_DUPLICATE: `/duplicate-orders`,
  PRINTER: `/prints-templates`,
  THIRD_PARTY_LOGISTICS_INTEGRATION: `/${SETTINGS}/third-party-logistics-integration`,
  ORDER_SETTINGS: `/${SETTINGS}/orders`,
  SMS_SETTINGS: `/${SETTINGS}/sms`,
  CUSTOMER: `/customers`,
  CUSTOMER2: `/customer`,
  CUSTOMER_CARDS: `/customer-cards`,
  SHIPMENTS: `/shipments`,
  SHIPMENTS_FAILED: `/shipments-failed`,
  YD_PAGE: `/yd-page`,
  YDPAGE: `/YDpage`,
  ECOMMERCE: "/ecommerce",
  ECOMMERCE_PRODUCTS: "/ecommerce-products",
  WEB_APP: "/web-app",
  WEB_APP_PRODUCTS: "/web-app-products",
  WEB_APP_CONFIGS: "/web-app-configs",
  PROMOTION: "/promotion",
  LOYALTY: `/loyalty-programs`,
  PROCUREMENT: "/procurements",
  INVENTORY_TRANSFERS: `/inventory-transfers`,
  INVENTORY_ADJUSTMENTS: `/inventory-adjustments`,
  DEPARTMENT: `/departments`,
  DISCOUNT: `/discounts`,
  PROMO_CODE: `/issues`,
  GIFT: `/gifts`,
  PACK_SUPPORT:`/orders-pack`,
  DELIVERY_RECORDS:`/delivery-records`,
  BANK:`/bank`,
  BANK_ACCOUNT:`/bank-account`,
  REPORTS:`/reports`,
  ANALYTICS:`/analytics`,
  ANALYTIC_SALES_OFFLINE:`/analytics/sales-offline`,
  ANALYTIC_SALES_ONLINE:`/analytics/sales-online`,
  ANALYTIC_FINACE:`/analytics/finance`,
  ANALYTIC_CUSTOMER:`/analytics/customers`,
  WARRANTY:`/warranties`,
  INVENTORY_DEFECTS: `/inventory-defects`
};

export const ProductTabUrl = {
  VARIANTS: UrlConfig.VARIANTS,
  PRODUCTS: UrlConfig.PRODUCT,
  PRODUCT_HISTORIES: UrlConfig.PRODUCT + "/histories",
  HISTORY_PRICES: UrlConfig.PRODUCT + "/history-prices",
};

export const SupplierTabUrl = {
  ADDRESSES: "addresses",
  CONTACTS: "contacts",
  PAYMENTS: "payments",
};

export const InventoryTransferTabUrl = {
  LIST: UrlConfig.INVENTORY_TRANSFERS,
  HISTORIES: UrlConfig.INVENTORY_TRANSFERS + "/histories",
};
export const InventoryTabUrl = {
  ALL: UrlConfig.INVENTORY,
  DETAIL: UrlConfig.INVENTORY + "/details",
  HISTORIES: UrlConfig.INVENTORY + "/histories",
  INVENTORY: UrlConfig.VARIANTS + "/inventories",
};

export const ProcurementTabUrl = {
  TODAY: UrlConfig.PROCUREMENT + "/today",
  SEVEN_DAYS: UrlConfig.PROCUREMENT + "/seven-days",
  ALL: UrlConfig.PROCUREMENT,
  LOGS: UrlConfig.PROCUREMENT + "/logs",
};

export const PurchaseOrderTabUrl = {
  INVENTORY: UrlConfig.PURCHASE_ORDERS + "/inventories",
  HISTORY: UrlConfig.PURCHASE_ORDERS + "/procurement-histories",
};

export const EcommerceProductTabUrl = {
  TOTAL_ITEM: UrlConfig.ECOMMERCE_PRODUCTS + "/total-item",
  CONNECTED: UrlConfig.ECOMMERCE_PRODUCTS + "/connected-item",
  NOT_CONNECTED: UrlConfig.ECOMMERCE_PRODUCTS + "/not-connected-item",
};

export const WebAppProductTabUrl = {
  TOTAL_ITEM: UrlConfig.WEB_APP_PRODUCTS + "/total-item",
  CONNECTED: UrlConfig.WEB_APP_PRODUCTS + "/connected-item",
  NOT_CONNECTED: UrlConfig.WEB_APP_PRODUCTS + "/not-connected-item",
};

export const WebAppConfigTabUrl = {
  SHOP_LIST: UrlConfig.WEB_APP_CONFIGS + "/shop-list",
  CONFIG_SHOP: UrlConfig.WEB_APP_CONFIGS + "/config-shop",
};

export const BASE_NAME_ROUTER = "/admin";
// export const BASE_NAME_ROUTER = `${process.env.REACT_APP_BASE_URL}/admin`;
export default UrlConfig;

export const WARRANTY_URL = {
  productStatus: "product-statuses",
  reason: "reasons",
  center: "centers"
}