import React, { useMemo } from "react";
import { StyledComponent } from "./styled";
import { ClockCircleOutlined, DollarCircleOutlined } from "@ant-design/icons";
import { Space } from "antd";
import { getAllShift, getDatesInWorkShift } from "screens/work-shift/work-shift-helper";
import UserFilled from "component/icon/UserFilled";
import UserGroupCustomOutlined from "component/icon/UsergroupCustomOutlined";
import { WorkShiftCellResponse } from "model/work-shift/work-shift.model";
import moment from "moment";

interface ScheduleDayHeaderTableModel {
  weekday: string;
  day: string;
  fixTotalRevenue: number; //Tổng kế hoạch ngày
  dailyPlanRevenue: number; //Tổng doanh thu thực tế
  fixedTotalHours: number; //tổng giờ công định mức
  elapsedHours: number; //Tổng giờ công  đã sử dụng
  overtimeHours: number; //Giờ công dư fixedTotalHours- elapsedHours
}
interface ScheduleDetailModel {
  fixTotalRevenue: number; //doanh thu thực tế trong ca
  dailyPlanRevenue: number; //mục tiêu doanh thu trong ca
  fixedTotalHours: number; //hạn mức giờ công trong ca
  elapsedHours: number; //giờ công đã sử dụng
  fixTotalUser: number; //hạn mức nhân viên trong ca
  usedEmployees: number; //số nhân viên đã sử dụng trong ca
  cht: number;
  cgtv: number;
  cntn: number;
  kho: number;
  cgtd: number;
  setup: number;
}
interface ShiftTableBodyModel {
  name: string;
  formHours: number;
  toHours: number;
  data: ScheduleDetailModel[];
}
type Props = {
  WorkShiftCells: WorkShiftCellResponse[] | null;
};
const CalendarShiftTable: React.FC<Props> = (props: Props) => {
  const { WorkShiftCells } = props;

  const scheduleDayTableHeader = useMemo(() => {
    if (!WorkShiftCells) return [];
    const datesInWorkShift = getDatesInWorkShift(WorkShiftCells);

    let columnsHeaderData = datesInWorkShift.map((weeksDay) => {
      const filterShift = WorkShiftCells.filter((p) => p.issued_date === weeksDay);

      // //Tổng kế hoạch ngày
      const fixTotalRevenue = filterShift
        .map((item) => item.target_revenue || 0)
        .reduce((prev, next) => prev + next);

      //tổng giờ công định mức
      const fixedTotalHours = filterShift
        .map((item) => item.quota_by_hours || 0)
        .reduce((prev, next) => prev + next);

      let _scheduleDay: ScheduleDayHeaderTableModel = {
        weekday: weeksDay ? moment(weeksDay).format("dddd") : "null",
        day: weeksDay ? moment(weeksDay).date().toString() : "null",
        fixTotalRevenue: fixTotalRevenue,
        dailyPlanRevenue: 0,
        elapsedHours: 0,
        fixedTotalHours: fixedTotalHours,
        overtimeHours: 0,
      };
      return _scheduleDay;
    });

    return columnsHeaderData;
  }, [WorkShiftCells]);

  const shiftTableBody = useMemo(() => {
    if (!WorkShiftCells) return [];
    const datesInWorkShift = getDatesInWorkShift(WorkShiftCells);
    const allShift = getAllShift(WorkShiftCells);

    const rowsData: ShiftTableBodyModel[] = [];
    allShift.forEach((workName) => {
      const findShift = WorkShiftCells.find((p) => p.work_hour_name === workName);

      const columnsData: ScheduleDetailModel[] = [];
      datesInWorkShift.forEach((issuedDate) => {
        const findCell = WorkShiftCells.find(
          (p) => p.work_hour_name === workName && p.issued_date === issuedDate,
        );
        let cell: ScheduleDetailModel = {
          fixTotalRevenue: 0,
          dailyPlanRevenue: findCell?.target_revenue || 0,
          elapsedHours: 0,
          fixedTotalHours: findCell?.quota_by_hours || 0,
          usedEmployees: 0,
          fixTotalUser: findCell?.traffic || 0,
          cht: 0,
          cgtv: 0,
          cntn: 0,
          kho: 0,
          cgtd: 0,
          setup: 0,
        };
        columnsData.push(cell);
      });

      let rowsItemData: ShiftTableBodyModel = {
        name: findShift?.work_hour_name || "",
        formHours: findShift?.from_minutes || 0,
        toHours: findShift?.to_minutes || 0,
        data: columnsData,
      };

      rowsData.push(rowsItemData);
    });

    return rowsData;
  }, [WorkShiftCells]);

  console.log("shiftTableBody", shiftTableBody, WorkShiftCells);
  console.log("scheduleDayHeaderTable", scheduleDayTableHeader);

  const shiftPlanDetail = (title: string, quantity: number) => {
    const renderUser = () => {
      const r: React.ReactNode[] = [];
      for (let i = 0; i < quantity; i++) {
        r.push(<UserFilled />);
      }
      return r;
    };
    return (
      <>
        <div className="shift-plan-detail">
          <div className="shift-plan-detail-text shift-plan-detail-font dark-grey">
            {title}({quantity}):
          </div>
          <div className="shift-plan-detail-icon dark-blue ">{renderUser().map((p) => p)}</div>
        </div>
      </>
    );
  };
  return (
    <StyledComponent>
      <div className="calendar-table">
        <table
          className="rules rules-sticky"
          style={{ width: 300 * scheduleDayTableHeader.length }}
        >
          <colgroup>
            <col style={{ width: "120px" }}></col>
            {scheduleDayTableHeader.map(() => {
              return (
                <>
                  <col style={{ width: "200px" }}></col>
                  <col style={{ width: "200px" }}></col>
                </>
              );
            })}
          </colgroup>
          <thead>
            <tr>
              <th className="condition">{/* title 1 */}</th>

              {scheduleDayTableHeader.map((value) => (
                <>
                  <th className="condition" colSpan={2}>
                    {/* title 2 */}
                    <div className="header">
                      <div className="fw-400">{value.weekday}</div>
                      <div className="fw-600">{value.day}</div>
                    </div>
                  </th>
                  <th className="condition" hidden>
                    {/* title 3 */}
                  </th>
                </>
              ))}
            </tr>
            <tr>
              <th className="condition" rowSpan={2}>
                {/* title 4 */}
              </th>
              {scheduleDayTableHeader.map((value) => (
                <>
                  <th className="condition" colSpan={2}>
                    <div className="header">
                      <div className="fw-400 fz-12">Doanh thu thực tế / kế hoạch ngày</div>
                      <div className="fw-600 dark-blue">
                        {value.dailyPlanRevenue.toLocaleString("vi-VN")} /{" "}
                        {value.fixTotalRevenue.toLocaleString("vi-VN")}
                      </div>
                    </div>
                  </th>
                  <th className="condition" hidden>
                    title 3
                  </th>
                </>
              ))}
            </tr>
            <tr>
              {scheduleDayTableHeader.map((value1) => (
                <>
                  <th className="condition" hidden>
                    title 6
                  </th>
                  <th className="condition">
                    {/* title 7 */}
                    <div className="header">
                      <div className="fw-400 fz-12">Giờ công định mức</div>
                      <div className="fw-600 dark-blue">0 / {value1.fixedTotalHours}h</div>
                    </div>
                  </th>
                  <th className="condition">
                    <div className="header">
                      <div className="fw-400 fz-12">Giờ công dư</div>
                      <div className="fw-600 lime-green">{value1.overtimeHours}h</div>
                    </div>
                  </th>
                </>
              ))}
            </tr>
          </thead>
        </table>
        <table className="rules" style={{ width: 300 * scheduleDayTableHeader.length }}>
          <colgroup>
            <col style={{ width: "120px" }}></col>
            {scheduleDayTableHeader.map(() => {
              return (
                <>
                  <col style={{ width: "200px" }}></col>
                  <col style={{ width: "200px" }}></col>
                </>
              );
            })}
          </colgroup>
          <tbody>
            {shiftTableBody.map((row, index) => (
              <>
                <tr key={`${index}1`}>
                  <td className="condition" rowSpan={3}>
                    <div className="shift-view">
                      <span className="shift-view-ca">{row.name}</span>
                      <span className="shift-view-time">
                        {row.formHours}h-{row.toHours}h
                      </span>
                    </div>
                  </td>

                  {row.data.map((column) => (
                    <>
                      <td className="condition" colSpan={2}>
                        {/* body 2 */}
                        <div className="revenue">
                          <DollarCircleOutlined className="revenue-icon yellow-gold" />
                          <div className="revenue-text">
                            {column.dailyPlanRevenue.toLocaleString("vi-VN")}/
                            {column.dailyPlanRevenue.toLocaleString("vi-VN")}
                          </div>
                        </div>
                      </td>
                      <td className="condition" hidden>
                        body 3
                      </td>
                    </>
                  ))}
                </tr>
                <tr key={`${index}2`}>
                  {row.data.map((column) => (
                    <>
                      <td className="condition" hidden>
                        body 4
                      </td>
                      <td className="condition">
                        <div className="shift-plan">
                          <ClockCircleOutlined className="shift-plan-icon yellow-gold" />
                          <div className="shift-plan-text fw-600">
                            {column.elapsedHours}/{column.fixedTotalHours}h
                          </div>
                        </div>
                      </td>
                      <td className="condition">
                        <div className="shift-plan">
                          <UserGroupCustomOutlined />
                          <div className="shift-plan-text fw-600">
                            {column.usedEmployees}/{column.fixTotalUser}
                          </div>
                        </div>
                      </td>
                    </>
                  ))}
                </tr>
                <tr key={`${index}3`}>
                  {row.data.map((column) => (
                    <>
                      <td className="condition" hidden>
                        body 4
                      </td>
                      <td className="condition" colSpan={2}>
                        {/* body 5 */}
                        <Space direction="vertical" size="small" style={{ display: "flex" }}>
                          {shiftPlanDetail("CHT", column.cht)}
                          {shiftPlanDetail("CGTV", column.cgtv)}
                          {shiftPlanDetail("CNTN", column.cntn)}
                          {shiftPlanDetail("KHO", column.kho)}
                          {shiftPlanDetail("CGTĐ", column.cgtd)}
                          {shiftPlanDetail("SETUP", column.setup)}
                          {/* <div className="shift-plan-detail">
                            <div className="shift-plan-detail-text shift-plan-detail-font dark-grey">
                              CHT(1):
                            </div>
                            <div className="shift-plan-detail-icon dark-blue ">
                              <UserOutlined />
                              <UserOutlined />
                              <UserOutlined />
                            </div>
                          </div>
                         */}
                        </Space>
                      </td>
                      <td className="condition" hidden>
                        body 6
                      </td>
                    </>
                  ))}
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </StyledComponent>
  );
};

export default CalendarShiftTable;
