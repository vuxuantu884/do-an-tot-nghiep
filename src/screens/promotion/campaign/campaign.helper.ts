import { CustomerSelectionOption, Gender } from "model/promotion/price-rules.model";
import moment from "moment";

export interface PromotionCampaignStep {
  title: string;
  key: string;
  value: number;
}

export enum CAMPAIGN_STATUS_ENUM {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REGISTERED = "REGISTERED",
  SET_UP = "SET_UP",
  ACTIVED = "ACTIVED",
  DISABLED = "DISABLED",
}

export const CAMPAIGN_STEPS_LIST: Array<PromotionCampaignStep> = [
  {
    title: "Đăng ký chương trình",
    key: "",
    value: 0,
  },
  {
    title: "Duyệt chương trình",
    key: CAMPAIGN_STATUS_ENUM.PENDING,
    value: 1,
  },
  {
    title: "Đăng ký SCT",
    key: CAMPAIGN_STATUS_ENUM.APPROVED,
    value: 2,
  },
  {
    title: "Setup chương trình",
    key: CAMPAIGN_STATUS_ENUM.REGISTERED,
    value: 3,
  },
  {
    title: "Kích hoạt",
    key: CAMPAIGN_STATUS_ENUM.SET_UP,
    value: 4,
  },
];

export enum DEFAULT_CUSTOMER_CONDITION_DATE {
  START_DATE_OF_YEAR = "0101",
  END_DATE_OF_YEAR = "3112",
}

export enum CustomerConditionFields {
  customer_selection = "customer_selection",
  starts_birthday = "starts_birthday",
  ends_birthday = "ends_birthday",
  starts_wedding_day = "starts_wedding_day",
  ends_wedding_day = "ends_wedding_day",
  prerequisite_genders = "prerequisite_genders",
  prerequisite_customer_loyalty_level_ids = "prerequisite_customer_loyalty_level_ids",
  prerequisite_customer_group_ids = "prerequisite_customer_group_ids",
}

export const genderOptions = [
  {
    label: "Nam",
    value: Gender.MALE,
  },
  {
    label: "Nữ",
    value: Gender.FEMALE,
  },
  {
    label: "Khác",
    value: Gender.OTHER,
  },
];

export const handleConvertCustomerConditionDate = (dateDuration?: Array<string>) => {
  if (!dateDuration || !Array.isArray(dateDuration) || !dateDuration?.length) {
    return null;
  }
  const thisYear = new Date().getUTCFullYear();

  const startDay = dateDuration[0]?.slice(0, 2);
  const startMonth = dateDuration[0]?.slice(2, 4);
  const startDate = moment(new Date(`${startMonth}-${startDay}-${thisYear}`));

  let endDate = undefined;
  if (dateDuration[1]) {
    const endDay = dateDuration[1]?.slice(0, 2);
    const endMonth = dateDuration[1]?.slice(2, 4);
    endDate = moment(new Date(`${endMonth}-${endDay}-${thisYear}`));
  }
  return {
    startDate,
    endDate,
  };
};

export const transformPromotionCampaignFormValues = (values: any) => {
  const body = {
    ...values,
    prerequisite_store_ids: values.prerequisite_store_ids ?? [],
    prerequisite_customer_group_ids: values.prerequisite_customer_group_ids ?? [],
    prerequisite_customer_loyalty_level_ids: values.prerequisite_customer_loyalty_level_ids ?? [],
    prerequisite_genders: values.prerequisite_genders ?? [],
    prerequisite_order_source_ids: values.prerequisite_order_source_ids ?? [],
    prerequisite_sales_channel_names: values.prerequisite_sales_channel_names ?? [],
  };

  if (values.customer_selection === CustomerSelectionOption.ALL) {
    body.prerequisite_birthday_duration = [];
    body.prerequisite_wedding_duration = [];
  } else {
    /** handle customer birthday */
    if (!values.starts_birthday && !values.ends_birthday) {
      body.prerequisite_birthday_duration = [];
    } else {
      const startsBirthday =
        values.starts_birthday?.format("DDMM") ||
        DEFAULT_CUSTOMER_CONDITION_DATE.START_DATE_OF_YEAR;
      const endsBirthday =
        values.ends_birthday?.format("DDMM") || DEFAULT_CUSTOMER_CONDITION_DATE.END_DATE_OF_YEAR;
      body.prerequisite_birthday_duration = [startsBirthday, endsBirthday];
    }

    /** handle customer wedding day */
    if (!values.starts_wedding_day && !values.ends_wedding_day) {
      body.prerequisite_wedding_duration = [];
    } else {
      const startsWeddingDay =
        values.starts_wedding_day?.format("DDMM") ||
        DEFAULT_CUSTOMER_CONDITION_DATE.START_DATE_OF_YEAR;
      const endsWeddingDay =
        values.ends_wedding_day?.format("DDMM") || DEFAULT_CUSTOMER_CONDITION_DATE.END_DATE_OF_YEAR;
      body.prerequisite_wedding_duration = [startsWeddingDay, endsWeddingDay];
    }
  }

  delete body[CustomerConditionFields.starts_birthday];
  delete body[CustomerConditionFields.ends_birthday];
  delete body[CustomerConditionFields.starts_wedding_day];
  delete body[CustomerConditionFields.ends_wedding_day];

  return body;
};
