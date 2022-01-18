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
  ORDERS_RETURN: `/order-returns`,
  SPLIT_ORDERS: `/split-orders`,
  ORDER_PROCESSING_STATUS: `/order-processing-status`,
  ORDER_SOURCES: `/order-sources`,
  ORDERS_DUPLICATE: `/duplicate-orders`,
  PRINTER: `/prints-templates`,
  THIRD_PARTY_LOGISTICS_INTEGRATION: `/${SETTINGS}/third-party-logistics-integration`,
  ORDER_SETTINGS: `/${SETTINGS}/orders`,
  CUSTOMER: `/customers`,
  CUSTOMER2: `/customer`,
  SHIPMENTS: `/shipments`,
  YD_PAGE: `/yd-page`,
  YDPAGE: `/YDpage`,
  ECOMMERCE: "/ecommerce",
  PROMOTION: "/promotion",
  LOYALTY: `/loyalty-programs`,
  PROCUREMENT: '/procurements',
  INVENTORY_TRANSFERS: `/inventory-transfers`,
  INVENTORY_ADJUSTMENTS: `/inventory-adjustments`, 
  DEPARTMENT: `/departments`,
  DISCOUNT: `/discounts`,
  PROMO_CODE: `/issues`,
  GIFT: `/gifts`,
  PACK_SUPPORT:`/orders-pack-support`
};

export const ProductTabUrl = {
  VARIANTS: UrlConfig.VARIANTS,
  PRODUCTS: UrlConfig.PRODUCT,
  PRODUCT_HISTORIES: UrlConfig.PRODUCT + "/histories",
  HISTORY_PRICES: UrlConfig.PRODUCT + "/history-prices",
};

export const SupplierTabUrl = {
  ADDRESSES: 'addresses',
  CONTACTS: 'contacts',
  PAYMENTS: "payments",
};

export const InventoryTransferTabUrl = {
  LIST: UrlConfig.INVENTORY_TRANSFERS,
  HISTORIES: UrlConfig.INVENTORY_TRANSFERS + "/histories",
};
export const InventoryTabUrl = {
  ALL: UrlConfig.INVENTORY,
  DETAIL: UrlConfig.INVENTORY+ "/details",
  HISTORIES: UrlConfig.INVENTORY + "/histories",
  INVENTORY: UrlConfig.VARIANTS + "/inventories",
};

export const ProcurementTabUrl = {
  TODAY: UrlConfig.PROCUREMENT + "/today",
  ALL: UrlConfig.PROCUREMENT,
  LOGS: UrlConfig.PROCUREMENT+'/logs'
};

export const PurchaseOrderTabUrl = {
  INVENTORY: UrlConfig.PURCHASE_ORDERS +  "/inventories",
  HISTORY: UrlConfig.PURCHASE_ORDERS +  "/procurement-histories",
}

export const BASE_NAME_ROUTER = "/admin";
// export const BASE_NAME_ROUTER = `${process.env.REACT_APP_BASE_URL}/admin`;
export default UrlConfig;
