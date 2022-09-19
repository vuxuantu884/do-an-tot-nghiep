import { START_OF_MONTH, TODAY } from "config/dashboard";
import UrlConfig from "config/url.config";
import { AnalyticCube, AnalyticGroup, AnalyticTemplateData, TimeAtOptionValue } from "model/report";

export const SUB_STATUS_REPORT_TEMPLATES: AnalyticTemplateData[] = [
  {
    type: "Báo cáo tỷ lệ thành công",
    name: "chi nhánh (nguồn)",
    query: `SHOW shipped_gross_sales, coordinator_confirmed_gross_sales, coordinator_confirming_gross_sales, require_warehouse_change, merchandise_picking, merchandise_packed_gross_sales, awaiting_shipper_gross_sales, shipping_gross_sales, delivery_fail_gross_sales, returning_gross_sales, confirm_returned_gross_sales, compensate_gross_sales, inter_regional_gross_sales, internal_region_gross_sales, provincial BY coordinator_name,coordinator_code,order_sub_status FROM sales_by_sub_status WHERE sale_area IN ('Khối KD Online') AND cancelled IN ('Chưa hủy') SINCE ${START_OF_MONTH} UNTIL ${TODAY} ORDER BY pre_net_sales DESC`,
    chart_query: ``,
    cube: AnalyticCube.SalesBySubStatus,
    alias: [UrlConfig.ANALYTIC_SALES_ONLINE],
    iconImg: "nguon-ban-hang.svg",
    id: 80,
    chartColumnSelected: [],
    timeAtOption: TimeAtOptionValue.CreatedAt,
    group: AnalyticGroup.SalesBySubStatus,
  },
];
