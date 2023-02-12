export interface ruleConditions {
  field: string | null;
  operator: string | null;
  value: number | null;
}

export interface smsFormBirthDay {
  customer_group_ids: Array<number>;
  customer_level_ids: Array<number>;
  store_ids?: Array<number>;
  content: string | null;
  price_rule: {
    rule: {
      conditions: Array<ruleConditions>;
      group_operator: string | null;
      value: number | null;
      value_type: string | null;
    },
    entitled_method: string | null;
    usage_limit: number | null;
    usage_limit_per_customer: number | null;
    apply_days?: number | null;
    title: string | null;
    state: string | null;
  },
  discount_code_length: number | null;
  discount_code_prefix: string | null;
  discount_code_suffix: string | null;
}

export interface smsFormOrderOnline extends smsFormBirthDay {
  source_ids: Array<number>;
}

export interface smsPromotionVoucher {
  id?: number;
  content: string | null;
  price_rule_id: number | null;
  discount_code_length: number | null;
  discount_code_prefix: string | null;
  discount_code_suffix: string | null;
}
