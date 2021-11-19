const SETTINGS = "settings";
const UrlConfig = {
  HOME: `/`,
  LOGIN: `/login`,
  PRODUCT: `/products`,
  VARIANTS: `/variants`,
  CATEGORIES: `/products/categories`,
  PURCHASE_ORDER: `/purchase-order`,
  INVENTORY: "/products/inventory",
  MATERIALS: `/products/materials`,
  SIZES: `/products/sizes`,
  COLORS: `/products/colors`,
  SUPPLIERS: `/products/suppliers`,
  ACCOUNTS: `/accounts`,
  STORE: `/stores`,
  ROLES: `/roles`,
  ORDER: `/orders`,
  ORDERS_RETURN: `/orders-return`,
  ORDER_PROCESSING_STATUS: `/${SETTINGS}/order-processing-status`,
  ORDER_SOURCES: `/${SETTINGS}/order-sources`,
  PRINTER: `/${SETTINGS}/printer`,
  THIRD_PARTY_LOGISTICS_INTEGRATION: `/${SETTINGS}/third-party-logistics-integration`,
  ORDER_SETTINGS: `/${SETTINGS}/order-settings`,
  CUSTOMER: `/customers`,
  CUSTOMER2: `/customer`,
  SHIPMENTS: `/shipments`,
  YD_PAGE: `/yd-page`,
  ECOMMERCE: "/ecommerce",
  PROMOTION: "/promotion",
  LOYALTY: `/loyalty-programs`,
  PROCUREMENT: '/procurement',
  INVENTORY_TRANSFERS: `/inventory-transfers`,
  INVENTORY_ADJUSTMENTS: `/inventory-adjustments`, 
  DEPARTMENT: `/departments`,
  DISCOUNT: `/discounts`,
  PROMO_CODE: `/promo-codes`,
  PACK_SUPPORT:`/orders-pack-support`
};

export const ProductTabUrl = {
  VARIANTS: UrlConfig.VARIANTS,
  PRODUCTS: UrlConfig.PRODUCT,
  PRODUCT_HISTORIES: UrlConfig.PRODUCT + "/histories",
  HISTORY_PRICES: UrlConfig.PRODUCT + "/history-prices",
};

export const InventoryTransferTabUrl = {
  LIST: UrlConfig.INVENTORY_TRANSFERS,
  HISTORIES: UrlConfig.INVENTORY_TRANSFERS + "/histories",
};

export const BASE_NAME_ROUTER = "/unicorn/admin";
// export const BASE_NAME_ROUTER = `${process.env.REACT_APP_BASE_URL}/unicorn/admin`;
export default UrlConfig;
