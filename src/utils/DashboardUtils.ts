import { DASHBOARD_CONFIG } from "config/dashboard";
import { DashboardShowMyData } from "model/dashboard/dashboard.model";
import { AnalyticDataQuery, AnalyticQueryMany, AnalyticSampleQuery, FIELD_FORMAT } from "model/report/analytics.model";
import { Dispatch } from "redux";
import { executeAnalyticsQueryService, executeManyAnalyticsQueryService } from "service/report/analytics.service";
import { callApiNative } from "./ApiUtils";
import { generateRQuery } from "./ReportUtils";

export const currencyAbbreviation = (value: number, format: FIELD_FORMAT | string = FIELD_FORMAT.Price) => {
  const { Price } = FIELD_FORMAT;
  switch (format) {
    case Price:
      if (typeof value !== 'number') {
        return value;
      }
      const absValue = Math.abs(value);
      if (absValue >= 1000000000) {
        return (value / 1000000000).toString() + " Tỷ";
      } else if (absValue >= 1000000) {
        return (value / 1000000).toString() + " Tr";
      } else if (absValue >= 1000) {
        return (value / 1000).toString() + " N";
      } else if (absValue === 0) {
        return value.toString();
      } else {
        return value.toString() + " Đ";
      }
    default:
      return value.toString();
  }

};

export const setDepartmentQuery = (departmentIdList: Array<number | string>, department: string = "pos_location_name") => {
  let condition: any = []
  if (departmentIdList.length > 0) {
    // convert [1,2,3] to [1,",",2,",",3]
    departmentIdList.forEach((item, index) => {
      condition.push(typeof item === "string" ? `'${item}'` : item);
      if (index !== departmentIdList.length - 1) {
        condition.push(",");
      }
    })

  }
  const operator = departmentIdList.length > 1 ? "IN" : "==";
  return [[department, operator, ...condition]];
}

export const getDataManyQueryDashboard = async (dispatch: Dispatch<any>, showMyData: DashboardShowMyData, deparmentIdList: Array<string | number>, queries: AnalyticSampleQuery[]): Promise<AnalyticDataQuery[]> => {
  const params: AnalyticQueryMany = { q: [], options: [] };

  const { condition, isSeeMyData, myCode } = showMyData;
  // Data từ bộ lọc bộ phận
  const locationCondition = deparmentIdList ? setDepartmentQuery(deparmentIdList, DASHBOARD_CONFIG.locationQueryField) : [];
  // Data từ bộ lọc xem dữ liệu của tôi
  const userCondition = condition && isSeeMyData && myCode ? [showMyData.condition, "==", myCode] : [];

  const conditions = [...locationCondition, userCondition];

  queries.forEach((item: AnalyticSampleQuery) => {
    // lọc theo cửa hàng 
    if (!Array(item.query.conditions)) {
      item.query.conditions = [];
    }

    item.query.conditions?.concat(conditions);
    const q = generateRQuery(item.query);
    params.q.push(q);
    params.options.push(item.options || "");
  })

  const data: AnalyticDataQuery[] = await callApiNative({ notifyAction: "HIDE_ALL" }, dispatch, executeManyAnalyticsQueryService, params);
  return data;
}

/**
 * vì executeManyAnalyticsQueryService() chưa dùng được options( api chưa hỗ trợ ) nên dùng tạm fn này, sau khi fix thì xóa
 * @param dispatch 
 * @param showMyData 
 * @param deparmentIdList 
 * @param queries 
 * @returns 
 */
export const getDataOneQueryDashboard = async (dispatch: Dispatch<any>, showMyData: DashboardShowMyData, deparmentIdList: Array<string | number>, queries: AnalyticSampleQuery): Promise<AnalyticDataQuery> => {

  const { condition, isSeeMyData, myCode } = showMyData;
  // Data từ bộ lọc bộ phận
  const locationCondition = deparmentIdList ? setDepartmentQuery(deparmentIdList, DASHBOARD_CONFIG.locationQueryField) : [];
  // Data từ bộ lọc xem dữ liệu của tôi
  const userCondition = condition && isSeeMyData && myCode ? [showMyData.condition, "==", myCode] : [];
  const conditions = [...locationCondition, userCondition];

  if (!Array(queries.query.conditions)) {
    queries.query.conditions = [];
  }

  queries.query.conditions?.concat(conditions);
  const q = generateRQuery(queries.query);
  const data: AnalyticDataQuery = await callApiNative({ notifyAction: "HIDE_ALL" }, dispatch, executeAnalyticsQueryService, { q, options: queries.options });

  return data;
}
