// Đặt tên resouces  có chữ [s] + action , viết thường, snake_case => products_read
// Nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create
// Các action chính : read, update, create, delete, print, ..

export const CAMPAIGN_PERMISSION = {
  marketings_campaigns_read: "marketings_campaigns_read",
  marketings_campaigns_read_detail: "marketings_campaigns_read_detail",
  marketings_campaigns_create: "marketings_campaigns_create",
  marketings_campaigns_update: "marketings_campaigns_update",
  marketings_contacts_read: "marketings_contacts_read",
  marketings_contacts_create: "marketings_contacts_create",
  marketings_contacts_update: "marketings_contacts_update",
};
