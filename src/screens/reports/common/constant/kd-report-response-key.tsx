export const DEFAULT_OFF_KD_GROUP_LV1 = "Kinh doanh Offline";

export const DEFAULT_ON_KD_GROUP_LV1 = "Kinh doanh Online";

export const ONL_DRILLING_LEVEL = {
  COMPANY: 1,
  DEPARTMENT: 2,
  SHOP: 3,
  ACCOUNT: 4,
};

export const OFF_DRILLING_LEVEL = {
  COMPANY: 1,
  ASM: 2,
  STORE: 3,
  STAFF: 4,
};

export const ATTRIBUTE_VALUE = [
  "monthly_target",
  "monthly_actual",
  "monthly_progress",
  "monthly_forecasted",
  "monthly_forecasted_progress",
  "daily_target",
  "daily_actual",
  "daily_progress",
];

export const ATTRIBUTE_TITLE = [
  "key_driver_position",
  "key_driver",
  "key_driver_title",
  "key_driver_description",
  "unit",
  "key_driver_group_lv1",
  "key_driver_group_lv2",
  "key_driver_group_lv3",
  "key_driver_group_lv4",
  "key_driver_group_lv5",
  "drilling_level",
];

export const COLUMN_ORDER_LIST = [
  ...ATTRIBUTE_TITLE,
  "department_lv1",
  "department_lv2",
  "department_lv3",
  "department_lv4",
  "account_code",
  "account_name",
  "account_role",
  "target_drilling_level",
  "calculation",
  ...ATTRIBUTE_VALUE,
];
