import FacebookIcon from "assets/icon/facebook.svg";
import ZaloIcon from "assets/icon/zalo.svg";
import SmsIcon from "assets/icon/sms.svg";
import moment from "moment";

export const CAMPAIGN_STATUS_LIST: Array<any> = [
  {
    name: "Chờ kích hoạt",
    value: "WAITING",
    type: "",
  },
  {
    name: "Đang triển khai",
    value: "ACTIVE",
    type: "primary",
  },
  {
    name: "Tạm ngừng",
    value: "PAUSE",
    type: "warning",
  },
];

export const MESSAGE_STATUS_LIST = [
  {
    name: "Chờ gửi",
    value: "PENDING",
    color: "#666666",
  },
  {
    name: "Đang gửi",
    value: "SENDING",
    color: "#FCAF17",
  },
  {
    name: "Thành công",
    value: "SUCCESS",
    color: "#27AE60",
  },
  {
    name: "Thất bại",
    value: "FAILED",
    color: "#E24343",
  },
];

export const CHANNEL_LIST = [
  {
    name: "Facebook",
    value: "FACEBOOK",
    icon: FacebookIcon,
  },
  {
    name: "Zalo",
    value: "ZALO",
    icon: ZaloIcon,
  },
  {
    name: "Sms",
    value: "SMS",
    icon: SmsIcon,
  },
];

export const SMS_TYPE_LIST = [
  {
    name: "Brandname Quảng cáo",
    value: 1,
  },
  {
    name: "Brandname Chăm sóc khách hàng",
    value: 2,
  },
  {
    name: "Đầu số cố định 10 số",
    value: 8,
  },
];

export const KEYWORD_LIST = [
  {
    name: "Tên cửa hàng",
    key: "shop_name",
    value: "{shop_name}",
  },
  {
    name: "Địa chỉ cửa hàng",
    key: "shop_address",
    value: "{shop_address}",
  },
  {
    name: "SĐT cửa hàng",
    key: "shop_phone",
    value: "{shop_phone}",
  },
  {
    name: "Mã khách hàng",
    key: "customer_code",
    value: "{customer_code}",
  },
  {
    name: "Điểm hiện tại",
    key: "current_point",
    value: "{current_point}",
  },
  {
    name: "Hạng thẻ",
    key: "card_rank",
    value: "{card_rank}",
  },
  {
    name: "Tên khách hàng",
    key: "customer_name",
    value: "{customer_name}",
  },
  {
    name: "Giới tính",
    key: "gender",
    value: "{gender}",
  },
  {
    name: "Mã khuyến mại",
    key: "discount_code",
    value: "{discount_code}",
  },
  {
    name: "Điểm tích",
    key: "points",
    value: "{points}",
  },
  {
    name: "Điểm đã tiêu",
    key: "points_consumed",
    value: "{points_consumed}",
  },
];

export const DATE_LIST_FORMAT = {
  todayFrom: moment().startOf("day").format("DD-MM-YYYY"),
  todayTo: moment().endOf("day").format("DD-MM-YYYY"),

  yesterdayFrom: moment().startOf("day").subtract(1, "days").format("DD-MM-YYYY"),
  yesterdayTo: moment().endOf("day").subtract(1, "days").format("DD-MM-YYYY"),

  thisWeekFrom: moment().startOf("week").format("DD-MM-YYYY"),
  thisWeekTo: moment().endOf("week").format("DD-MM-YYYY"),

  lastWeekFrom: moment().startOf("week").subtract(1, "weeks").format("DD-MM-YYYY"),
  lastWeekTo: moment().endOf("week").subtract(1, "weeks").format("DD-MM-YYYY"),

  thisMonthFrom: moment().startOf("month").format("DD-MM-YYYY"),
  thisMonthTo: moment().endOf("month").format("DD-MM-YYYY"),

  lastMonthFrom: moment().subtract(1, "months").startOf("month").format("DD-MM-YYYY"),
  lastMonthTo: moment().subtract(1, "months").endOf("month").format("DD-MM-YYYY"),
};
