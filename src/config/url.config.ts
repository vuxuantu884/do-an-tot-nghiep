const SETTINGS = "settings";
const UrlConfig = {
  HOME: `/`,
  LOGIN: `/login`,
  PRODUCT: `/products`,
  VARIANTS: `/products/variants`,
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
  ORDER_SOURCES: `/${SETTINGS}/order-source`,
  PRINTER: `/${SETTINGS}/printer`,
  THIRD_PARTY_LOGISTICS_INTEGRATION: `/${SETTINGS}/third-party-logistics-integration`,
  ORDER_SETTINGS: `/${SETTINGS}/order-settings`,
  CUSTOMER: `/customers`,
  CUSTOMER2: `/customer`,
  SHIPMENTS: `/shipments`,
  FPAGE: `/fpage`,
  ECOMMERCE: "/ecommerce",
  PROMOTION: "/promotion",
  LOYALTY: `/loyalty-programs`,
  PROCUREMENT: '/procurement',
  INVENTORY_TRANSFER: `/inventory-transfer`,
  DISCOUNT: `/discount`
};

export const BASE_NAME_ROUTER = "/unicorn/admin";
export default UrlConfig;
