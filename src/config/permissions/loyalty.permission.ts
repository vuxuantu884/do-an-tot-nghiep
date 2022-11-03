// Đặt tên resouces  có chữ [s] + action , viết thường, snake_case => products_read
// Nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create
// Các action chính : read, update, create, delete, print, ..

export const LoyaltyPermission = {
  points_update: "loyalties_points_update",
  cards_read: "loyalties_cards_read",
  cards_lock: "loyalties_cards_lock",
  cards_assignment: "loyalties_cards_assignment",
  cards_release: "loyalties_cards_release",
  cards_release_read: "loyalties_cards_release_read",
  programs_read: "loyalties_programs_read",
  programs_create: "loyalties_programs_create",
  programs_update: "loyalties_programs_update",
  programs_delete: "loyalties_programs_delete",
  loyalties_config: "loyalties_config",
};

export const LOYALTY_ADJUSTMENT_PERMISSIONS = {
  CREATE: "loyalties_adjustments_create",
  READ: "loyalties_adjustments_read",
};
