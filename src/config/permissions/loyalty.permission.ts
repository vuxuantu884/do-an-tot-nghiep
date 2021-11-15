// Đặt tên resouces  có chữ [s] + action , viết thường, snake_case => products_read
// Nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create
// Các action chính : read, update, create, delete, print, ..

const Loyalty = "loyalties";

export const LoyaltyPermission = {
  points_update: `${Loyalty}_points_update`,
  cards_read: `${Loyalty}_cards_read`,
  cards_lock: `${Loyalty}_cards_lock`,
  cards_assignment: `${Loyalty}_cards_assignment`,
  cards_release: `${Loyalty}_cards_release`,
  cards_release_read: `${Loyalty}_cards_release_read`,
  programs_read: `${Loyalty}_programs_read`,
  programs_create: `${Loyalty}_programs_create`,
  programs_update: `${Loyalty}_programs_update`,
  programs_delete: `${Loyalty}_programs_delete`,
  loyalties_config: `${Loyalty}_config`,
}
