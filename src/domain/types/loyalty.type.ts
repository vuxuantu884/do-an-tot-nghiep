const LoyaltyCardReleaseType = {
  UPLOAD: "LOYALTY_CARD_UPLOAD",
  SEARCH_LOYALTY_CARD_RELEASE_REQUEST: "SEARCH_LOYALTY_CARD_RELEASE_REQUEST",
};

const LoyaltyRankType = {
  SEARCH_LOYALTY_RANK_REQUEST: "SEARCH_LOYALTY_RANK_REQUEST",
  CREATE_LOYALTY_RANK_REQUEST: "CREATE_LOYALTY_RANK_REQUEST",
  GET_LOYALTY_RANK_DETAIL_REQUEST: "GET_LOYALTY_RANK_DETAIL_REQUEST",
  UPDATE_LOYALTY_RANK_REQUEST: "UPDATE_LOYALTY_RANK_REQUEST",
  DELELTE_LOYALTY_RANK_REQUEST: "DELELTE_LOYALTY_RANK_REQUEST",
  GET_CODE_UPDATE_RANKING_CUSTOMER: "GET_CODE_UPDATE_RANKING_CUSTOMER",
};

const LoyaltyCardType = {
  SEARCH_LOYALTY_CARD_REQUEST: "SEARCH_LOYALTY_CARD_REQUEST",
  ASSIGN_CUSTOMER_REQUEST: "ASSIGN_CUSTOMER_REQUEST",
  LOCK_CARD_REQUEST: "LOCK_CARD_REQUEST",
};

const LoyaltyProgramType = {
  CREATE_LOYALTY_ACCUMULATION_PROGRAM_REQUEST: "CREATE_LOYALTY_ACCUMULATION_PROGRAM_REQUEST",
  UPDATE_LOYALTY_ACCUMULATION_PROGRAM_REQUEST: "UPDATE_LOYALTY_ACCUMULATION_PROGRAM_REQUEST",
  GET_LOYALTY_ACCUMULATION_PROGRAM_DETAIL: "GET_LOYALTY_ACCUMULATION_PROGRAM_DETAIL",
  GET_LOYALTY_ACCUMULATION_PROGRAM: "GET_LOYALTY_ACCUMULATION_PROGRAM",
};

const LoyaltyRateType = {
  CREATE_LOYALTY_RATE_REQUEST: "CREATE_LOYALTY_RATE_REQUEST",
  GET_LOYALTY_RATE_REQUEST: "GET_LOYALTY_RATE_REQUEST",
};

const LoyaltyUsageType = {
  CREATE_LOYALTY_USAGE_REQUEST: "CREATE_LOYALTY_USAGE_REQUEST",
  GET_LOYALTY_USAGE_REQUEST: "GET_LOYALTY_USAGE_REQUEST",
};

const LoyaltyPointsType = {
  GET_LOYALTY_POINT: "GET_LOYALTY_POINT",
  ADD_LOYALTY_POINT: "ADD_LOYALTY_POINT",
  SUBTRACT_LOYALTY_POINT: "SUBTRACT_LOYALTY_POINT",
  GET_LOYALTY_ADJUST_MONEY: "GET_LOYALTY_ADJUST_MONEY",
};

const LoyaltyPointsAdjustmentType = {
  GET_LOYALTY_ADJUST_POINT_LIST: "GET_LOYALTY_ADJUST_POINT_LIST",
  GET_LOYALTY_ADJUST_POINT_DETAIL: "GET_LOYALTY_ADJUST_POINT_DETAIL",
  CREATE_CUSTOMER_POINT_ADJUSTMENT: "CREATE_CUSTOMER_POINT_ADJUSTMENT",
  GET_RECALCULATE_POINT: "GET_RECALCULATE_POINT",
  GET_RECALCULATE_MONEY: "GET_RECALCULATE_MONEY",
};

const LoyaltyChangeValueAdjustmentType = {
  GET_LOYALTY_CODE_IMPORT_ADJUSTMENT: "GET_LOYALTY_CODE_IMPORT_ADJUSTMENT",
  GET_LOYALTY_VALUE_CHANGE_ADJUSTMENT: "GET_LOYALTY_VALUE_CHANGE_ADJUSTMENT",
};

export {
  LoyaltyCardReleaseType,
  LoyaltyRankType,
  LoyaltyCardType,
  LoyaltyProgramType,
  LoyaltyRateType,
  LoyaltyUsageType,
  LoyaltyPointsType,
  LoyaltyPointsAdjustmentType,
  LoyaltyChangeValueAdjustmentType,
};
