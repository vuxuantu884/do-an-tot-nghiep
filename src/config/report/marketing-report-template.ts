import { START_OF_MONTH, TODAY } from "config/dashboard";
import { REPORTS_URL } from "config/url.config";
import { AnalyticCube, AnalyticTemplateData, TimeAtOptionValue } from "model/report";

export const MARKETING_REPORT_TEMPLATES: AnalyticTemplateData[] = [
  {
    type: "Báo cáo chi phí Facebook Ad",
    name: "theo Shop",
    query: `SHOW advertisement_spent, pre_net_sales, advertisement_margin BY day,source_department_lv2,source_department_name FROM insights SINCE ${START_OF_MONTH} UNTIL ${TODAY} WHERE cancelled == "Chưa hủy" ORDER BY day ASC`,
    chart_query: `SHOW advertisement_margin BY day,source_department_lv2,source_department_name FROM insights SINCE ${START_OF_MONTH} UNTIL ${TODAY} WHERE cancelled == "Chưa hủy" ORDER BY day ASC`,
    cube: AnalyticCube.Insights,
    alias: [REPORTS_URL.MARKETING],
    iconImg: "cua-hang.svg",
    id: 1,
    chartColumnSelected: ["advertisement_margin"],
    timeAtOption: TimeAtOptionValue.CreatedAt,
  },
  {
    type: "Báo cáo chi phí Facebook Ad",
    name: "theo Nhân viên",
    query: `SHOW advertisement_spent, pre_net_sales, advertisement_margin BY source_department_lv2,source_department_name,marketer_code,marketer_name FROM insights WHERE marketer_code != '' AND cancelled == "Chưa hủy" SINCE ${TODAY} UNTIL ${TODAY}`,
    chart_query: `SHOW advertisement_margin, advertisement_spent BY source_department_lv2,source_department_name,marketer_code,marketer_name FROM insights WHERE marketer_code != '' AND cancelled == "Chưa hủy" SINCE ${TODAY} UNTIL ${TODAY}`,
    cube: AnalyticCube.Insights,
    alias: [REPORTS_URL.MARKETING],
    iconImg: "nhan-vien.svg",
    id: 1,
    chartColumnSelected: ["advertisement_margin", "advertisement_spent"],
    timeAtOption: TimeAtOptionValue.CreatedAt,
  },
  {
    type: "Báo cáo chi phí Facebook Ad",
    name: "Chi tiết",
    query: `SHOW advertisement_spent, pre_net_sales, advertisement_margin BY source_department_lv2,advertisement_campaign_name,advertisement_id,advertisement_name FROM insights SINCE ${TODAY} UNTIL ${TODAY} WHERE cancelled == "Chưa hủy"`,
    chart_query: `SHOW pre_total_sales BY source_department_lv2,advertisement_campaign_name,advertisement_id,advertisement_name FROM insights SINCE ${TODAY} UNTIL ${TODAY} WHERE cancelled == "Chưa hủy"`,
    cube: AnalyticCube.Insights,
    alias: [REPORTS_URL.MARKETING],
    iconImg: "nguon-ban-hang.svg",
    id: 1,
    chartColumnSelected: ["pre_total_sales"],
    timeAtOption: TimeAtOptionValue.CreatedAt,
  },
];
