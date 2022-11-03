const RELATION_TYPE = {
  HUSBAND: "husband",
  WIFE: "wife",
  CHILD: "child",
};

export const RELATION_LIST = [
  {
    label: "Chồng",
    value: RELATION_TYPE.HUSBAND,
  },
  {
    label: "Vợ",
    value: RELATION_TYPE.WIFE,
  },
  {
    label: "Con",
    value: RELATION_TYPE.CHILD,
  },
];

export const ACTION_TYPE = {
  CREATE: "create",
  UPDATE: "update",
};

const CHARACTERISTICS_VALUE = {
  birthday_false: "birthday=false",
  wedding_day_false: "wedding_day=false",
  full_address_false: "full_address=false",
  card_number_false: "card_number=false",
  card_number_true: "card_number=true",
  description_false: "description=false",
  description_true: "description=true",
};

export const CHARACTERISTICS_LIST = [
  {
    label: "Chưa có ngày sinh",
    value: CHARACTERISTICS_VALUE.birthday_false,
  },
  {
    label: "Chưa có ngày cưới",
    value: CHARACTERISTICS_VALUE.wedding_day_false,
  },
  {
    label: "Chưa có địa chỉ",
    value: CHARACTERISTICS_VALUE.full_address_false,
  },
  {
    label: "Chưa có thẻ",
    value: CHARACTERISTICS_VALUE.card_number_false,
  },
  {
    label: "Đã có thẻ",
    value: CHARACTERISTICS_VALUE.card_number_true,
  },
  // {
  //   label: "Chưa có mô tả",
  //   value: CHARACTERISTICS_VALUE.description_false,
  // },
  // {
  //   label: "Có mô tả",
  //   value: CHARACTERISTICS_VALUE.description_true,
  // },
];
