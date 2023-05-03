import React from "react";
import { StyledComponent } from "./styled";
import { ClockCircleOutlined, DollarCircleOutlined } from "@ant-design/icons";
import { Space } from "antd";
import { WORK_SHIFT_LIST } from "screens/work-shift/work-shift-helper";
import UserFilled from "component/icon/UserFilled";
import UserGroupCustomOutlined from "component/icon/UsergroupCustomOutlined";
import { WorkShiftCellResponse } from "model/work-shift/work-shift.model";

interface ShiftModel {
  name: string;
  value: number;
  formHours: number;
  toHours: number;
}

interface ScheduleDetailModel {
  doanh_thu: number;
  doanh_thu_can_dat: number;
  tong_thoi_gian: number;
  so_thoi_gian_su_dung: number;
  tong_nhan_vien: number;
  so_nhan_vien_da_su_dung: number;
  cht: number;
  cgtv: number;
  cntn: number;
  kho: number;
  cgtd: number;
  vm: number;
}

interface ScheduleDayTableHeaderModel {
  weekday: string;
  day: string;
  actualRevenue: number; //doanh thu thực tế 1 ngày
  dailyPlan: number; //kế hoạch ngày
  fixedHours: number; //giờ công định mức
  fixedHoursTotal: number; //tổng giờ công định mức
  overtimeHours: number; //Giờ công dư
}
interface ShiftTableBodyModel {
  workShift: ShiftModel;
  data: ScheduleDetailModel[];
}
type Props = {
  WorkShiftCells: WorkShiftCellResponse[] | null;
};
const CalendarShiftTable: React.FC<Props> = (props: Props) => {
  const workShifts = WORK_SHIFT_LIST();

  const shiftDataDetails = () => {
    let shiftDataDetails: ScheduleDetailModel[] = [];
    for (let i = 0; i < 7; i++) {
      shiftDataDetails.push({
        doanh_thu: 0,
        doanh_thu_can_dat: 0,
        tong_thoi_gian: 0,
        so_thoi_gian_su_dung: 0,
        tong_nhan_vien: 0,
        so_nhan_vien_da_su_dung: 0,
        cht: 0,
        cgtv: 0,
        cntn: 0,
        kho: 0,
        cgtd: 0,
        vm: 0,
      });
    }

    return shiftDataDetails;
  };

  const getWorkShiftData = () => {
    let shiftTableModel: ShiftTableBodyModel[] = [];
    workShifts.forEach((value, index) => {
      const item: ShiftTableBodyModel = {
        workShift: value,
        data: shiftDataDetails(),
      };
      shiftTableModel.push(item);
    });
    return shiftTableModel;
  };

  const getScheduleDayTableHeader = () => {
    let _item: ScheduleDayTableHeaderModel[] = [];
    for (let i = 0; i < 7; i++) {
      _item.push({
        weekday: "",
        day: "",
        actualRevenue: 0, //doanh thu thực tế 1 ngày
        dailyPlan: 0, //kế hoạch ngày
        fixedHours: 0, //giờ công định mức
        fixedHoursTotal: 0, //tổng giờ công định mức
        overtimeHours: 0, //Giờ công dư
      });
    }

    return _item;
  };

  const shiftData = getWorkShiftData();
  const scheduleDayTableHeader = getScheduleDayTableHeader();
  console.log("workShifts", workShifts);

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
        <table className="rules rules-sticky" style={{ width: 300 * shiftDataDetails().length }}>
          <colgroup>
            <col style={{ width: "120px" }}></col>
            {scheduleDayTableHeader.map((value1, index) => {
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
                      <div className="fw-400">Thứ 2</div>
                      <div className="fw-600">17</div>
                    </div>
                  </th>
                  <th className="condition" hidden>
                    title 3
                  </th>
                </>
              ))}
            </tr>
            <tr>
              <th className="condition" rowSpan={2}>
                {/* title 4 */}
              </th>
              {scheduleDayTableHeader.map((value1) => (
                <>
                  <th className="condition" colSpan={2}>
                    <div className="header">
                      <div className="fw-400 fz-12">Doanh thu thực tế / kế hoạch ngày</div>
                      <div className="fw-600 dark-blue">0 / 30.000.000</div>
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
                      <div className="fw-600 dark-blue">0 / 60h</div>
                    </div>
                  </th>
                  <th className="condition">
                    <div className="header">
                      <div className="fw-400 fz-12">Giờ công dư</div>
                      <div className="fw-600 lime-green">60h</div>
                    </div>
                  </th>
                </>
              ))}
            </tr>
          </thead>
        </table>

        <table className="rules" style={{ width: 300 * shiftDataDetails().length }}>
          <colgroup>
            <col style={{ width: "120px" }}></col>
            {shiftDataDetails().map((value1, index) => {
              return (
                <>
                  <col style={{ width: "200px" }}></col>
                  <col style={{ width: "200px" }}></col>
                </>
              );
            })}
          </colgroup>
          <tbody>
            {shiftData.map((value, index) => (
              <>
                <tr key={`${index}1`}>
                  <td className="condition" rowSpan={3}>
                    <div className="shift-view">
                      <span className="shift-view-ca">{value.workShift.name}</span>
                      <span className="shift-view-time">
                        {value.workShift.formHours}h-{value.workShift.toHours}h
                      </span>
                    </div>
                  </td>

                  {value.data.map((value1) => (
                    <>
                      <td className="condition" colSpan={2}>
                        {/* body 2 */}
                        <div className="revenue">
                          <DollarCircleOutlined className="revenue-icon yellow-gold" />
                          <div className="revenue-text">0/2.143.000</div>
                        </div>
                      </td>
                      <td className="condition" hidden>
                        body 3
                      </td>
                    </>
                  ))}
                </tr>
                <tr key={`${index}2`}>
                  {value.data.map((value1) => (
                    <>
                      <td className="condition" hidden>
                        body 4
                      </td>
                      <td className="condition">
                        <div className="shift-plan">
                          <ClockCircleOutlined className="shift-plan-icon yellow-gold" />
                          <div className="shift-plan-text fw-600">0/10h</div>
                        </div>
                      </td>
                      <td className="condition">
                        <div className="shift-plan">
                          <UserGroupCustomOutlined />
                          <div className="shift-plan-text fw-600">0/10</div>
                        </div>
                      </td>
                    </>
                  ))}
                </tr>
                <tr key={`${index}3`}>
                  {value.data.map((value1) => (
                    <>
                      <td className="condition" hidden>
                        body 4
                      </td>
                      <td className="condition" colSpan={2}>
                        {/* body 5 */}
                        <Space direction="vertical" size="small" style={{ display: "flex" }}>
                          {shiftPlanDetail("CHT", 1)}
                          {shiftPlanDetail("CGTV", 4)}
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
