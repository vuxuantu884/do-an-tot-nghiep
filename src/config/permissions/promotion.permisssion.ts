// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_view
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create

import { getPromotionCampaignListAction } from "../../domain/actions/promotion/campaign/campaign.action";

const PromotionReleasePermission = {
  READ: "price_rules_discount_code_read",
  CREATE: "price_rules_discount_code_create",
  UPDATE: "price_rules_discount_code_update",
  CANCEL: "price_rules_discount_code_cancel",
  EXPORT: "price_rules_discount_code_export",
  ACTIVE: "price_rules_discount_code_active_and_disabled",
};

const PriceRulesPermission = {
  READ: "price_rules_entitlement_read",
  CREATE: "price_rules_entitlement_create",
  UPDATE: "price_rules_entitlement_update",
  EXPORT: "price_rules_entitlement_export",
  CANCEL: "price_rules_entitlement_cancel",
  ACTIVE: "price_rules_entitlement_active_and_disabled",
};

export const PROMOTION_GIFT_PERMISSIONS = {
  READ: "price_rules_gift_read",
  CREATE: "price_rules_gift_create",
  UPDATE: "price_rules_gift_update",
  EXPORT: "price_rules_gift_export",
  CANCEL: "price_rules_gift_cancel",
  ACTIVE: "price_rules_gift_active_and_disabled",
};

export const PROMOTION_CAMPAIGN_PERMISSIONS = {
  READ: "price_rules_campaign_read",          // Xem CTKM
  CREATE: "price_rules_campaign_create",      // Tạo mới CTKM
  UPDATE: "price_rules_campaign_update",      // Sửa CTKM
  APPROVE: "price_rules_campaign_approve",    // Duyệt chương trình
  REGISTER: "price_rules_campaign_register",  // Đăng kí chương trình với sở công thương
  SETUP: "price_rules_campaign_setup",        // Set up chương trình
  ACTIVE: "price_rules_campaign_active",      // Kích hoạt chương trình
};

export { PromotionReleasePermission, PriceRulesPermission };
